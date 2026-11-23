---
name: pull-request
description: Use when opening, writing or updating a pull request in this repo - "open the PR", "ouvre la PR", "create a pull request", "write the PR description", "update the PR".
---

# Pull request

One pull request = one branch into `main`, with a description a reviewer can trust without running the code: what we did and why, then proof. The description is always in English. Follow the `anti-slop` skill for every line.

`gh` cannot upload images. Screenshots go to the orphan branch `pr-assets` of this repo, one folder per PR branch, and the description links them with `raw.githubusercontent.com` URLs pinned to a commit, so they never change. The repo is public: so are the screenshots.

## Files

| File | Role |
|---|---|
| `pr.mjs` | `node .vibe/skills/pull-request/pr.mjs shots <dir>` captures the screens listed in `<dir>/pr.json` into `<dir>/shots/`. `node .vibe/skills/pull-request/pr.mjs preview <dir> --title "<title>"` renders `<dir>/body.md` with GitHub's own Markdown renderer into `<dir>/preview.html`, laid out like the PR page, with the local screenshots. `node .vibe/skills/pull-request/pr.mjs publish <dir>` pushes `<dir>/shots/*.png` to `pr-assets` without leaving the current branch, then replaces every `shots/<file>` in `<dir>/body.md` with its pinned URL. |
| `pr.test.mjs` | `node --test .vibe/skills/pull-request/pr.test.mjs` |

The working folder is `docs/pull-requests/<branch-slug>/` (`<branch-slug>` = branch name with `/` replaced by `-`). `docs/` is git-ignored, so drafts stay local.

## Steps

1. **Read the work.** `git log main..HEAD`, `git diff main...HEAD --stat`, then the files that matter. Read the design doc or plan in `docs/superpowers/` if one exists for this work. Look for a Linear identifier (`MIRA-12`) in the branch name and the commits.
2. **Decide on screenshots.** If the diff touches `apps/web` or `packages/ui`, the change is visible: start the dev server (`pnpm dev:web`, note the port it prints) and list the screens the change affects in `pr.json`, each in desktop `1280x800` and mobile `390x844`. Otherwise take none: prove a server change with a command and its output under "How to test".
3. **Capture.** `node .vibe/skills/pull-request/pr.mjs shots docs/pull-requests/<branch-slug>`. Open every PNG and check it shows the right state. When a state needs a click, use `eval` in the shot.
4. **Write `body.md`** in the working folder, with these headings, in this order:

   ```markdown
   ## Context
   <2-4 sentences: the problem or the goal, for whom, and why now.>

   ## What changed
   - <grouped by area: a short line per change a reviewer should know about>

   ## Screenshots
   <only when there are screenshots>
   ![<what the image shows>](shots/<name>.png)
   <one line caption: what to look at>

   ## How to test
   1. <exact commands and clicks, with the expected result>

   ## Notes
   - <decisions taken on the way, known gaps, follow-ups. Omit the section when empty.>

   Refs MIRA-12
   ```

   The `Refs` line only when an identifier was found. The title follows the commit convention: `<type>: <what changes>`, English, 72 characters max.
5. **Show the preview. Every time, no exception.**
   1. `node .vibe/skills/pull-request/pr.mjs preview docs/pull-requests/<branch-slug> --title "<title>"`.
   2. Open it for the person: inside Orca, `orca tab create --url file://<absolute path>/preview.html`; anywhere else, give the absolute path to open in a browser.
   3. Say in one line what the PR contains, then wait for an explicit ok ("ok", "yes", "go", "vas-y"). Anything else is a no: apply the requested change, rebuild the preview, open it again, and wait again. Nothing is published, pushed or created on GitHub before that ok.
6. **On ok, in this order:**
   1. `node .vibe/skills/pull-request/pr.mjs publish docs/pull-requests/<branch-slug>` (skip when there are no screenshots).
   2. `git push -u origin <branch>`.
   3. `gh pr view <branch>`: if a PR exists, `gh pr edit <branch> --title "<title>" --body-file docs/pull-requests/<branch-slug>/body.md`; otherwise `gh pr create --base main --head <branch> --title "<title>" --body-file docs/pull-requests/<branch-slug>/body.md`.
   4. Reply with the PR URL.

## pr.json

```json
{
  "shots": [
    { "name": "ui-desktop", "url": "http://localhost:5173/ui", "size": "1280x800" },
    { "name": "ui-mobile", "url": "http://localhost:5173/ui", "size": "390x844" },
    { "name": "dialog-open", "url": "http://localhost:5173/ui", "size": "1280x800", "eval": "document.querySelector('[data-slot=alert-dialog-trigger]').click()", "evalWait": 800 }
  ]
}
```

Shot options: `size` (default `1280x800`), `scale` (default 2), `wait` (ms after load, default 1500), `eval` (JS run before the capture), `evalWait` (default 800). `name` is letters, digits, `-` or `_`.

## Common mistakes

- Pushing, publishing screenshots or calling `gh pr create` before the person said ok on the preview.
- Showing the description as text in the chat instead of opening the preview.
- A "What changed" that lists files instead of changes a reviewer cares about.
- Screenshots of the wrong state, or with nothing visible changed: every image needs a caption that says what to look at.
- Committing screenshots to the PR branch: they belong on `pr-assets` only.
- A toast or an animation captured mid-transition: raise `evalWait`, then look at the PNG again.
