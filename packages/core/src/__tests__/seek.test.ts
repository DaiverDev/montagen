import { describe, expect, it } from "vitest";
import { seek } from "../seek";
import type { ProjectFile } from "@montagen/schema";
import { IDENTITY } from "../keyframes";

const baseProject: ProjectFile = {
  schemaVersion: "0.1",
  id: "test-proj",
  name: "Test Project",
  resolution: { width: 1920, height: 1080 },
  fps: 30,
  tracks: [],
  assets: {},
};

function makeVideoClip(
  id: string,
  start: number,
  end: number,
  keyframes = [{ t: 0, value: { x: 0, y: 0 }, easing: "linear" as const }],
) {
  return {
    id,
    kind: "video" as const,
    start,
    end,
    asset: { assetId: "a1", inPoint: 0, outPoint: end - start },
    transform: { keyframes },
  };
}

describe("seek", () => {
  it("returns single active clip at its midpoint", () => {
    const project: ProjectFile = {
      ...baseProject,
      tracks: [
        {
          id: "t1",
          type: "video",
          clips: [makeVideoClip("vc1", 0, 5)],
        },
      ],
    };
    const result = seek(project, 2);
    expect(result).toHaveLength(1);
    expect(result[0].clipId).toBe("vc1");
    expect(result[0].mediaTime).toBe(2);
    expect(result[0].zIndex).toBe(0);
  });

  it("clip at exact start is active", () => {
    const project: ProjectFile = {
      ...baseProject,
      tracks: [
        {
          id: "t1",
          type: "video",
          clips: [makeVideoClip("vc1", 3, 8)],
        },
      ],
    };
    const result = seek(project, 3);
    expect(result).toHaveLength(1);
    expect(result[0].clipId).toBe("vc1");
  });

  it("clip at exact end is NOT active (half-open interval)", () => {
    const project: ProjectFile = {
      ...baseProject,
      tracks: [
        {
          id: "t1",
          type: "video",
          clips: [makeVideoClip("vc1", 0, 5)],
        },
      ],
    };
    const result = seek(project, 5);
    expect(result).toHaveLength(0);
  });

  it("empty project returns empty array", () => {
    const result = seek(baseProject, 0);
    expect(result).toEqual([]);
  });

  it("time before all clips returns empty", () => {
    const project: ProjectFile = {
      ...baseProject,
      tracks: [
        {
          id: "t1",
          type: "video",
          clips: [makeVideoClip("vc1", 10, 20)],
        },
      ],
    };
    const result = seek(project, 5);
    expect(result).toEqual([]);
  });

  it("time after all clips returns empty", () => {
    const project: ProjectFile = {
      ...baseProject,
      tracks: [
        {
          id: "t1",
          type: "video",
          clips: [makeVideoClip("vc1", 0, 10)],
        },
      ],
    };
    const result = seek(project, 15);
    expect(result).toEqual([]);
  });

  it("multiple clips on different tracks get increasing zIndex", () => {
    const project: ProjectFile = {
      ...baseProject,
      tracks: [
        {
          id: "t1",
          type: "video",
          clips: [makeVideoClip("bottom", 0, 10)],
        },
        {
          id: "t2",
          type: "video",
          clips: [makeVideoClip("middle", 0, 10)],
        },
        {
          id: "t3",
          type: "video",
          clips: [makeVideoClip("top", 0, 10)],
        },
      ],
    };
    const result = seek(project, 5);
    expect(result).toHaveLength(3);
    expect(result[0].zIndex).toBe(0);
    expect(result[1].zIndex).toBe(1);
    expect(result[2].zIndex).toBe(2);
    expect(result[0].clipId).toBe("bottom");
    expect(result[2].clipId).toBe("top");
  });

  it("audio tracks are skipped (seek returns visual clips only)", () => {
    const project: ProjectFile = {
      ...baseProject,
      tracks: [
        {
          id: "t1",
          type: "video",
          clips: [makeVideoClip("vc1", 0, 10)],
        },
        {
          id: "t2",
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
        },
      ],
    };
    const result = seek(project, 5);
    expect(result).toHaveLength(1);
    expect(result[0].clipId).toBe("vc1");
  });

  it("clips with animated transforms get interpolated values", () => {
    const project: ProjectFile = {
      ...baseProject,
      tracks: [
        {
          id: "t1",
          type: "video",
          clips: [
            makeVideoClip("vc1", 0, 4, [
              { t: 0, value: { x: 0, opacity: 1 }, easing: "linear" },
              { t: 4, value: { x: 200, opacity: 0 }, easing: "linear" },
            ]),
          ],
        },
      ],
    };
    const result = seek(project, 2);
    expect(result).toHaveLength(1);
    expect(result[0].transform.x).toBe(100);
    expect(result[0].opacity).toBe(0.5);
  });

  it("clip with no keyframes uses identity transform", () => {
    const project: ProjectFile = {
      ...baseProject,
      tracks: [
        {
          id: "t1",
          type: "video",
          clips: [makeVideoClip("vc1", 0, 5, [])],
        },
      ],
    };
    const result = seek(project, 2);
    expect(result).toHaveLength(1);
    expect(result[0].transform).toEqual(IDENTITY);
    expect(result[0].opacity).toBe(IDENTITY.opacity);
  });

  it("seek is deterministic — same inputs produce same outputs", () => {
    const project: ProjectFile = {
      ...baseProject,
      tracks: [
        {
          id: "t1",
          type: "video",
          clips: [makeVideoClip("vc1", 0, 5)],
        },
      ],
    };
    const result1 = seek(project, 2);
    const result2 = seek(project, 2);
    expect(result1).toEqual(result2);
  });
});
