import * as z from "zod";

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
