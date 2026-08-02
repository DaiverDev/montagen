## 1. Schema — Primitive types (`packages/schema`)

- [x] 1.1 Write tests for TransformState schema (valid, opacity range, scale non-negative)
- [x] 1.2 Implement TransformState Zod schema in `src/transform.ts`
- [x] 1.3 Write tests for Easing schema (string easings, cubicBezier object, invalid string)
- [x] 1.4 Implement Easing Zod schema in `src/transform.ts`
- [x] 1.5 Write tests for KeyframeTrack<TransformState> schema (valid keyframes, partial values, invalid easing)
- [x] 1.6 Implement KeyframeTrack Zod schema in `src/transform.ts`
- [x] 1.7 Write tests for Asset schema (valid types, invalid type, optional fields)
- [x] 1.8 Implement Asset Zod schema in `src/project.ts`
- [x] 1.9 Write tests for AssetRef schema
- [x] 1.10 Implement AssetRef Zod schema in `src/clip.ts`

## 2. Schema — Clip and Track types (`packages/schema`)

- [x] 2.1 Write tests for VisualClip discriminated union (video with embeddedAudio, image with asset, text with content, shape, missing required fields per kind)
- [x] 2.2 Implement VisualClip Zod schemas (VideoClip, ImageClip, TextClip, ShapeClip + discriminated union) in `src/clip.ts`
- [x] 2.3 Write tests for AudioClip schema (valid, volume range)
- [x] 2.4 Implement AudioClip Zod schema in `src/clip.ts`
- [x] 2.5 Write tests for Track discriminated union (video track, audio track)
- [x] 2.6 Implement Track Zod schema in `src/track.ts`

## 3. Schema — ProjectFile and exports (`packages/schema`)

- [x] 3.1 Write tests for ProjectFile schema (valid full project, invalid fps, missing schemaVersion)
- [x] 3.2 Implement ProjectFile Zod schema in `src/project.ts`
- [x] 3.3 Update `src/index.ts` to export all schemas and inferred types (ProjectFile, Track, VisualClip, AudioClip, TransformState, KeyframeTrack, Asset, etc.)
- [x] 3.4 Run tests to verify schema validation and typecheck passes

## 4. Core — Easing functions (`packages/core`)

- [x] 4.1 Write tests for linear easing (identity)
- [x] 4.2 Implement linear easing in `src/easing.ts`
- [x] 4.3 Write tests for ease-in easing (cubic acceleration, boundaries)
- [x] 4.4 Implement ease-in easing in `src/easing.ts`
- [x] 4.5 Write tests for ease-out easing (cubic deceleration, boundaries)
- [x] 4.6 Implement ease-out easing in `src/easing.ts`
- [x] 4.7 Write tests for ease-in-out easing (midpoint symmetry, boundaries)
- [x] 4.8 Implement ease-in-out easing in `src/easing.ts`

## 5. Core — Keyframe interpolation (`packages/core`)

- [x] 5.1 Write tests for keyframe resolution (interpolation between two keyframes)
- [x] 5.2 Implement keyframe value resolver in `src/keyframes.ts`
- [x] 5.3 Write tests for partial keyframe values (only x changes, other props stay at prior value or identity)
- [x] 5.4 Implement partial keyframe per-property interpolation
- [x] 5.5 Write tests for edge cases: before first keyframe, after last keyframe, single keyframe, empty track
- [x] 5.6 Implement edge case handling
- [x] 5.7 Write tests for different easings producing different curves
- [x] 5.8 Verify easing integration in keyframe resolver

## 6. Core — seek(t) function (`packages/core`)

- [x] 6.1 Write tests for RenderTreeItem type and seek(t) with single active clip (start, middle, at boundary)
- [x] 6.2 Implement seek(t) active clip resolution in `src/seek.ts` and RenderTreeItem in `src/types.ts`
- [x] 6.3 Write tests for seek(t) with empty project, time before all clips, time after all clips
- [x] 6.4 Implement edge case returns
- [x] 6.5 Write tests for seek(t) with multiple tracks (z-index ordering)
- [x] 6.6 Implement z-index from track index
- [x] 6.7 Write tests for seek(t) with keyframe-animated clips (transform + opacity in output)
- [x] 6.8 Integrate keyframe interpolation into seek(t)

## 7. Core — Snapshot tests and exports (`packages/core`)

- [x] 7.1 Create fixture: single clip with keyframe animation across its duration
- [x] 7.2 Write snapshot test: seek at t=0, t=1, t=2, compare full render tree
- [x] 7.3 Create fixture: two tracks, overlapping clips, mixed asset kinds (video + text)
- [x] 7.4 Write snapshot test: seek at multiple t values, verify z-index order
- [x] 7.5 Update `src/index.ts` to export seek, easing functions, and types
- [x] 7.6 Run full test suite (`bun test` in packages/core), verify all green
- [x] 7.7 Run typecheck from root (`bun run typecheck`), verify no errors
