## Purpose

A pure-TypeScript engine that takes a project DSL and a time t and produces a deterministic render tree — the list of visible clips with their computed transforms, opacities, z-indices, and media times. This engine has no DOM or Node dependencies and is reusable across preview, future export, and testing.

## ADDED Requirements

### Requirement: Easing functions
The system SHALL provide four easing functions — linear, ease-in, ease-out, ease-in-out — each taking a normalized progress value (0..1) and returning an eased value (0..1). Ease-in SHALL use cubic acceleration (t³), ease-out SHALL use cubic deceleration (1 - (1-t)³), ease-in-out SHALL use the standard cubic ease-in-out formula.

#### Scenario: Linear easing is identity
- **WHEN** linear(t) is called with any t
- **THEN** the return value equals t

#### Scenario: Ease-in starts slow
- **WHEN** easeIn(0.5) is called
- **THEN** the return value is less than 0.5 (cubic acceleration)

#### Scenario: Ease-out ends slow
- **WHEN** easeOut(0.5) is called
- **THEN** the return value is greater than 0.5 (cubic deceleration)

#### Scenario: Ease-in-out symmetric at midpoint
- **WHEN** easeInOut(0.5) is called
- **THEN** the return value equals 0.5

#### Scenario: All easing functions at boundaries
- **WHEN** any easing function is called with t=0 or t=1
- **THEN** the return value is 0 or 1 respectively

### Requirement: Keyframe value interpolation
The system SHALL resolve the interpolated value of a keyframe track at time t by finding the bounding keyframe pair and interpolating between them using the first keyframe's easing. For times before the first keyframe, SHALL clamp to the first value. For times after the last keyframe, SHALL clamp to the last value. For a single keyframe, SHALL return its value constant. For an empty keyframe track, SHALL return the default identity value.

#### Scenario: Interpolation between two keyframes
- **WHEN** resolving a track with keyframes at t=0 {x:0} and t=2 {x:100} linear at t=1
- **THEN** x equals 50

#### Scenario: Partial keyframe — only x changes
- **WHEN** resolving a track with keyframe at t=0 {x:50} and default y=0
- **THEN** y remains 0 at t=0.5 (unaffected properties stay at their prior resolved value)

#### Scenario: Before first keyframe clamps
- **WHEN** resolving at t=-1 with first keyframe at t=0 {x:10}
- **THEN** the resolved value equals the first keyframe's value

#### Scenario: After last keyframe clamps
- **WHEN** resolving at t=5 with last keyframe at t=3 {x:30}
- **THEN** the resolved value equals the last keyframe's value

#### Scenario: Single keyframe is constant
- **WHEN** resolving a track with one keyframe at t=1 {x:50}
- **THEN** the resolved value is {x:50} at all times t

#### Scenario: Empty keyframe track returns identity
- **WHEN** resolving an empty keyframe track for TransformState
- **THEN** the resolved value is {x:0, y:0, scale:1, rotation:0, opacity:1}

#### Scenario: Different easings produce different interpolation curves
- **WHEN** resolving at t=1 with keyframes at t=0 {x:0, easing:"ease-in"} and t=2 {x:100}
- **THEN** x is less than 50 (ease-in accelerates, so less progress at midpoint)

### Requirement: seek(t) render tree
The system SHALL provide a seek(t) function that takes a ProjectFile and time t (in seconds) and returns a flat array of {clipId, transform, opacity, zIndex, mediaTime} objects for all clips where start <= t < end. zIndex SHALL be derived from track index (last track = highest zIndex). mediaTime SHALL be t minus the clip's start time.

#### Scenario: Single active clip
- **WHEN** a project has one clip starting at 0, ending at 5, and seek(t=2)
- **THEN** the render tree contains one entry with that clip's id and mediaTime=2

#### Scenario: Clip at exact start is active
- **WHEN** a clip starts at t=3 and seek(t=3)
- **THEN** the clip is included in the render tree

#### Scenario: Clip at exact end is not active
- **WHEN** a clip ends at t=5 and seek(t=5)
- **THEN** the clip is NOT included in the render tree (half-open interval)

#### Scenario: Empty project returns empty array
- **WHEN** a project has no tracks and seek(t=any)
- **THEN** the render tree is an empty array

#### Scenario: Time before any clip
- **WHEN** all clips start after t=10 and seek(t=5)
- **THEN** the render tree is an empty array

#### Scenario: Time after all clips
- **WHEN** all clips end before t=10 and seek(t=15)
- **THEN** the render tree is an empty array

#### Scenario: Multiple clips on different tracks
- **WHEN** track[0] has a clip and track[1] has a clip, both active at t
- **THEN** the render tree includes both, with track[1]'s clip having a higher zIndex than track[0]'s

#### Scenario: Transforms from keyframes are applied
- **WHEN** a clip has a keyframe track with x animating from 0 to 100 over its duration, and seek(t) is at midpoint
- **THEN** the render tree entry's transform.x is 50 (or the eased equivalent)

#### Scenario: Opacity from keyframes is applied
- **WHEN** a clip has a keyframe track with opacity animating, and seek(t) is called
- **THEN** the render tree entry's opacity matches the interpolated value

#### Scenario: Clip with no keyframes uses identity transform
- **WHEN** a clip has no keyframes (empty track) and seek(t) is called
- **THEN** the render tree entry has identity transform and opacity 1

### Requirement: Deterministic and pure
The system SHALL ensure seek(t) is pure — given the same ProjectFile and t, it SHALL return the same result every time. seek(t) SHALL not access the DOM, the filesystem, network, timers, or any external mutable state.

#### Scenario: Same inputs produce same output
- **WHEN** seek(t) is called twice with the same ProjectFile and t
- **THEN** the returned render trees are deeply equal

### Requirement: Snapshot tests
The system SHALL include Vitest snapshot tests with fixed fixture projects that validate the full render tree output of seek(t) at multiple time values, covering single clips, multi-track overlap, and keyframe animation.

#### Scenario: Single clip snapshot
- **WHEN** a snapshot test runs seek(t) at t=0, t=1, t=2 on a fixture project with one animated clip
- **THEN** the snapshot matches the expected render tree at each time

#### Scenario: Multi-track overlay snapshot
- **WHEN** a snapshot test runs seek(t) on a fixture with two tracks, overlapping clips, different asset kinds
- **THEN** the snapshot matches with correct z-index ordering
