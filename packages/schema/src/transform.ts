import * as z from "zod";

export const TransformStateSchema = z.object({
  x: z.number(),
  y: z.number(),
  scale: z.number().min(0),
  rotation: z.number(),
  opacity: z.number().min(0).max(1),
});

export type TransformState = z.infer<typeof TransformStateSchema>;

const CubicBezierSchema = z.object({
  cubicBezier: z.tuple([z.number(), z.number(), z.number(), z.number()]),
});

export const EasingSchema = z.union([
  z.enum(["linear", "ease-in", "ease-out", "ease-in-out"]),
  CubicBezierSchema,
]);

export type Easing = z.infer<typeof EasingSchema>;

const PartialTransformStateValueSchema = z
  .object({
    x: z.number().optional(),
    y: z.number().optional(),
    scale: z.number().optional(),
    rotation: z.number().optional(),
    opacity: z.number().optional(),
  })
  .refine(
    (val) => Object.values(val).some((v) => v !== undefined),
    { message: "At least one property must be provided" },
  );

const KeyframeSchema = z.object({
  t: z.number(),
  value: PartialTransformStateValueSchema,
  easing: EasingSchema,
});

export const KeyframeTrackSchema = z.object({
  keyframes: z.array(KeyframeSchema),
});

export type KeyframeTrack = z.infer<typeof KeyframeTrackSchema>;
export type Keyframe = z.infer<typeof KeyframeSchema>;
