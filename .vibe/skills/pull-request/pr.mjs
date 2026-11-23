#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { captureShots } from "../brainstorming-to-artefact/brainstorm.mjs";

const ASSETS_BRANCH = "pr-assets";

const git = (cwd, ...args) =>
	execFileSync("git", args, {
		cwd,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	}).trim();

export function branchSlug(branch) {
	return branch.replaceAll("/", "-");
}

export function rawBase(remoteUrl) {
	const match = remoteUrl.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?\/?$/);
	if (!match) throw new Error(`Not a GitHub remote: ${remoteUrl}`);
	return `https://raw.githubusercontent.com/${match[1]}/${match[2]}`;
}

const escapeHtml = (text) =>
	String(text).replace(
		/[&<>"]/g,
		(c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
	);

export function previewHtml({ title, bodyHtml, branch, commits }) {
	const t = escapeHtml(title);
	return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown-light.min.css">
<style>
body{margin:0;background:#fff;color:#1f2328;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
.wrap{max-width:1012px;margin:0 auto;padding:24px 16px 64px}
h1.t{font-size:32px;font-weight:400;margin:0 0 8px}
.meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding-bottom:16px;border-bottom:1px solid #d1d9e0;margin-bottom:24px;color:#59636e}
.state{background:#1f883d;color:#fff;border-radius:2em;padding:5px 12px;font-weight:500}
.meta code{background:#ddf4ff;color:#0969da;border-radius:6px;padding:2px 6px;font-size:12px}
.box{border:1px solid #d1d9e0;border-radius:6px}
.box .hd{background:#f6f8fa;border-bottom:1px solid #d1d9e0;padding:8px 16px;color:#59636e;border-radius:6px 6px 0 0}
.markdown-body{padding:16px}
.markdown-body img{border:1px solid #d1d9e0;border-radius:6px}
</style></head><body><div class="wrap">
<h1 class="t">${t}</h1>
<div class="meta"><span class="state">Preview</span> wants to merge ${commits} commits into <code>main</code> from <code>${escapeHtml(branch)}</code></div>
<div class="box"><div class="hd">Description</div><div class="markdown-body">${bodyHtml}</div></div>
</div></body></html>
`;
}

function remoteHasAssets(repoDir, remote) {
	return git(repoDir, "ls-remote", "--heads", remote, ASSETS_BRANCH) !== "";
}

export function publishAssets({ repoDir, branch, files, remote = "origin" }) {
	const slug = branchSlug(branch);
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pr-assets-"));
	const worktree = path.join(tmp, "wt");
	const localRef = `refs/heads/${ASSETS_BRANCH}`;
	try {
		if (remoteHasAssets(repoDir, remote)) {
			git(repoDir, "fetch", "-q", remote, `+${localRef}:${localRef}`);
			git(repoDir, "worktree", "add", "-q", worktree, ASSETS_BRANCH);
		} else {
			git(
				repoDir,
				"worktree",
				"add",
				"-q",
				"--orphan",
				"-b",
				ASSETS_BRANCH,
				worktree,
			);
		}
		const target = path.join(worktree, slug);
		fs.mkdirSync(target, { recursive: true });
		const paths = files.map((file) => {
			const name = path.basename(file);
			fs.copyFileSync(file, path.join(target, name));
			return `${slug}/${name}`;
		});
		git(worktree, "add", "--", ...paths);
		git(worktree, "commit", "-q", "-m", `chore: screenshots for ${branch}`);
		git(worktree, "push", "-q", remote, ASSETS_BRANCH);
		return { sha: git(worktree, "rev-parse", "HEAD"), paths };
	} finally {
		try {
			git(repoDir, "worktree", "remove", "--force", worktree);
		} catch {}
		fs.rmSync(tmp, { recursive: true, force: true });
	}
}

async function shots(dir) {
	const { shots = [] } = JSON.parse(
		fs.readFileSync(path.join(dir, "pr.json"), "utf8"),
	);
	return captureShots(shots, path.join(dir, "shots"));
}

function publish(dir) {
	const repoDir = git(process.cwd(), "rev-parse", "--show-toplevel");
	const branch = git(repoDir, "branch", "--show-current");
	const shotsDir = path.join(dir, "shots");
	const files = fs.existsSync(shotsDir)
		? fs
				.readdirSync(shotsDir)
				.filter((f) => f.endsWith(".png"))
				.map((f) => path.join(shotsDir, f))
		: [];
	if (!files.length) {
		console.log("No screenshot to publish.");
		return 0;
	}
	const base = rawBase(git(repoDir, "remote", "get-url", "origin"));
	const { sha, paths } = publishAssets({ repoDir, branch, files });
	const bodyFile = path.join(dir, "body.md");
	let body = fs.readFileSync(bodyFile, "utf8");
	for (const rel of paths) {
		const url = `${base}/${sha}/${rel}`;
		body = body.replaceAll(`shots/${path.basename(rel)}`, url);
		console.log(url);
	}
	fs.writeFileSync(bodyFile, body);
	return 0;
}

function preview(dir, title) {
	if (!title) {
		console.error('Usage: node pr.mjs preview <dir> --title "<title>"');
		return 2;
	}
	const repoDir = git(process.cwd(), "rev-parse", "--show-toplevel");
	const branch = git(repoDir, "branch", "--show-current");
	const commits = Number(git(repoDir, "rev-list", "--count", "main..HEAD"));
	const bodyHtml = execFileSync(
		"gh",
		["api", "markdown", "-f", "mode=gfm", "-F", "text=@body.md"],
		{ cwd: dir, encoding: "utf8" },
	);
	const target = path.join(dir, "preview.html");
	fs.writeFileSync(target, previewHtml({ title, bodyHtml, branch, commits }));
	console.log(target);
	return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const [command, dirArg, ...rest] = process.argv.slice(2);
	const dir = path.resolve(dirArg || ".");
	const titleIndex = rest.indexOf("--title");
	const title = titleIndex === -1 ? "" : rest[titleIndex + 1];
	if (command === "shots") process.exit(await shots(dir));
	else if (command === "preview") process.exit(preview(dir, title));
	else if (command === "publish") process.exit(publish(dir));
	else {
		console.error("Usage: node pr.mjs <shots|preview|publish> <dir>");
		process.exit(2);
	}
}
