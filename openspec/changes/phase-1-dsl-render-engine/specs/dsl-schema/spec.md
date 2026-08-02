## Purpose

Defines the Zod schemas that are the single source of truth for the Montagen project DSL. Every layer (server, core engine, UI, CLI, MCP) relies on these schemas for validation and type derivation.

## ADDED Requirements

### Requirement: Asset schema
The system SHALL define an Asset type with id, type (video/audio/image/font), path (relative to project file), and optional hash, probedDuration, keyframeIndex, and waveformPeaks fields.

#### Scenario: Valid video asset
- **WHEN** an asset has id "a1", type "video", path "./media/clip.mp4"
- **THEN** it passes Zod validation

#### Scenario: Invalid asset type
- **WHEN** an asset has type "unknown"
- **THEN** Zod validation fails

#### Scenario: Optional fields omitted
- **WHEN** an asset omits hash, probedDuration, keyframeIndex, and waveformPeaks
- **THEN** it passes Zod validation with those fields as undefined

### Requirement: TransformState schema
The system SHALL define TransformState with numeric x, y, scale, rotation (degrees), and opacity (0..1) fields.

#### Scenario: Valid transform state
- **WHEN** a TransformState has x=100, y=50, scale=1.5, rotation=45, opacity=0.8
- **THEN** it passes Zod validation

#### Scenario: Opacity out of range
- **WHEN** TransformState opacity is 1.5 or -0.1
- **THEN** Zod validation fails

#### Scenario: Scale negative
- **WHEN** TransformState scale is negative
- **THEN** Zod validation fails

### Requirement: KeyframeTrack schema
The system SHALL define KeyframeTrack<T> as an array of keyframes, each with a time t (seconds relative to clip start), a partial value of T, and an easing field. Easing SHALL be one of "linear", "ease-in", "ease-out", "ease-in-out", or a cubicBezier object with four control points.

#### Scenario: Valid keyframe track
- **WHEN** a KeyframeTrack<TransformState> has keyframes at t=0 with {x:0, y:0, easing:"linear"} and t=2 with {x:100, easing:"ease-in"}
- **THEN** it passes Zod validation

#### Scenario: Invalid easing string
- **WHEN** a keyframe has easing "bounce"
- **THEN** Zod validation fails

#### Scenario: Valid cubicBezier easing
- **WHEN** a keyframe has easing {cubicBezier: [0.42, 0, 0.58, 1]}
- **THEN** it passes Zod validation

### Requirement: VisualClip schema with kind discrimination
The system SHALL define VisualClip as a discriminated union on the "kind" field with variants: video, image, text, and shape. Each variant SHALL enforce its required shape-specific fields. All variants SHALL include id, start, end, transform, and optional transitionIn/transitionOut.

#### Scenario: Video clip
- **WHEN** a clip has kind "video" with asset, embeddedAudio, and transform
- **THEN** it passes Zod validation

#### Scenario: Text clip has content
- **WHEN** a clip has kind "text" with text.content, text.font, text.size, text.color
- **THEN** it passes Zod validation

#### Scenario: Text clip missing content
- **WHEN** a clip has kind "text" but no text field
- **THEN** Zod validation fails

#### Scenario: Shape clip
- **WHEN** a clip has kind "shape" with shape.type "rect" and shape.color "#ff0000"
- **THEN** it passes Zod validation

#### Scenario: Image clip requires asset
- **WHEN** a clip has kind "image" but no asset
- **THEN** Zod validation fails

### Requirement: AudioClip schema
The system SHALL define AudioClip with id, start, end, asset (AssetRef), muted (boolean), and volume (0..1).

#### Scenario: Valid audio clip
- **WHEN** an AudioClip has id, start, end, asset, muted=false, volume=0.8
- **THEN** it passes Zod validation

#### Scenario: Volume out of range
- **WHEN** AudioClip volume is 1.5
- **THEN** Zod validation fails

### Requirement: Track discriminated union
The system SHALL define Track as a discriminated union on the "type" field with variants "video" and "audio". Video tracks SHALL contain an array of VisualClips; audio tracks SHALL contain an array of AudioClips.

#### Scenario: Valid video track
- **WHEN** a track has type "video" and an array of VisualClips
- **THEN** it passes Zod validation

#### Scenario: Valid audio track
- **WHEN** a track has type "audio" and an array of AudioClips
- **THEN** it passes Zod validation

### Requirement: ProjectFile schema
The system SHALL define ProjectFile as the root document with schemaVersion, id, name, resolution (width, height, optional preset), fps (24/30/60), tracks array, and assets record (keyed by asset id).

#### Scenario: Valid project file
- **WHEN** a ProjectFile has schemaVersion "0.1", resolution 1920x1080, fps 30, two tracks, and two assets
- **THEN** it passes Zod validation

#### Scenario: Invalid fps
- **WHEN** ProjectFile fps is 25 (not 24/30/60)
- **THEN** Zod validation fails

#### Scenario: Missing schemaVersion
- **WHEN** a ProjectFile omits schemaVersion
- **THEN** Zod validation fails

### Requirement: Inferred TypeScript types
The system SHALL export TypeScript types derived from Zod schemas using z.infer, so that dependents do not duplicate interface definitions manually.

#### Scenario: Types are importable
- **WHEN** package core imports ProjectFile, VisualClip, TransformState from @montagen/schema
- **THEN** the types resolve at compile time and match the Zod schema shapes
