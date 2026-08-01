# Local Video Editor (working title)

A 100% local video editor, operable by both humans (browser UI) and AI agents (API / CLI / MCP), designed for content production on social media/YouTube.

This repo starts with **composition** (DSL, render engine, server, preview/timeline UI, CLI/MCP). Real (headless) export is left for a later phase — in the meantime, the way to "export" is to play the project in Play mode inside the browser and record the screen + audio using OBS Studio.

## Where to start

- **Are you an agent working on this repo?** Read [`AGENTS.md`](./AGENTS.md) first.
- **Are you human?** Read in this order:
  1. [`docs/REQUIREMENTS.md`](./docs/REQUIREMENTS.md) — what is being built and what is not (scope)
  2. [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — how it is structured, stack, decisions, and why
  3. [`docs/DSL_SPEC.md`](./docs/DSL_SPEC.md) — the project format (v0.1, live draft)
  4. [`docs/TASKS.md`](./docs/TASKS.md) — step-by-step implementation plan

## Current status

Phase 0 (monorepo bootstrap) — not started yet. See `docs/TASKS.md` for details on what to implement first.
