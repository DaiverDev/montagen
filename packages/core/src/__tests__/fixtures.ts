import type { ProjectFile } from "@montagen/schema";

export const singleClipFixture: ProjectFile = {
  schemaVersion: "0.1",
  id: "fixture-single",
  name: "Single Clip",
  resolution: { width: 1920, height: 1080 },
  fps: 30,
  tracks: [
    {
      id: "track-1",
      type: "video",
      clips: [
        {
          id: "clip-1",
          kind: "video",
          start: 0,
          end: 4,
          asset: { assetId: "asset-1", inPoint: 0, outPoint: 4 },
          transform: {
            keyframes: [
              { t: 0, value: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 }, easing: "linear" },
              { t: 2, value: { x: 200, y: 100, scale: 2, rotation: 45, opacity: 0.5 }, easing: "ease-in" },
              { t: 4, value: { x: 400, y: 0, scale: 1, rotation: 90, opacity: 0 }, easing: "ease-out" },
            ],
          },
        },
      ],
    },
  ],
  assets: {
    "asset-1": { id: "asset-1", type: "video", path: "./media/sample.mp4" },
  },
};

export const multiTrackFixture: ProjectFile = {
  schemaVersion: "0.1",
  id: "fixture-multi",
  name: "Multi-Track Overlay",
  resolution: { width: 1920, height: 1080 },
  fps: 30,
  tracks: [
    {
      id: "bg-track",
      type: "video",
      clips: [
        {
          id: "bg-clip",
          kind: "video",
          start: 0,
          end: 10,
          asset: { assetId: "asset-bg", inPoint: 0, outPoint: 10 },
          transform: {
            keyframes: [
              { t: 0, value: { x: 0, y: 0, scale: 1, opacity: 1 }, easing: "linear" },
            ],
          },
        },
      ],
    },
    {
      id: "text-track",
      type: "video",
      clips: [
        {
          id: "text-clip",
          kind: "text",
          start: 2,
          end: 8,
          text: {
            content: "Hello Montagen",
            font: "Arial",
            size: 72,
            color: "#ffffff",
          },
          transform: {
            keyframes: [
              { t: 0, value: { x: 100, y: 200, scale: 1, opacity: 1 }, easing: "linear" },
            ],
          },
        },
      ],
    },
    {
      id: "fg-track",
      type: "video",
      clips: [
        {
          id: "fg-clip",
          kind: "shape",
          start: 4,
          end: 9,
          shape: {
            type: "rect",
            color: "#ff0000",
          },
          transform: {
            keyframes: [
              { t: 0, value: { x: 0, y: 0, scale: 0.5, opacity: 0.8 }, easing: "linear" },
            ],
          },
        },
      ],
    },
    {
      id: "audio-track",
      type: "audio",
      clips: [
        {
          id: "audio-clip-1",
          start: 0,
          end: 10,
          asset: { assetId: "asset-audio", inPoint: 0, outPoint: 10 },
          muted: false,
          volume: 0.7,
        },
      ],
    },
  ],
  assets: {
    "asset-bg": { id: "asset-bg", type: "video", path: "./media/background.mp4" },
    "asset-audio": { id: "asset-audio", type: "audio", path: "./media/music.mp3" },
  },
};
