# Phase-by-Phase Implementation Plan

Order designed to reach a runnable loop as quickly as possible: import assets → assemble timeline → animate with keyframes → play with synchronized audio → record with OBS. Each phase ends with something that can be tested by hand, not just in tests.

**Work in order.** Do not jump to the UI without the core engine having its tests passing; do not jump to the CLI/MCP without the server persisting and applying undo/redo correctly.

Headless export (Puppeteer + FFmpeg) **is not in this plan** — see `ARCHITECTURE.md#deferred-export`. It will be resumed as a separate phase when decided.

---

## Phase 0 — Monorepo Bootstrap

### Goals

Establish the project foundation using a Bun-based monorepo and verify that the complete development workflow is functional before implementing any application logic.

### Tasks

* Create a Bun workspace with the following packages:

  * `packages/schema`
  * `packages/core`
  * `packages/server`
  * `packages/player`
  * `packages/ui`
  * `packages/cli`
  * `packages/mcp`
* Configure a shared TypeScript setup across all packages.
* Configure linting and formatting (Biome).
* Define root scripts for development and package management using Bun.
* Implement a minimal end-to-end application:

  * Start the local server.
  * Serve the UI in the browser.
  * Display a simple placeholder page (e.g. "Hello" or a blank application shell).
* Verify that all workspace packages resolve correctly and can be imported from one another.

### Success Criteria

* `bun install` completes successfully.
* Running the project's development command (e.g. `bun run dev`) starts the local server.
* Opening the application in the browser displays the placeholder page.
* The workspace builds without TypeScript errors.
* The repository is ready for implementing application features in subsequent phases.

**Expected deliverable:** A working Bun monorepo where a single development command starts the server and serves a minimal UI in the browser, providing a verified foundation for future development.

## Phase 1 — DSL v0.1 + Pure Render Engine

- Zod schemas for `ProjectFile`, `Track`, `VisualClip`, `AudioClip`, `KeyframeTrack`, etc. (base: `docs/DSL_SPEC.md`).
- Pure `seek(project, t)` function: interpolates keyframes (position/scale/rotation/opacity) with the 4 standard easings, returning a flat render tree.
- Snapshot tests on `seek()` with fixed sample projects (no DOM, no server).

**Expected deliverable:** `bun test` in `packages/core` passes, with cases covering interpolation for each easing and overlapping clips on different tracks.

## Phase 2 — Server: State, Commands, Persistence

- Project state in memory + command application via Immer.
- Minimum commands: `project.create`, `project.open`, `clip.add`, `clip.move`, `clip.trim`, `clip.remove`, `keyframe.set`, `track.add`, `track.remove`.
- Undo/redo based on the command log.
- Atomic persistence to the project's `.json` file (debounced after each command).
- JSON-RPC 2.0 over HTTP for these commands. WebSocket is not needed yet if testing directly via HTTP in this phase.

**Expected deliverable:** from a terminal (using curl or a script), create a project, add clips, undo, and see the resulting `.json` on disk with the correct changes.

## Phase 3 — DOM Adapter + Preview in Scrub Mode

- Adapter: render tree (from `seek()`) → real DOM elements, written via ref, respecting the 60 FPS rule (`transform`/`opacity` only, `will-change`, zero geometric readings).
- Basic asset import: video/image/text/shape are resolved to `<video>`, `<img>`, or text/shape nodes positioned by the adapter.
- Minimum UI: a timeline slider that calls `seek(t)` via WebSocket and updates the preview. No multi-track timeline yet — confirming correct visual rendering is enough.

**Expected deliverable:** move a slider and see a clip move/scale/rotate in the browser, with the keyframe animation applied correctly.

## Phase 4 — Play Mode with Synchronized Audio (Critical Path)

- `requestAnimationFrame` loop that advances `t` in real time and calls `seek(t)`.
- Orchestration of native `<video>`/`<audio>` elements (play/pause/seek) against the master clock, for clips with embedded audio.
- Live mixing of separate audio tracks with the Web Audio API (`GainNode` per clip, based on DSL mute/volume).
- Play/Pause button in the UI.

**Expected deliverable:** press Play, see and hear the project play back in real time, with no perceptible desynchronization between audio and video. **This is what will be recorded with OBS** — it is worth testing by actually recording it before marking this phase as closed.

## Phase 5 — Multi-track Timeline UI

- Visual timeline: stacked tracks, clips as draggable/trimmable/reorderable blocks.
- Scrubber synchronized with the player (moves the same `t` as Play/Scrub).
- Property inspector: edit transform and add/edit keyframes from the UI.
- No virtualization yet, unless it becomes noticeably slow during testing with real timelines.

**Expected deliverable:** assemble a short complete video by hand from scratch, without editing the JSON directly.

## Phase 6 — CLI + MCP

- CLI (`commander`/`clipanion`) as a thin wrapper around the existing JSON-RPC client.
- MCP server (`@modelcontextprotocol/sdk`) exposing the same commands as tools, with JSON Schema derived from the Zod schemas.

**Expected deliverable:** the agent builds or edits a complete project via CLI/MCP, without opening the UI, and the result looks correct when opening the UI afterward.

## Phase 7 — Asset Preprocessing + Cross-dissolve

- `ffprobe` to index I-frames of imported video, cached by file hash.
- Audio waveform generation, cached in the same way.
- Cross-dissolve transition (composition of two simultaneous clips, with audio crossfade if both have embedded audio).

**Expected deliverable:** smoother scrubbing on long clips; a cross-dissolve transition between two clips looks and sounds good in Play mode.

---

## Out of this plan (deferred)
Commit it when you're done.
- Headless export (Puppeteer + FFmpeg) and offline audio mixing.
- Video proxies for preview.
- Transitions beyond cut/cross-dissolve.
- Auto-captions, masks, adaptive layout, asset generation, multi-user collaboration — see `REQUIREMENTS.md#10`.
