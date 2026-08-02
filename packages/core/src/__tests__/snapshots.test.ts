import { describe, expect, it } from "vitest";
import { seek } from "../seek";
import { singleClipFixture, multiTrackFixture } from "./fixtures";

describe("snapshot: single clip", () => {
  const times = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];

  for (const t of times) {
    it(`seek at t=${t}`, () => {
      expect(seek(singleClipFixture, t)).toMatchSnapshot();
    });
  }
});

describe("snapshot: multi-track overlay", () => {
  const times = [0, 1, 2, 3, 4, 5, 6, 7, 8, 8.5, 9, 9.5, 10];

  for (const t of times) {
    it(`seek at t=${t}`, () => {
      expect(seek(multiTrackFixture, t)).toMatchSnapshot();
    });
  }
});
