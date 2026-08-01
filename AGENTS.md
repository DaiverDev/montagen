# Agent Context

You are working on a local video editor. This file is your entry point — also read the linked documents before writing code, especially if you are going to touch the render engine, the state server, or the DSL.

## What we are building right now

**Composition**, not export. The current scope is: DSL + render engine (`seek(t)`) + state server + preview/timeline UI + CLI/MCP. Headless export (Puppeteer + FFmpeg) is **out of scope until further notice** — see `docs/ARCHITECTURE.md#deferred-export`.

**Temporary export solution**: the user plays the project in Play mode inside the browser and records screen + audio with OBS Studio. This has a direct consequence for you: **live playback with synchronized audio (Play mode) is a critical path**, not a minor detail to be implemented "later". Without it, there is no way to export anything.

## Non-negotiable rules

1. **The server is the only source of truth for writing to the project.** Neither the UI nor the CLI/MCP write the DSL file directly — everything goes through the server's API (JSON-RPC), which applies the command, updates the in-memory state, and persists. See `docs/ARCHITECTURE.md`.
2. **`seek(t)` is pure and deterministic.** It lives in a package without DOM or Node dependencies. Do not add external state readings, timers, or I/O to it. If you need external data (e.g., duration of an asset), resolve that before calling `seek(t)`, not inside.
3. **60 FPS rule in the DOM renderer**: only `transform` and `opacity` in the render loop. Never `top`/`left`/`width`/`height`. Never read `getBoundingClientRect`, `offsetWidth`, etc. inside `seek(t)` or the adapter that consumes it.
4. **The preview player DOES NOT use React's render cycle** for the clip tree. React handles the app's chrome (timeline, panels, inspector); the player writes styles directly via ref, in a `requestAnimationFrame` loop.
5. **DSL types and validation live in Zod**, in a single place (`packages/schema`), consumed by everything else (server, core, UI, CLI, MCP). Do not duplicate interfaces manually in another package.
6. **Any operation on the project must be reversible** (undo/redo lives on the server, based on commands, not in the UI).

## Reference documents

- `docs/REQUIREMENTS.md` — functional scope, what is in and out of the current MVP
- `docs/ARCHITECTURE.md` — layers, chosen stack and why, component diagram
- `docs/DSL_SPEC.md` — project shape (schema v0.1, evolves as implemented)
- `docs/TASKS.md` — implementation phases, in order. **Work in order**, each phase assumes that the previous one exists and works. Do not jump to the UI if the core engine does not have tests passing yet.

## How to work

- Each phase of `docs/TASKS.md` has to end in something the user can test by hand (not just tests). The user wants to iterate quickly and see results, not a perfect architecture with nothing running.
- If you find an ambiguity in the DSL while implementing, do not resolve it in silence: update `docs/DSL_SPEC.md` with the decision and a note explaining why, in the same commit/PR.
- Prefer to simplify the scope of a phase rather than getting blocked by a big design decision. If something requires a decision that changes the stack or architecture, mark it and continue with what is clear — don't overthink it.
