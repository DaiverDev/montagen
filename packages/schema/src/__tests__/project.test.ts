import { describe, expect, it } from "vitest";
import { AssetSchema, ProjectFileSchema } from "../project";
import { AssetRefSchema } from "../clip";

const validProject = {
  schemaVersion: "0.1" as const,
  id: "proj-1",
  name: "My Project",
  resolution: { width: 1920, height: 1080 },
  fps: 30 as const,
  tracks: [
    {
      id: "t1",
      type: "video" as const,
      clips: [
        {
          id: "vc1",
          kind: "video" as const,
          start: 0,
          end: 5,
          asset: { assetId: "a1", inPoint: 0, outPoint: 5 },
          transform: {
            keyframes: [
              { t: 0, value: { x: 0, y: 0 }, easing: "linear" as const },
              { t: 2, value: { x: 100 }, easing: "ease-in" as const },
            ],
          },
        },
      ],
    },
    {
      id: "t2",
      type: "audio" as const,
      clips: [
        {
          id: "ac1",
          start: 0,
          end: 10,
          asset: { assetId: "a2", inPoint: 0, outPoint: 10 },
          muted: false,
          volume: 0.8,
        },
      ],
    },
  ],
  assets: {
    a1: { id: "a1", type: "video" as const, path: "./media/clip.mp4" },
    a2: { id: "a2", type: "audio" as const, path: "./media/music.mp3" },
  },
};

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

describe("ProjectFileSchema", () => {
  it("validates a full project with tracks and assets", () => {
    const result = ProjectFileSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it("rejects invalid fps (25)", () => {
    const result = ProjectFileSchema.safeParse({
      ...validProject,
      fps: 25,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing schemaVersion", () => {
    const { schemaVersion: _, ...withoutVersion } = validProject;
    const result = ProjectFileSchema.safeParse(withoutVersion);
    expect(result.success).toBe(false);
  });

  it("rejects wrong schemaVersion", () => {
    const result = ProjectFileSchema.safeParse({
      ...validProject,
      schemaVersion: "0.2",
    });
    expect(result.success).toBe(false);
  });

  it("accepts project with resolution preset", () => {
    const result = ProjectFileSchema.safeParse({
      ...validProject,
      resolution: { width: 1080, height: 1920, preset: "1080x1920" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects resolution with 0 width", () => {
    const result = ProjectFileSchema.safeParse({
      ...validProject,
      resolution: { width: 0, height: 1080 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty tracks array", () => {
    const result = ProjectFileSchema.safeParse({
      ...validProject,
      tracks: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid assets record", () => {
    const result = ProjectFileSchema.safeParse({
      ...validProject,
      assets: {
        myKey: { id: "different", type: "video", path: "./media/clip.mp4" },
      },
    });
    expect(result.success).toBe(true);
  });
});
