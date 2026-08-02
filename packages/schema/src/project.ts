import * as z from "zod";
import { TrackSchema } from "./track";

export const AssetSchema = z.object({
  id: z.string(),
  type: z.enum(["video", "audio", "image", "font"]),
  path: z.string(),
  hash: z.string().optional(),
  probedDuration: z.number().optional(),
  keyframeIndex: z.array(z.number()).optional(),
  waveformPeaks: z.array(z.number()).optional(),
});

export type Asset = z.infer<typeof AssetSchema>;

export const ResolutionSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  preset: z.enum(["1080x1920", "1920x1080", "1080x1080"]).optional(),
});

export const ProjectFileSchema = z.object({
  schemaVersion: z.literal("0.1"),
  id: z.string(),
  name: z.string(),
  resolution: ResolutionSchema,
  fps: z.union([z.literal(24), z.literal(30), z.literal(60)]),
  tracks: z.array(TrackSchema),
  assets: z.record(z.string(), AssetSchema),
});

export type ProjectFile = z.infer<typeof ProjectFileSchema>;
export type Resolution = z.infer<typeof ResolutionSchema>;
