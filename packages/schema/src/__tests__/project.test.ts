import { describe, expect, it } from "vitest";
import { AssetSchema } from "../project";
import { AssetRefSchema } from "../clip";

describe("AssetSchema", () => {
  it("validates a video asset", () => {
    const result = AssetSchema.safeParse({
      id: "a1",
      type: "video",
      path: "./media/clip.mp4",
    });
    expect(result.success).toBe(true);
  });

  it("validates an audio asset", () => {
    const result = AssetSchema.safeParse({
      id: "a2",
      type: "audio",
      path: "./media/music.mp3",
    });
    expect(result.success).toBe(true);
  });

  it("validates an image asset", () => {
    const result = AssetSchema.safeParse({
      id: "a3",
      type: "image",
      path: "./media/photo.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("validates a font asset", () => {
    const result = AssetSchema.safeParse({
      id: "a4",
      type: "font",
      path: "./media/Roboto.ttf",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown asset type", () => {
    const result = AssetSchema.safeParse({
      id: "a5",
      type: "unknown",
      path: "./media/file.dat",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields (hash, probedDuration, keyframeIndex, waveformPeaks)", () => {
    const result = AssetSchema.safeParse({
      id: "a6",
      type: "video",
      path: "./media/clip.mp4",
      hash: "abc123",
      probedDuration: 10.5,
      keyframeIndex: [0, 2, 4, 6, 8, 10],
      waveformPeaks: [0.1, 0.5, 0.8],
    });
    expect(result.success).toBe(true);
  });

  it("omitting optional fields is valid (undefined)", () => {
    const result = AssetSchema.safeParse({
      id: "a7",
      type: "video",
      path: "./media/clip.mp4",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hash).toBeUndefined();
      expect(result.data.probedDuration).toBeUndefined();
    }
  });
});

describe("AssetRefSchema", () => {
  it("validates an asset reference", () => {
    const result = AssetRefSchema.safeParse({
      assetId: "a1",
      inPoint: 0,
      outPoint: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing assetId", () => {
    const result = AssetRefSchema.safeParse({
      inPoint: 0,
      outPoint: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing inPoint", () => {
    const result = AssetRefSchema.safeParse({
      assetId: "a1",
      outPoint: 5,
    });
    expect(result.success).toBe(false);
  });
});
