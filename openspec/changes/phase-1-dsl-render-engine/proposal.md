## Why

Montagen is a local video editor, but its core engine doesn't exist yet. Before we can import assets, assemble a timeline, or preview anything, we need the foundational DSL types and a deterministic render engine that answers the question: "what should the screen look like at time t?" This is the contract every other layer (server, player, UI, CLI, MCP) builds on — doing it now, purely and testably, prevents rework across all later phases.

## What Changes

- **New package content in `packages/schema`**: Zod schemas for the full DSL — `ProjectFile`, `Track` (video/audio discriminated union), `VisualClip` (with kind discrimination: video/image/text/shape), `AudioClip`, `TransformState`, `KeyframeTrack`, `Asset`. These schemas are the single source of truth for the project format, from which TypeScript types are derived via `z.infer`.
- **New package content in `packages/core`**: Four standard easing functions (linear, ease-in, ease-out, ease-in-out) implemented as pure math, a keyframe interpolation resolver that handles partial keyframe values and edge cases (before-first, after-last, single keyframe, no keyframes), and a `seek(t)` function that consumes a `ProjectFile` and returns a flat render tree — `{clipId, transform, opacity, zIndex, mediaTime}[]`.
- **No DOM or Node dependencies in core**: `seek(t)` is pure and deterministic — snapshot-testable without a browser.
- **All code is TDD**: tests written first (failing), then implementation. Tests use Vitest with inline snapshots for render tree validation.

## Capabilities

### New Capabilities

- `dsl-schema`: Zod schemas defining every shape in the project DSL — ProjectFile, Track, VisualClip, AudioClip, TransformState, KeyframeTrack, and Asset. Schema is the single source of truth; TS types are derived, not hand-written.
- `render-engine`: Pure-TypeScript engine that takes a ProjectFile and a time t and produces a render tree. Includes easing functions, keyframe interpolation with partial keyframe support, and clip visibility/time resolution.

### Modified Capabilities

_None — this is the first implementation._

## Impact

- **Affected packages**: `packages/schema` (full DSL Zod schemas, exports TS types), `packages/core` (easing, interpolation, seek(t))
- **Dependencies**: `packages/schema` depends on `zod` (already installed); `packages/core` depends on `@montagen/schema` (already configured)
- **No API changes**: no breaking changes (nothing exists yet)
- **Test infrastructure**: Vitest is already configured per-package and at root
