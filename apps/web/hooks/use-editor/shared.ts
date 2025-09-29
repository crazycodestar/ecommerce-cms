import { z } from "zod";

const colorValuseShape = z.object({
  value: z.string(),
  opacity: z.coerce.number().min(0).max(100),
});

const gradientValueSchema = z.object({
  deg: z.coerce.number(),
  colors: z.array(
    z.object({
      ...colorValuseShape.shape,
      position: z.coerce.number().optional(),
    })
  ),
});

export type GradientValueSchema = z.infer<typeof gradientValueSchema>;

export const linearGradientSchema = z.object({
  type: z.literal("linear-gradient"),
  ...gradientValueSchema.shape,
  // clipToText: z.boolean().optional(),
});

export const radialGradientSchema = z.object({
  type: z.literal("radial-gradient"),
  ...gradientValueSchema.shape,
});

export const conicGradientSchema = z.object({
  type: z.literal("conic-gradient"),
  ...gradientValueSchema.shape,
});

export const colorValueSchema = z.object({
  type: z.literal("color"),
  ...colorValuseShape.shape,
});
