import * as z from "zod";
import { VisualClipSchema, AudioClipSchema } from "./clip";

const VideoTrackSchema = z.object({
  id: z.string(),
  type: z.literal("video"),
  name: z.string().optional(),
  clips: z.array(VisualClipSchema),
});

const AudioTrackSchema = z.object({
  id: z.string(),
  type: z.literal("audio"),
  name: z.string().optional(),
  clips: z.array(AudioClipSchema),
});

export const TrackSchema = z.discriminatedUnion("type", [
  VideoTrackSchema,
  AudioTrackSchema,
]);

export type Track = z.infer<typeof TrackSchema>;
