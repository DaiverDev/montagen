import { describe, expect, it } from "vitest";
import { TrackSchema } from "../track";

const validTransform = { keyframes: [] };

describe("TrackSchema", () => {
  it("validates a video track with VisualClips", () => {
    const result = TrackSchema.safeParse({
      id: "t1",
      type: "video",
      clips: [
        {
          id: "vc1",
          kind: "video",
          start: 0,
          end: 5,
          asset: { assetId: "a1", inPoint: 0, outPoint: 5 },
          transform: validTransform,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("validates a video track with name", () => {
    const result = TrackSchema.safeParse({
      id: "t2",
      type: "video",
      name: "Main Track",
      clips: [],
    });
    expect(result.success).toBe(true);
  });

  it("validates an audio track with AudioClips", () => {
    const result = TrackSchema.safeParse({
      id: "t3",
      type: "audio",
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
    });
    expect(result.success).toBe(true);
  });

  it("rejects video track with AudioClips", () => {
    const result = TrackSchema.safeParse({
      id: "t4",
      type: "video",
      clips: [
        {
          id: "bad",
          start: 0,
          end: 10,
          asset: { assetId: "a2", inPoint: 0, outPoint: 10 },
          muted: false,
          volume: 0.8,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown track type", () => {
    const result = TrackSchema.safeParse({
      id: "t5",
      type: "unknown",
      clips: [],
    });
    expect(result.success).toBe(false);
  });
});
