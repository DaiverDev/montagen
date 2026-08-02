import { describe, expect, it } from "vitest";
import { TransformStateSchema, EasingSchema, KeyframeTrackSchema } from "../transform";

describe("TransformStateSchema", () => {
  it("validates a correct transform state", () => {
    const result = TransformStateSchema.safeParse({
      x: 100,
      y: 50,
      scale: 1.5,
      rotation: 45,
      opacity: 0.8,
    });
    expect(result.success).toBe(true);
  });

  it("rejects opacity > 1", () => {
    const result = TransformStateSchema.safeParse({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects opacity < 0", () => {
    const result = TransformStateSchema.safeParse({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative scale", () => {
    const result = TransformStateSchema.safeParse({
      x: 0,
      y: 0,
      scale: -1,
      rotation: 0,
      opacity: 1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts scale of 0", () => {
    const result = TransformStateSchema.safeParse({
      x: 0,
      y: 0,
      scale: 0,
      rotation: 0,
      opacity: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = TransformStateSchema.safeParse({ x: 0, y: 0 });
    expect(result.success).toBe(false);
  });
});

describe("EasingSchema", () => {
  it("accepts 'linear'", () => {
    expect(EasingSchema.safeParse("linear").success).toBe(true);
  });

  it("accepts 'ease-in'", () => {
    expect(EasingSchema.safeParse("ease-in").success).toBe(true);
  });

  it("accepts 'ease-out'", () => {
    expect(EasingSchema.safeParse("ease-out").success).toBe(true);
  });

  it("accepts 'ease-in-out'", () => {
    expect(EasingSchema.safeParse("ease-in-out").success).toBe(true);
  });

  it("accepts cubicBezier object", () => {
    const result = EasingSchema.safeParse({
      cubicBezier: [0.42, 0, 0.58, 1],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid easing string", () => {
    const result = EasingSchema.safeParse("bounce");
    expect(result.success).toBe(false);
  });

  it("rejects cubicBezier with wrong number of values", () => {
    const result = EasingSchema.safeParse({
      cubicBezier: [0.42, 0, 0.58],
    });
    expect(result.success).toBe(false);
  });
});

describe("KeyframeTrackSchema", () => {
  it("validates keyframes with partial TransformState values", () => {
    const result = KeyframeTrackSchema.safeParse({
      keyframes: [
        { t: 0, value: { x: 0, y: 0 }, easing: "linear" },
        { t: 2, value: { x: 100 }, easing: "ease-in" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects keyframe with invalid easing", () => {
    const result = KeyframeTrackSchema.safeParse({
      keyframes: [{ t: 0, value: { x: 0 }, easing: "bounce" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts keyframe with cubicBezier easing", () => {
    const result = KeyframeTrackSchema.safeParse({
      keyframes: [
        {
          t: 0,
          value: { x: 0 },
          easing: { cubicBezier: [0.42, 0, 0.58, 1] },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects keyframe with invalid t (not a number)", () => {
    const result = KeyframeTrackSchema.safeParse({
      keyframes: [{ t: "not-a-number", value: { x: 0 }, easing: "linear" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects keyframe with empty value", () => {
    const result = KeyframeTrackSchema.safeParse({
      keyframes: [{ t: 0, value: {}, easing: "linear" }],
    });
    expect(result.success).toBe(false);
  });
});
