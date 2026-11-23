---
name: brainstorming-to-artefact
description: Use when brainstorming or scoping a request and the person should review it in a page instead of chat - their request vs your understanding, your proposal with screenshots, and questions answered by clicking cards. Also use when someone pastes a block that starts with "Brainstorm answers" or "Create a Linear issue from this brief".
---

# Brainstorming to artefact

Turns one brainstorming round into a single self-contained HTML file, written in English: **request vs understanding, then the proposal (with screenshots), then question cards, then two copy buttons**. The person opens it in the Orca browser (or any browser), answers, and pastes the result back to the agent.

Same questions you would ask in chat: one decision per question, options you can name, your pick marked. Nothing gets built from the page alone.

## Files

| File | Role |
|---|---|
| `template.html` | The page. Never edit it per brainstorm. |
| `brainstorm.mjs` | `node brainstorm.mjs <dir>`: captures the screenshots listed in `<dir>/data.json`, then writes `<dir>/index.html` with the data and images embedded. `--no-shots` skips the capture. Node 22+, Chrome, no dependencies. |

## Steps

1. **Read first** (code, docs, what the person pointed at) so `findings` and options are grounded.
2. **Create the folder** `docs/brainstorms/<YYYY-MM-DD>-<topic>/` at the repo root (`docs/` is git-ignored: brainstorms stay local).
3. **Write `data.json`** in it (schema below).
4. **Screenshots**, when seeing helps (a screen, a layout, current vs proposed): start the dev server if a shot needs it. An image you already have goes in `shots/` and in `data.json` as `"file": "shots/x.png"`.
5. **Build**: `node .vibe/skills/brainstorming-to-artefact/brainstorm.mjs docs/brainstorms/<folder>`. It exits non-zero on a failed shot or a missing image: fix the url or drop the shot. Open each PNG in `shots/` and check it shows the right state.
6. **Open it** in the Orca browser when running inside Orca: `orca tab create --url file://<absolute path>/index.html`. Otherwise give the absolute path.
7. **Next round**: edit `data.json`, rebuild. The page keeps the person's answers per title in the browser, so keep the title.

## data.json

```json
{
  "title": "shadcn with the Mira theme in apps/web",
  "project": "mira",
  "date": "2026-11-23",
  "request": "The person's prompt, verbatim.",
  "understanding": ["What they want, for whom, why. Short sentences."],
  "findings": ["What the code or docs say that bears on the request. `code` and **bold** work."],
  "proposal": {
    "summary": "The proposal in one or two sentences.",
    "points": ["The concrete parts of the proposal."],
    "shots": [
      { "name": "home-mobile", "url": "http://localhost:3001/", "size": "390x844", "caption": "Current home screen" }
    ],
    "previewHead": "<link rel=\"stylesheet\" href=\"...fonts...\"><style>:root { --primary: #ff6600; } .btn { ... }</style>",
    "items": [
      {
        "group": "Actions",
        "title": "`button`",
        "badge": "New",
        "description": "What it is for, where it is used.",
        "html": "<div style=\"padding:20px;display:flex;gap:10px\"><button class=\"btn primary\">Plan a journey</button></div>"
      },
      { "group": "Screens", "title": "Explore, after", "image": "mockups/explore.png", "wide": true }
    ]
  },
  "questions": [
    {
      "id": "base",
      "question": "Which shadcn base?",
      "why": "What the answer changes in what gets built.",
      "multi": false,
      "options": [
        { "id": "maia", "label": "base-maia", "description": "What it means, what it costs.", "recommended": true },
        { "id": "lyra", "label": "base-lyra", "description": "..." }
      ]
    }
  ],
  "linear": {
    "type": "Feature",
    "scope": "Frontend",
    "acceptance": ["Observable, checkable behavior, phrased so it can be ticked while testing."],
    "outOfScope": ["..."]
  }
}
```

- `findings`, `proposal.shots`, `proposal.items` and `linear` are optional. `linear` feeds the "Copy for a Linear issue" brief, shaped like the `linear-issues` skeleton: `proposal.summary` becomes the TL;DR, each item a Requirements element, `linear.acceptance` the acceptance criteria, answered questions the Decisions. `type` is `Feature`, `Improvement` or `Bug`; `scope` is `Frontend` or `Backend`.
- **`proposal.items`: one example of every thing you propose to make** (each component, screen, state, email, variant). A list of names is not a proposal: the person must see each one. Each item has a `title`, optional `group` (consecutive items with the same group are shown together), `badge`, `description`, and either `html` (a live mockup) or `image` (a file in the folder, embedded at build). `wide: true` makes it span the full row.
- An `html` item renders in its own sandboxed iframe that sizes itself to its content. `previewHead` is injected into every item's `<head>`: put the shared CSS (design tokens, component classes), fonts, SVG icon defs, and any script there (run it on `DOMContentLoaded`). Build mockups from the project's real tokens so the preview looks like what will ship.
- Shot options: `size` (`390x844` for mobile, default `1280x800`), `wait` (ms after load, default 1500), `eval` (JS run before the capture to reach a state, e.g. `document.querySelector('[role=tab]:nth-child(2)').click()`), `file` instead of `url` for an existing image.
- Every question gets 2 to 4 options. The page adds an "Other" card and one details field under the cards of each question, plus a light/dark switch in the top right corner.
- Mark one option `recommended` when you have a pick. `multi: true` only when the choices are not exclusive.
- Write every field in English, whatever language the conversation is in. The only exception is `request`: the person's words, verbatim and untranslated. Follow the `anti-slop` skill for every text.

## When the person pastes back

| Pasted block starts with | Do |
|---|---|
| `Brainstorm answers`, no question marked "open" | The paste is the approval. Write the answers into the design doc as decisions (create the doc from the page if there is none yet), then go straight to the implementation plan with the plan-writing skill (`superpowers:writing-plans` when available, otherwise a plan in `docs/superpowers/plans/`). Do not ask for a separate approval of the doc. |
| `Brainstorm answers`, some questions marked "open" | Write the answered ones into the design doc, then run a new round on the open ones: update `data.json`, rebuild, reopen the page. |
| `Create a Linear issue from this brief` | Use the `linear-issues` skill with the brief as the draft issue: it asks for the project and milestone if they are missing, checks existing issues, and its skeleton, labels and writing rules win over the brief. Settle any "Still open" line first. If the work is too big for one person, propose a split there. Show the draft and wait for an explicit ok before creating anything. |

## Common mistakes

- Asking in the page what the code already answers: put it in `findings`.
- Options that are not real alternatives (one obvious winner and two strawmen).
- A screenshot of the wrong state: when the state needs a click, use `eval`, then look at the PNG.
- Editing `index.html` by hand: it is overwritten by the next build. Edit `data.json`.
