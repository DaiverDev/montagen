import type { TransformState, KeyframeTrack, Easing } from "@montagen/schema";
import { linear, easeIn, easeOut, easeInOut, type EasingFn } from "./easing";

export const IDENTITY: TransformState = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  opacity: 1,
};

const PROPERTIES = ["x", "y", "scale", "rotation", "opacity"] as const;
type Prop = (typeof PROPERTIES)[number];

const easingMap: Record<string, EasingFn> = {
  linear,
  "ease-in": easeIn,
  "ease-out": easeOut,
  "ease-in-out": easeInOut,
};

function getEasing(easing: Easing): EasingFn {
  if (typeof easing === "string") {
    return easingMap[easing] ?? linear;
  }
  // cubicBezier deferred — fall back to linear
  return linear;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function resolveKeyframes(
  track: KeyframeTrack,
  t: number,
): TransformState {
  const result: TransformState = { ...IDENTITY };

  if (track.keyframes.length === 0) {
    return result;
  }

  for (const prop of PROPERTIES) {
    // Find the last keyframe at or before t that defines this property
    let prevIdx = -1;
    for (let i = 0; i < track.keyframes.length; i++) {
      if (
        track.keyframes[i].t <= t &&
        track.keyframes[i].value[prop] !== undefined
      ) {
        prevIdx = i;
      }
    }

    // Find the first keyframe after t that defines this property
    let nextIdx = -1;
    for (let i = track.keyframes.length - 1; i >= 0; i--) {
      if (
        track.keyframes[i].t > t &&
        track.keyframes[i].value[prop] !== undefined
      ) {
        nextIdx = i;
      }
    }

    if (prevIdx >= 0 && nextIdx >= 0) {
      // Both found — interpolate
      const prev = track.keyframes[prevIdx];
      const next = track.keyframes[nextIdx];
      const progress =
        (t - prev.t) / (next.t - prev.t);
      const easedProgress = getEasing(prev.easing)(progress);
      result[prop] = lerp(prev.value[prop]!, next.value[prop]!, easedProgress);
    } else if (prevIdx >= 0) {
      // Only prev — clamp to prev value
      result[prop] = track.keyframes[prevIdx].value[prop]!;
    } else if (nextIdx >= 0) {
      // Only next — use next value (prop defined only in future)
      result[prop] = track.keyframes[nextIdx].value[prop]!;
    }
    // If neither found, result[prop] stays at IDENTITY default
  }

  return result;
}
