import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { branchSlug, previewHtml, publishAssets, rawBase } from "./pr.mjs";

const git = (cwd, ...args) =>
	execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function fixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "pr-test-"));
	const remote = path.join(root, "remote.git");
	const repo = path.join(root, "repo");
	git(root, "init", "-q", "--bare", "-b", "main", remote);
	git(root, "init", "-q", "-b", "main", repo);
	git(repo, "config", "user.email", "test@example.com");
	git(repo, "config", "user.name", "Test");
	fs.writeFileSync(path.join(repo, "app.txt"), "app\n");
	git(repo, "add", "app.txt");
	git(repo, "commit", "-q", "-m", "init");
	git(repo, "remote", "add", "origin", remote);
	git(repo, "push", "-q", "origin", "main");
	git(repo, "switch", "-q", "-c", "feat/x");
	const png = (name, bytes) => {
		const file = path.join(root, name);
		fs.writeFileSync(file, Buffer.from(bytes));
		return file;
	};
	return { root, remote, repo, png };
}

test("parses ssh and https remotes", () => {
	const expected = "https://raw.githubusercontent.com/mira-ahead/mira";
	assert.equal(rawBase("git@github.com:mira-ahead/mira.git"), expected);
	assert.equal(rawBase("https://github.com/mira-ahead/mira.git"), expected);
	assert.equal(rawBase("https://github.com/mira-ahead/mira"), expected);
	assert.throws(() => rawBase("https://gitlab.com/a/b.git"));
	assert.equal(branchSlug("feat/mira-shadcn-theme"), "feat-mira-shadcn-theme");
});

test("creates pr-assets as an orphan", () => {
	const { remote, repo, png } = fixture();
	const file = png("a.png", [1, 2, 3]);
	const { sha, paths } = publishAssets({
		repoDir: repo,
		branch: "feat/x",
		files: [file],
	});
	assert.deepEqual(paths, ["feat-x/a.png"]);
	assert.equal(git(remote, "rev-list", "--count", sha), "1");
	const stored = execFileSync("git", ["show", `${sha}:feat-x/a.png`], {
		cwd: remote,
	});
	assert.deepEqual([...stored], [1, 2, 3]);
	assert.equal(git(remote, "rev-parse", "pr-assets"), sha);
});

test("republish keeps old commit", () => {
	const { remote, repo, png } = fixture();
	const first = publishAssets({
		repoDir: repo,
		branch: "feat/x",
		files: [png("a.png", [1])],
	}).sha;
	const second = publishAssets({
		repoDir: repo,
		branch: "feat/x",
		files: [png("a.png", [2])],
	}).sha;
	assert.notEqual(first, second);
	assert.equal(git(remote, "rev-parse", `${second}^`), first);
	const old = execFileSync("git", ["show", `${first}:feat-x/a.png`], {
		cwd: remote,
	});
	assert.deepEqual([...old], [1]);
});

test("leaves the working branch untouched", () => {
	const { repo, png } = fixture();
	fs.writeFileSync(path.join(repo, "wip.txt"), "uncommitted\n");
	const before = {
		branch: git(repo, "branch", "--show-current"),
		head: git(repo, "rev-parse", "HEAD"),
		status: git(repo, "status", "--porcelain"),
		worktrees: git(repo, "worktree", "list"),
	};
	publishAssets({
		repoDir: repo,
		branch: "feat/x",
		files: [png("a.png", [9])],
	});
	assert.deepEqual(
		{
			branch: git(repo, "branch", "--show-current"),
			head: git(repo, "rev-parse", "HEAD"),
			status: git(repo, "status", "--porcelain"),
			worktrees: git(repo, "worktree", "list"),
		},
		before,
	);
});

test("preview looks like the PR page", () => {
	const html = previewHtml({
		title: "feat: add <thing>",
		bodyHtml: "<h2>Context</h2>",
		branch: "feat/x",
		commits: 3,
	});
	assert.match(html, /<title>feat: add &lt;thing&gt;<\/title>/);
	assert.match(
		html,
		/wants to merge 3 commits into <code>main<\/code> from <code>feat\/x<\/code>/,
	);
	assert.match(html, /<div class="markdown-body"><h2>Context<\/h2><\/div>/);
	assert.match(html, /github-markdown-light/);
});
