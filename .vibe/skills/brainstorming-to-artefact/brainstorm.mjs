#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findChrome() {
	return (
		process.env.CHROME_PATH ||
		[
			"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
			"/usr/bin/google-chrome",
			"/usr/bin/chromium",
		].find((p) => fs.existsSync(p))
	);
}

async function launch(chromePath) {
	const profile = fs.mkdtempSync(path.join(os.tmpdir(), "brainstorm-"));
	const proc = spawn(
		chromePath,
		[
			"--headless=new",
			"--hide-scrollbars",
			"--no-first-run",
			"--no-default-browser-check",
			"--use-angle=swiftshader",
			"--enable-unsafe-swiftshader",
			"--remote-debugging-port=0",
			`--user-data-dir=${profile}`,
			"about:blank",
		],
		{ stdio: "ignore" },
	);
	const portFile = path.join(profile, "DevToolsActivePort");
	for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await sleep(100);
	const port = fs.readFileSync(portFile, "utf8").split("\n")[0];
	const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
	const ws = new WebSocket(
		targets.find((t) => t.type === "page").webSocketDebuggerUrl,
	);
	await new Promise((res, rej) => {
		ws.onopen = res;
		ws.onerror = rej;
	});
	let id = 0;
	const pending = new Map();
	const waiters = [];
	ws.onmessage = (m) => {
		const msg = JSON.parse(m.data);
		if (msg.id && pending.has(msg.id)) {
			const { res, rej } = pending.get(msg.id);
			pending.delete(msg.id);
			msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
		} else if (msg.method) {
			for (const w of waiters.splice(0)) w(msg);
		}
	};
	const send = (method, params = {}) =>
		new Promise((res, rej) => {
			pending.set(++id, { res, rej });
			ws.send(JSON.stringify({ id, method, params }));
		});
	const once = (method, timeout) =>
		new Promise((res) => {
			const t = setTimeout(res, timeout);
			const check = (msg) =>
				msg.method === method ? (clearTimeout(t), res()) : waiters.push(check);
			waiters.push(check);
		});
	const close = async () => {
		ws.close();
		const exited = new Promise((r) => proc.once("exit", r));
		proc.kill();
		await exited;
		try {
			fs.rmSync(profile, {
				recursive: true,
				force: true,
				maxRetries: 5,
				retryDelay: 200,
			});
		} catch {}
	};
	return { send, once, close };
}

export async function captureShots(shots, outDir) {
	const todo = shots.filter((s) => s.url);
	if (!todo.length) return 0;
	const chromePath = findChrome();
	if (!chromePath) {
		console.error("Chrome not found. Set CHROME_PATH, or skip the shots.");
		return 1;
	}
	fs.mkdirSync(outDir, { recursive: true });
	const cdp = await launch(chromePath);
	await cdp.send("Page.enable");
	let failed = 0;
	for (const s of todo) {
		if (!/^[\w-]+$/.test(s.name || "")) {
			console.error(
				`skip: shot name "${s.name}" must be letters, digits, - or _`,
			);
			failed++;
			continue;
		}
		const [width, height] = String(s.size || "1280x800")
			.split("x")
			.map(Number);
		try {
			// Device metrics instead of --window-size: headless Chrome won't size a window below ~500px.
			await cdp.send("Emulation.setDeviceMetricsOverride", {
				width,
				height,
				deviceScaleFactor: s.scale || 2,
				mobile: width < 768,
			});
			const loaded = cdp.once("Page.loadEventFired", 30000);
			await cdp.send("Page.navigate", { url: s.url });
			await loaded;
			await sleep(s.wait ?? 1500);
			if (s.eval) {
				await cdp.send("Runtime.evaluate", {
					expression: s.eval,
					awaitPromise: true,
				});
				await sleep(s.evalWait ?? 800);
			}
			const { data: png } = await cdp.send("Page.captureScreenshot", {
				format: "png",
			});
			fs.writeFileSync(
				path.join(outDir, `${s.name}.png`),
				Buffer.from(png, "base64"),
			);
			console.log(`shot ok    ${s.name}  ${width}x${height}  ${s.url}`);
		} catch (e) {
			failed++;
			console.error(`shot fail  ${s.name}  ${s.url}  ${e.message}`);
		}
	}
	await cdp.close();
	return failed;
}

function dataUri(file) {
	const type = path
		.extname(file)
		.slice(1)
		.replace("jpg", "jpeg")
		.replace("svg", "svg+xml");
	return `data:image/${type};base64,${fs.readFileSync(file).toString("base64")}`;
}

function build(dir, data) {
	const out = structuredClone(data);
	const proposal = out.proposal || {};
	const images = [
		...(proposal.shots || []).map((s) => [s, s.file || `shots/${s.name}.png`]),
		...(proposal.items || [])
			.filter((it) => it.image)
			.map((it) => [it, it.image]),
	];
	for (const [entry, rel] of images) {
		const file = path.join(dir, rel);
		if (!fs.existsSync(file)) {
			console.error(`missing image: ${file}`);
			return 1;
		}
		entry.src = dataUri(file);
		delete entry.url;
		delete entry.eval;
	}
	const esc = (t) =>
		String(t).replace(
			/[&<>]/g,
			(c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c],
		);
	const json = JSON.stringify(out).replace(/</g, "\\u003c");
	const html = fs
		.readFileSync(path.join(import.meta.dirname, "template.html"), "utf8")
		.replace(
			"<title>Brainstorm</title>",
			`<title>${esc(out.title || "Brainstorm")}</title>`,
		)
		.replace("__BRAINSTORM_DATA__", () => json);
	const target = path.join(dir, "index.html");
	fs.writeFileSync(target, html);
	console.log(`built      ${target}  (${Math.round(html.length / 1024)} KB)`);
	return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const args = process.argv.slice(2);
	const dir = path.resolve(args.find((a) => !a.startsWith("--")) || ".");
	const data = JSON.parse(fs.readFileSync(path.join(dir, "data.json"), "utf8"));
	const shots = data.proposal?.shots || [];
	const failed = args.includes("--no-shots")
		? 0
		: await captureShots(shots, path.join(dir, "shots"));
	const buildFailed = build(dir, data);
	process.exit(failed || buildFailed ? 1 : 0);
}
