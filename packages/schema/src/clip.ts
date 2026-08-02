import * as z from "zod";

export const AssetRefSchema = z.object({
  assetId: z.string(),
  inPoint: z.number(),
  outPoint: z.number(),
});

export type AssetRef = z.infer<typeof AssetRefSchema>;
