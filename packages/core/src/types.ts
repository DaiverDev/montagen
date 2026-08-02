import type { TransformState } from "@montagen/schema";

export interface RenderTreeItem {
  clipId: string;
  transform: TransformState;
  opacity: number;
  zIndex: number;
  mediaTime: number;
}
