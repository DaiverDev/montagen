import type { ProjectFile } from "@montagen/schema";
import { resolveKeyframes } from "./keyframes";
import type { RenderTreeItem } from "./types";

export function seek(project: ProjectFile, t: number): RenderTreeItem[] {
  const result: RenderTreeItem[] = [];

  for (const [trackIndex, track] of project.tracks.entries()) {
    if (track.type !== "video") continue;

    for (const clip of track.clips) {
      if (clip.start <= t && t < clip.end) {
        const mediaTime = t - clip.start;
        const transform = resolveKeyframes(clip.transform, mediaTime);
        result.push({
          clipId: clip.id,
          transform,
          opacity: transform.opacity,
          zIndex: trackIndex,
          mediaTime,
        });
      }
    }
  }

  return result;
}
