import { describe, expect, it } from "vitest";
import { VisualClipSchema, AudioClipSchema } from "../clip";

const validTransform = {
  keyframes: [],
};

describe("VisualClipSchema", () => {
  it("validates a video clip with asset and embeddedAudio", () => {
    const result = VisualClipSchema.safeParse({
      id: "vc1",
      kind: "video",
      start: 0,
      end: 5,
      asset: { assetId: "a1", inPoint: 0, outPoint: 5 },
      embeddedAudio: { muted: false, volume: 0.8 },
      transform: validTransform,
    });
    expect(result.success).toBe(true);
  });

  it("validates a video clip without embeddedAudio (optional)", () => {
    const result = VisualClipSchema.safeParse({
      id: "vc2",
      kind: "video",
      start: 0,
      end: 5,
      asset: { assetId: "a1", inPoint: 0, outPoint: 5 },
      transform: validTransform,
    });
    expect(result.success).toBe(true);
  });

  it("rejects video clip without asset", () => {
    const result = VisualClipSchema.safeParse({
      id: "vc3",
      kind: "video",
      start: 0,
      end: 5,
      transform: validTransform,
    });
    expect(result.success).toBe(false);
  });

  it("validates an image clip with asset", () => {
    const result = VisualClipSchema.safeParse({
      id: "ic1",
      kind: "image",
      start: 2,
      end: 7,
      asset: { assetId: "a2", inPoint: 0, outPoint: 5 },
      transform: validTransform,
    });
    expect(result.success).toBe(true);
  });

  it("rejects image clip without asset", () => {
    const result = VisualClipSchema.safeParse({
      id: "ic2",
      kind: "image",
      start: 2,
      end: 7,
      transform: validTransform,
    });
    expect(result.success).toBe(false);
  });

  it("validates a text clip with content", () => {
    const result = VisualClipSchema.safeParse({
      id: "tc1",
      kind: "text",
      start: 0,
      end: 3,
      text: {
        content: "Hello World",
        font: "Roboto",
        size: 48,
        color: "#ffffff",
      },
      transform: validTransform,
    });
    expect(result.success).toBe(true);
  });

  it("rejects text clip without text field", () => {
    const result = VisualClipSchema.safeParse({
      id: "tc2",
      kind: "text",
      start: 0,
      end: 3,
      transform: validTransform,
    });
    expect(result.success).toBe(false);
  });

  it("validates a shape clip (rect)", () => {
    const result = VisualClipSchema.safeParse({
      id: "sc1",
      kind: "shape",
      start: 1,
      end: 4,
      shape: {
        type: "rect",
        color: "#ff0000",
      },
      transform: validTransform,
    });
    expect(result.success).toBe(true);
  });

  it("validates a shape clip (ellipse)", () => {
    const result = VisualClipSchema.safeParse({
      id: "sc2",
      kind: "shape",
      start: 1,
      end: 4,
      shape: {
        type: "ellipse",
        color: "#00ff00",
      },
      transform: validTransform,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown kind", () => {
    const result = VisualClipSchema.safeParse({
      id: "xx",
      kind: "unknown",
      start: 0,
      end: 1,
      transform: validTransform,
    });
    expect(result.success).toBe(false);
  });

  it("validates clip with transitionIn (cut)", () => {
    const result = VisualClipSchema.safeParse({
      id: "vc4",
      kind: "video",
      start: 0,
      end: 5,
      asset: { assetId: "a1", inPoint: 0, outPoint: 5 },
      transform: validTransform,
      transitionIn: { type: "cut", duration: 0 },
    });
    expect(result.success).toBe(true);
  });
});

describe("AudioClipSchema", () => {
  it("validates an audio clip", () => {
    const result = AudioClipSchema.safeParse({
      id: "ac1",
      start: 0,
      end: 10,
      asset: { assetId: "a3", inPoint: 0, outPoint: 10 },
      muted: false,
      volume: 0.8,
    });
    expect(result.success).toBe(true);
  });

  it("rejects volume > 1", () => {
    const result = AudioClipSchema.safeParse({
      id: "ac2",
      start: 0,
      end: 10,
      asset: { assetId: "a3", inPoint: 0, outPoint: 10 },
      muted: false,
      volume: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects volume < 0", () => {
    const result = AudioClipSchema.safeParse({
      id: "ac3",
      start: 0,
      end: 10,
      asset: { assetId: "a3", inPoint: 0, outPoint: 10 },
      muted: false,
      volume: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts muted clip", () => {
    const result = AudioClipSchema.safeParse({
      id: "ac4",
      start: 0,
      end: 10,
      asset: { assetId: "a3", inPoint: 0, outPoint: 10 },
      muted: true,
      volume: 1,
    });
    expect(result.success).toBe(true);
  });
});
