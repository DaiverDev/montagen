# Architecture and Stack

## Overview

A single **local server (Node.js)** is the source of truth for the project. The UI (browser) and the agent (CLI/MCP) talk to the same server via the same API — they never write to the project file directly.

```
Browser UI (human)  ─┐
                      ├─→ State & commands ──→ Project file (.json on disk)
CLI / MCP (agent)   ──┘        │
                                 ├─→ Asset pipeline   (keyframe index, waveforms)
                                 └─→ Export queue      (deferred — see below)
```

- **State & commands**: project state in memory, applies commands (via Immer), maintains the undo/redo log, persists to disk atomically, and pushes diffs to the UI via WebSocket.
- **Asset pipeline**: upon importing a video, runs `ffprobe` to index I-frames and generate the audio waveform; caches the result by file hash, without duplicating the original.
- **Export queue**: deferred (see section at the end). Not implemented at this stage.

## The render engine is a separate package, free of DOM or Node dependencies

`seek(t)` lives in a pure TypeScript package (`packages/core`): given the project DSL and a time `t`, it produces a render tree (a list of `{clipId, transform, opacity, zIndex, mediaTime}`). It does not import anything from the DOM or Node — it is snapshot-testable without opening a browser, and is reused identically in the preview (browser) as in a future headless export.

A separate **adapter** takes that render tree and writes it as inline styles onto real DOM elements. This separation ensures that when export is implemented, the DOM adapter can be replaced with one that draws on an offscreen canvas without touching the engine.

## The player has three modes — this is critical now

See `docs/REQUIREMENTS.md#6`. Technical summary:

| Mode | How `t` advances | Needs audio | Priority |
|---|---|---|---|
| Scrub | Manual, arbitrary seek | No (or best-effort) | Early phase |
| **Play** | `requestAnimationFrame`, real-time | **Yes, synchronized** | **Critical now** |
| Export | Frame-by-frame, deterministic | Offline (FFmpeg) | Deferred |

**Play** mode functions as the temporary "export" mechanism today (via screen recording with OBS), meaning its audio/video synchronization quality is non-negotiable, even if the rest of the tool is still in its early stages.

Play implementation: a master clock (`performance.now()` relative to playback start) that calls `seek(t)` for visuals on each `requestAnimationFrame` frame, and separately commands native `<video>`/`<audio>` elements (for clips with their own audio) to play/pause/seek to stay aligned with that clock. Audio from separate tracks (music, voice-over) is mixed live using the Web Audio API (`GainNode` per clip, based on DSL mute/volume) — FFmpeg is not required for this, as it runs entirely in the browser in real time.

This component is independent of the `seek(t)` engine — it lives in its own module (`packages/player`), because it mixes two clocks (the purely mathematical clock of `seek(t)` and the real clocks of actual `<video>`/`<audio>` elements, which have their own buffering/decoding latency).

## 60 FPS rule in the DOM adapter

- Only `transform` (`translate3d`, `scale`, `rotate`) and `opacity` in each frame — never `top`/`left`/`width`/`height`.
- `will-change: transform, opacity` on clip containers to force GPU layering.
- Zero `offsetWidth`/`getBoundingClientRect` reads inside the render loop — all geometry is calculated mathematically in JS beforehand.

This rule is doubly important now: if the preview does not run smoothly, the OBS recording will have jank, and that *is* the final video output as long as real export is not implemented.

## Stack by layer

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript across the monorepo | Single DSL type shared among server, core, UI, CLI, and MCP |
| DSL Schema | Zod (`packages/schema`) | Validates at runtime and generates TS types (`z.infer`); also used to generate the JSON Schema exposed by MCP |
| Render Engine | Pure TS package, no DOM/Node | Snapshot testable; reusable in preview and future export |
| Player (Play Mode) | Dedicated module, `requestAnimationFrame` + Web Audio API | Synchronizes the engine's mathematical clock with the real clock of the `<video>`/`<audio>` elements |
| Server | Node.js + Fastify | Lightweight, native WebSocket support via plugin, fast startup for a local process |
| Protocol | JSON-RPC 2.0 over HTTP (CLI/MCP) and WebSocket (UI, state push) | Single command contract for all three consumers; each method maps 1:1 to an MCP tool |
| State & Commands | Immer (immutable patches) + command log on the server | Patches are used for undo/redo and the diff pushed via WebSocket |
| Persistence | Atomic writes (tmp file + rename), debounced | Avoids project corruption if the process dies mid-write |
| UI Shell | React | Timeline, inspector, panels |
| Preview Renderer | **Without React** for the clip tree — refs + direct `style` manipulation | React re-rendering the clip tree on every frame breaks the 60 FPS rule |
| CLI | `commander` or `clipanion`, thin wrapper over the JSON-RPC client | No custom logic — translates flags to RPC calls |
| MCP Server | `@modelcontextprotocol/sdk`, each tool = one JSON-RPC method | JSON Schema is derived from Zod, exposing tools is almost mechanical |
| Preprocessing | `ffprobe` (I-frame indexing), cached as sidecar JSON by file hash | Without duplicating or transcoding the original |
| Packaging | pnpm workspaces (monorepo) | Shared types without publishing intermediate packages |
| Distribution | `npx <tool> serve` starts the server and opens `localhost:PORT` in the browser | Electron-free — UI runs in a standard browser, as requested |

## Export — deferred

When resumed (out of the current scope), the plan remains as previously defined: headless Puppeteer runs `seek(t)` frame-by-frame, capturing each frame and piping it to FFmpeg; audio is mixed separately using an FFmpeg filtergraph (`volume`, `adelay`, `amix`) and muxed at the end. None of this is implemented yet — it is documented here to preserve the decision, but should not block or influence the work on the current phases other than keeping the `seek(t)` engine decoupled from the DOM (which is already a requirement on its own).

Risks to prototype when resumed (not now): real speed of `page.screenshot()` per frame in Puppeteer, and whether it is worth migrating to WebCodecs for frame-exact scrubbing.
