# Requirements

**Headless export is deferred**; the immediate focus is on composition (editing) and a reliable live playback, since the temporary export solution is to record the screen with OBS while the project plays in the browser.

## 1. General Scope

- Core: DSL + render engine (`seek(t)`) + state server + UI + CLI/MCP.
- A single aspect ratio/resolution per project, fixed at creation. Presets: 1080x1920, 1920x1080, 1080x1080. No adaptive layout (future versions).
- FPS: configurable 24/30(default)/60.
- Renderer: DOM, not Canvas.
- **Real export (headless mp4) deferred.** See Section 8.

## 2. Source of Truth and Editing Flow

- The DSL (JSON) **is** the project file.
- A single local server (long-running process) is the only one writing to that file. The UI and the agent (CLI/MCP) edit the project exclusively through the server's API — they never touch the JSON on disk directly.
- UI and agent have **the same priority**: neither is the "primary mode" and the other secondary. Both must be able to create/edit a complete project without the other.
- The server pushes state changes to the UI in real time (WebSocket) so that edits made by the agent appear without refreshing.
- Undo/redo is at the command level, lives on the server (not in the UI), and is shared — an undo reverts the last command regardless of whether it was issued by a human or an agent.

## 3. Supported Asset Types

**Import:**
- Video: MP4, MOV, WebM, MKV
- Audio: MP3, WAV, AAC
- Images: JPG, PNG, WebP, GIF, SVG
- Text (content + font + style)
- Shape / solid color

**Preprocessing when importing a video clip:**
- An **index of keyframes/I-frames** is generated (via `ffprobe`) to accelerate scrubbing in the preview. The original file is not duplicated or transcoded.
- This index is a **preview** optimization, not an export requirement (headless export, when it exists, decodes sequentially and does not need random access).
- No low-resolution proxies in this stage — we will evaluate later if scrubbing in practice requires it.

## 4. Animation

- Free keyframe engine for `position (x,y)`, `scale`, `rotation`, `opacity`.
- Standard easing: linear, ease-in, ease-out, ease-in-out. Custom cubic-bezier will be evaluated after having the base engine working.
- Presets (fade, slide, zoom) are predefined keyframe sequences running on the same engine, not a separate system.
- Transitions between clips: **cut** first (phase 1). **Cross-dissolve** is added in a later phase, because it involves composing two clips (and their audio) simultaneously — which is non-trivial and does not block starting to edit.

## 5. Multi-track

**Tracks:** unlimited count. Visual z-order = vertical order in the UI (top = front). No clip can overlap with another on the same track.

**Video:**
- The embedded audio of a video clip is treated as its own virtual track per clip, with mute/volume control independent of the audio from separate audio tracks.

**Audio:**
- Minimal editing: mute / volume (up/down), static per clip (no volume automation over time for now).

## 6. Playback — the player has three modes, not one

This point is critical because the temporary export depends on it.

1. **Scrub** — seek to an arbitrary time `t`, selected by the user on the timeline. Only needs visual correctness; audio can sound choppy or not play at all.
2. **Play** — real-time playback. Advances `t` with the real clock (not frame-by-frame deterministic), and **must sound good and be synchronized with the visuals**, because this is what OBS will record. This involves orchestrating the browser's native `<video>`/`<audio>` elements (or Web Audio API to mix volume/mute live) against a master clock.
3. **Export (deferred)** — deterministic frame-by-frame traversal, out of scope for now.

Play mode with synchronized audio is an early-phase requirement, not a "final polish" item.

## 7. DOM Rendering Rules (60 FPS)

- Only `transform` (`translate3d`, `scale`, `rotate`) and `opacity` in the render loop. Never `top`/`left`/`width`/`height`.
- `will-change: transform, opacity` (or `translateZ(0)`) on clip containers to force composition layers in GPU.
- Zero geometric reads from the DOM (`offsetWidth`, `getBoundingClientRect`, etc.) within the `seek(t)` flow. All geometry is calculated mathematically in JS.
- Unidirectional architecture: `t → state in JS (seek) → adapter → DOM styles → GPU`. The engine logic is unaware of the DOM; the adapter is the only thing touching it.

## 8. Export — deferred, not removed

Explicitly out of scope until composition is solid and tested:

- Headless pipeline (Puppeteer + FFmpeg, frame-by-frame capture).
- Offline audio mixing via FFmpeg filter graph.
- Final mux of video + audio.

**Temporary solution**: play the project in Play mode (Section 6) and record screen + audio with OBS Studio. This is acceptable as a workflow while composition is being tested, and does not block starting to use the tool.

## 9. Interfaces

- **DSL**: JSON document, `schemaVersion` from day 1 (see `DSL_SPEC.md`).
- **Programmatic API (JSON-RPC)**: create/edit/query project, tracks, clips, keyframes. It is the sole write point of the project — used by both the UI and CLI/MCP.
- **CLI**: thin wrapper over the API, for direct agent use from the terminal.
- **MCP**: each API method exposed as a tool, allowing an AI agent to operate the project without using the UI.
- **Minimal UI**: preview (scrub/play modes) + timeline with basic manual editing (move, trim, reorder clips) + property/keyframe inspector. It is not the focus of effort in this stage beyond what is necessary to test composition.

## 10. Explicitly Out of Scope (for now)

- Real headless export (Section 8).
- Changing aspect ratio within the same project (adaptive layout).
- Asset generation (image, video, voice, music).
- Multi-user real-time collaboration.
- Automatic subtitles / voice recognition.
- Masks.
- Video proxies for preview.
- Transitions beyond cut and cross-dissolve.
