## Context

Phase 0 delivered a working monorepo with 7 scaffolded packages, shared TypeScript config, Biome linting, and Vitest. `packages/schema` exports a placeholder `SCHEMA_VERSION`; `packages/core` exports a placeholder `hello()`. This design fills both packages with the DSL schemas and render engine defined in `docs/DSL_SPEC.md`.

Constraints: `packages/core` must remain pure TypeScript — no DOM, no Node, no side effects. Time is in seconds (float). Zod v4.4.3 is installed.

## Goals / Non-Goals

**Goals:**
- Complete Zod schemas for all DSL types (ProjectFile, Track, VisualClip, AudioClip, TransformState, KeyframeTrack, Asset)
- Four easing functions as pure math
- Robust keyframe interpolation with partial values and edge cases
- `seek(t)` producing a deterministic render tree
- Snapshot tests covering real fixture projects

**Non-Goals:**
- cubicBezier easing evaluation (type in schema, marked as deferred)
- Clip overlap validation (server-side concern per open decision in DSL_SPEC.md)
- Asset preprocessing, waveform generation, I-frame indexing
- Any DOM adapter or player code
- Cross-dissolve transitions (only "cut" in schema)

## Decisions

### 1. File structure in each package

```
packages/schema/src/
  index.ts          — re-exports everything
  project.ts        — ProjectFile, Asset, resolution, fps
  clip.ts           — VisualClip (discriminated union), AudioClip, AssetRef
  track.ts          — Track (discriminated union), TrackBase
  transform.ts      — TransformState, KeyframeTrack, Easing

packages/core/src/
  index.ts          — re-exports everything
  easing.ts         — easing functions
  keyframes.ts      — keyframe value resolver
  seek.ts           — seek(t) → RenderTree[]
  types.ts          — RenderTreeItem type
```

**Rationale**: One file per domain concept, not a single file per package. Easier to navigate and test. Index barrel re-exports keep the public API clean.

### 2. ID format: `crypto.randomUUID()`

Use Bun's built-in `crypto.randomUUID()` for generated IDs. Zero dependencies. The schema accepts any string for `id` fields (not validated as UUID — the server generates them; re-imported projects may use any format).

**Alternatives considered**: nanoid (extra dep, no benefit over built-in), uuid (extra dep, same output as `crypto.randomUUID()`). Both rejected as unnecessary.

### 3. Zod discriminated union pattern for kind/type

Zod v4 `z.discriminatedUnion("kind", [...variants])` for VisualClip (video/image/text/shape) and Track (video/audio). Each variant is a full object schema — Zod selects the correct one based on the discriminator value at runtime.

```ts
const VisualClip = z.discriminatedUnion("kind", [
  VideoClipSchema,
  ImageClipSchema,
  TextClipSchema,
  ShapeClipSchema,
]);
```

### 4. Partial keyframes — per-property interpolation

Each keyframe's `value` is `Partial<TransformState>`. During interpolation, each property is resolved independently:

```
for each property p in TransformState:
  find last keyframe at or before t that defines p  → prev value
  find first keyframe after t that defines p        → next value
  if both found: interpolate using prev keyframe's easing
  if only prev: return prev value
  if only next: return next value
  if none: return identity default
```

This means a keyframe that only sets `{x: 100, easing: "ease-in"}` only drives the `x` property — scale, rotation, etc. continue from wherever they last were defined, or default to identity.

### 5. Identity transform constant

The default TransformState (used when a clip has no keyframes or a property was never defined) is:

```ts
const IDENTITY: TransformState = { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 };
```

### 6. Easing function map

Easing functions are stored in a `Record<string, EasingFn>` where the key is the easing name. The resolver looks up by `keyframe.easing` (string) or `keyframe.easing.cubicBezier` (deferred — currently a no-op).

```ts
type EasingFn = (t: number) => number;

const easings: Record<string, EasingFn> = {
  "linear": (t) => t,
  "ease-in": (t) => t * t * t,
  "ease-out": (t) => 1 - Math.pow(1 - t, 3),
  "ease-in-out": (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};
```

### 7. zIndex computation

Track index maps directly to zIndex — the last track (highest index) is visually on top. Since tracks array index 0 is the bottom, `zIndex = trackIndex`.

### 8. seek(t) algorithm

```
function seek(project: ProjectFile, t: number): RenderTreeItem[] {
  const result: RenderTreeItem[] = [];
  for (const [trackIndex, track] of project.tracks.entries()) {
    for (const clip of track.clips) {
      if (clip.start <= t && t < clip.end) {
        const transform = resolveKeyframes(clip.transform, t - clip.start);
        result.push({
          clipId: clip.id,
          transform,
          opacity: transform.opacity,
          zIndex: trackIndex,
          mediaTime: t - clip.start,
        });
      }
    }
  }
  return result;
}
```

Opacity is both in `transform.opacity` (from keyframes) and as a top-level `opacity` field on `RenderTreeItem` — the top-level field is the rendered value consumed by the DOM adapter without needing to destructure `transform`.

### 9. Numeric constraints

- `scale`: `z.number().min(0)` — non-negative
- `opacity`: `z.number().min(0).max(1)` — clamped to 0..1 range
- `volume`: `z.number().min(0).max(1)` — same range
- `rotation`: unbounded (cumulative rotations are valid)

### 10. cubicBezier in schema only

The Easing type includes `{ cubicBezier: [number, number, number, number] }` in the Zod schema but the easing resolver treats it as a no-op (falls through to linear or throws). This keeps the schema forward-compatible without implementing the Bezier solver yet — that adds complexity (Newton-Raphson or lookup table) better deferred to when cross-dissolve is implemented.

## Risks / Trade-offs

- **Zod v4 API stability**: Zod 4.4.3 may have subtle API differences from v3 docs. Mitigation: test the schema validation immediately, not just type-checking. If `z.discriminatedUnion` behaves differently, fall back to `z.union` with `.refine()`.
- **Partial keyframe correctness**: The per-property independent resolution might surprise users who expect a keyframe that sets `{x: 100}` to also "snap" other properties. Mitigation: this is documented in the DSL spec — it's intentional, not a bug. The alternative (keyframe is always a complete snapshot) makes animation editing cumbersome.
- **Cubic bezier deferred**: If the easing map key is a `cubicBezier` object rather than a string, the lookup can't be a simple `Record<string, EasingFn>`. Mitigation: extract the easing key as a string representation and only handle string-based easings now. Add cubicBezier lookup later with a `Map` or serialized key.
