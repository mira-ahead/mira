# Contributing to Mira

Contributions, feedback, and ideas are welcome. Mira is currently in active development.

## Repository layout

| Path | Purpose |
|---|---|
| `apps/server` | Hono API on Cloudflare Workers, powered by Mistral and the AI SDK |
| `apps/web` | React PWA with Vite, TanStack Router, TanStack Query and Hono RPC |
| `packages/ui` | Shared components and Mira design system (`@mira/ui`) |
| `packages/config` | Shared TypeScript configuration (`@mira/config`) |
| `ml` | Python project for Timestral forecasting, managed with uv |

## Prerequisites

- Node.js 26 (see `.nvmrc`)
- pnpm 12 (version pinned in `package.json`)
- [uv](https://docs.astral.sh/uv/) and Python 3.12 for forecasting development
- A Mistral API key when running the assistant against the real model

## Getting started

```bash
git clone https://github.com/mira-ahead/mira.git
cd mira
pnpm install
```

The installation generates typed environment files with Varlock and installs Git hooks with Husky.

### Environment variables

Each application declares its environment variables in a `.env.schema` file. Store local values in a `.env` file alongside it.

`apps/server/.env`:

```env
MISTRAL_API_KEY=your-key
```

`apps/web/.env` is optional:

```env
VITE_SERVER_URL=http://localhost:3000
VITE_CHAT_MOCK=true
```

Mock mode allows frontend development without a Mistral API key.

After updating an environment schema, regenerate its types:

```bash
pnpm env:generate
```

Never commit secrets or `.env` files containing credentials.

### Observability

Mira uses [Langfuse](https://langfuse.com) to trace AI requests,
monitor latency, token usage and errors.

To enable tracing, add the following to `apps/server/.env.local`:

```env
LANGFUSE_PUBLIC_KEY=your-public-key
LANGFUSE_SECRET_KEY=your-secret-key
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

Langfuse is optional in local development and required in production.
The application and tests work without Langfuse credentials.

### Run locally

```bash
pnpm dev
```

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the web application and API |
| `pnpm dev:web` | Start the frontend only |
| `pnpm dev:server` | Start the API only |

The web application runs on `http://localhost:5173` and the API on `http://localhost:3000`.

### Several worktrees at once

In a new git worktree, run `pnpm setup:workspace` before `pnpm dev`. It copies your `.env` and `.env.local` files from the main checkout, then writes the worktree's own API and web ports to `apps/server/.env.development` and `apps/web/.env.development`, so several worktrees can run `pnpm dev` side by side. Running it again keeps the same ports.

When you're done with a worktree, `pnpm archive:workspace` stops the servers it runs and removes it, `node_modules` and env files included. The branch stays. It refuses to run in the main checkout or with uncommitted changes.

### Forecasting

```bash
uv sync --project ml
uv run --project ml python ml/try_timestral.py
```

## Development checks

Run the following commands before submitting a pull request:

```bash
pnpm exec biome ci . --error-on-warnings
pnpm check-types
pnpm build
pnpm test
```

These checks also run automatically in GitHub Actions.

Use `pnpm check` to apply Biome formatting and automatic fixes locally.

API tests use Vitest and live alongside the source files in `apps/server`.

## Code conventions

- Follow the existing Biome and TypeScript configurations.
- Use kebab-case filenames, except where TanStack Router requires otherwise.
- Access environment variables through Varlock's generated types.
- Reuse shared UI components, design tokens and Phosphor icons.
- Keep accessibility in mind when implementing user interfaces.
- Keep changes focused and avoid unnecessary abstractions.
- Use the pnpm catalog for dependencies shared across workspaces.
- Write comments when they explain a non-obvious decision.

## Branches and commits

The core team tracks work in Linear. External contributors can use GitHub issues. Linear and Mistral Vibe are not required to contribute.

Use descriptive branch names:

```text
feat/mira-13-frontend-foundations
fix/chat-streaming
docs/contributing
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<optional scope>): <description>
```

Examples:

```text
feat(ui): add journey navigation
fix(api): handle streaming errors
ci: run tests on pull requests
docs: update setup instructions
```

Reference the corresponding Linear or GitHub issue when applicable.

## Pull requests

- Discuss significant changes in an issue before starting.
- Create a branch from `main`.
- Keep pull requests focused on a single change.
- Explain the context, changes and testing instructions.
- Include screenshots for significant visual changes.
- Ensure all CI checks pass and obtain a teammate or maintainer review.

Pull requests are squash-merged into `main` to maintain a clean, linear commit history. The pull request title becomes the final commit message.

For stacked pull requests, merge the parent first, then rebase and retarget the dependent branch.

## Writing

Documentation, issues, commits and pull requests are written in English. Keep them clear, concise and specific.