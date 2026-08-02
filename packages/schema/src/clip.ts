import * as z from "zod";
import { KeyframeTrackSchema } from "./transform";

export const AssetRefSchema = z.object({
  assetId: z.string(),
  inPoint: z.number(),
  outPoint: z.number(),
});

export type AssetRef = z.infer<typeof AssetRefSchema>;

const TransitionSchema = z.object({
  type: z.enum(["cut", "cross-dissolve"]),
  duration: z.number(),
});

const EmbeddedAudioSchema = z.object({
  muted: z.boolean(),
  volume: z.number().min(0).max(1),
});

const TextSchema = z.object({
  content: z.string(),
  font: z.string(),
  size: z.number(),
  color: z.string(),
});

const ShapeSchema = z.object({
  type: z.enum(["rect", "ellipse"]),
  color: z.string(),
});

const ClipBaseSchema = z.object({
  id: z.string(),
  start: z.number(),
  end: z.number(),
  transform: KeyframeTrackSchema,
  transitionIn: TransitionSchema.optional(),
  transitionOut: TransitionSchema.optional(),
});

const VideoClipSchema = ClipBaseSchema.extend({
  kind: z.literal("video"),
  asset: AssetRefSchema,
  embeddedAudio: EmbeddedAudioSchema.optional(),
});

const ImageClipSchema = ClipBaseSchema.extend({
  kind: z.literal("image"),
  asset: AssetRefSchema,
});

const TextClipSchema = ClipBaseSchema.extend({
  kind: z.literal("text"),
  text: TextSchema,
});

const ShapeClipSchema = ClipBaseSchema.extend({
  kind: z.literal("shape"),
  shape: ShapeSchema,
});

export const VisualClipSchema = z.discriminatedUnion("kind", [
  VideoClipSchema,
  ImageClipSchema,
  TextClipSchema,
  ShapeClipSchema,
]);

export type VisualClip = z.infer<typeof VisualClipSchema>;

export const AudioClipSchema = z.object({
  id: z.string(),
  start: z.number(),
  end: z.number(),
  asset: AssetRefSchema,
  muted: z.boolean(),
  volume: z.number().min(0).max(1),
});

export type AudioClip = z.infer<typeof AudioClipSchema>;
