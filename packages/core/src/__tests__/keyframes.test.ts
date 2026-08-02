import { describe, expect, it } from "vitest";
import { resolveKeyframes, IDENTITY } from "../keyframes";
import type { KeyframeTrack as KeyframeTrackType } from "@montagen/schema";

describe("resolveKeyframes", () => {
  it("interpolates between two keyframes (linear)", () => {
    const track: KeyframeTrackType = {
      keyframes: [
        { t: 0, value: { x: 0 }, easing: "linear" },
        { t: 2, value: { x: 100 }, easing: "linear" },
      ],
    };
    const result = resolveKeyframes(track, 1);
    expect(result.x).toBe(50);
    // Other properties should remain at identity
    expect(result.y).toBe(IDENTITY.y);
    expect(result.scale).toBe(IDENTITY.scale);
    expect(result.rotation).toBe(IDENTITY.rotation);
    expect(result.opacity).toBe(IDENTITY.opacity);
  });

  it("partial keyframe — only x changes, y stays at prior resolved value", () => {
    const track: KeyframeTrackType = {
      keyframes: [
        { t: 0, value: { x: 50, y: 100 }, easing: "linear" },
        { t: 2, value: { x: 150 }, easing: "linear" },
      ],
    };
    const result = resolveKeyframes(track, 1);
    expect(result.x).toBe(100); // interpolated: 50 → 150 at midpoint
    expect(result.y).toBe(100); // stays at last defined value (from t=0)
  });

  it("before first keyframe clamps to first value", () => {
    const track: KeyframeTrackType = {
      keyframes: [
        { t: 2, value: { x: 10 }, easing: "linear" },
        { t: 4, value: { x: 30 }, easing: "linear" },
      ],
    };
    const result = resolveKeyframes(track, 0);
    expect(result.x).toBe(10);
  });

  it("after last keyframe clamps to last value", () => {
    const track: KeyframeTrackType = {
      keyframes: [
        { t: 0, value: { x: 10 }, easing: "linear" },
        { t: 2, value: { x: 30 }, easing: "linear" },
      ],
    };
    const result = resolveKeyframes(track, 5);
    expect(result.x).toBe(30);
  });

  it("single keyframe is constant at all times", () => {
    const track: KeyframeTrackType = {
      keyframes: [{ t: 1, value: { x: 50, opacity: 0.5 }, easing: "linear" }],
    };
    expect(resolveKeyframes(track, 0).x).toBe(50);
    expect(resolveKeyframes(track, 1).x).toBe(50);
    expect(resolveKeyframes(track, 2).x).toBe(50);
    expect(resolveKeyframes(track, 2).opacity).toBe(0.5);
  });

  it("empty keyframe track returns identity", () => {
    const track: KeyframeTrackType = { keyframes: [] };
    const result = resolveKeyframes(track, 1);
    expect(result).toEqual(IDENTITY);
  });

  it("ease-in produces slower progress (x < linear midpoint)", () => {
    const track: KeyframeTrackType = {
      keyframes: [
        { t: 0, value: { x: 0 }, easing: "ease-in" },
        { t: 2, value: { x: 100 }, easing: "linear" },
      ],
    };
    const result = resolveKeyframes(track, 1);
    // easeIn(0.5) = 0.125, so x = 0 + 0.125 * 100 = 12.5
    expect(result.x).toBeCloseTo(12.5);
    expect(result.x).toBeLessThan(50);
  });

  it("ease-out produces faster progress (x > linear midpoint)", () => {
    const track: KeyframeTrackType = {
      keyframes: [
        { t: 0, value: { x: 0 }, easing: "ease-out" },
        { t: 2, value: { x: 100 }, easing: "linear" },
      ],
    };
    const result = resolveKeyframes(track, 1);
    // easeOut(0.5) = 0.875, so x = 0 + 0.875 * 100 = 87.5
    expect(result.x).toBeCloseTo(87.5);
    expect(result.x).toBeGreaterThan(50);
  });

  it("ease-in-out symmetric at midpoint", () => {
    const track: KeyframeTrackType = {
      keyframes: [
        { t: 0, value: { x: 0 }, easing: "ease-in-out" },
        { t: 2, value: { x: 100 }, easing: "linear" },
      ],
    };
    const result = resolveKeyframes(track, 1);
    // easeInOut(0.5) = 0.5, so x = 50
    expect(result.x).toBeCloseTo(50);
  });

  it("respects easing from the earlier keyframe (not the later one)", () => {
    const track: KeyframeTrackType = {
      keyframes: [
        { t: 0, value: { x: 0 }, easing: "ease-out" },
        { t: 2, value: { x: 100 }, easing: "ease-in" },
      ],
    };
    const result = resolveKeyframes(track, 1);
    // Should use easeOut (from first keyframe), not easeIn
    expect(result.x).toBeCloseTo(87.5);
  });

  it("interpolates all transform properties simultaneously", () => {
    const track: KeyframeTrackType = {
      keyframes: [
        { t: 0, value: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 }, easing: "linear" },
        { t: 2, value: { x: 100, y: 200, scale: 2, rotation: 90, opacity: 0 }, easing: "linear" },
      ],
    };
    const result = resolveKeyframes(track, 1);
    expect(result.x).toBe(50);
    expect(result.y).toBe(100);
    expect(result.scale).toBe(1.5);
    expect(result.rotation).toBe(45);
    expect(result.opacity).toBe(0.5);
  });

  it("cubicBezier easing falls back to linear interpolation", () => {
    const track: KeyframeTrackType = {
      keyframes: [
        { t: 0, value: { x: 0 }, easing: { cubicBezier: [0.42, 0, 0.58, 1] } },
        { t: 2, value: { x: 100 }, easing: "linear" },
      ],
    };
    const result = resolveKeyframes(track, 1);
    // Falls back to linear, so midpoint = 50
    expect(result.x).toBe(50);
  });

  it("property defined only in later keyframe propagates backward", () => {
    const track: KeyframeTrackType = {
      keyframes: [
        { t: 0, value: { x: 0 }, easing: "linear" },
        { t: 2, value: { x: 100, opacity: 0.3 }, easing: "linear" },
      ],
    };
    // At t=0.5, opacity is only defined at t=2, so it should use that value (only "next" exists)
    const result = resolveKeyframes(track, 0.5);
    expect(result.opacity).toBe(0.3);
  });
});
