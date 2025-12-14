import { z } from "zod";

// Primitives ------------------------------------------------------------
const length = z.coerce.number();

const auto = z.literal("auto");
const none = z.literal("none");

const fillContainer = z.literal("fill-container"); // percentage 100%
const hugContent = z.literal("hug-content"); // fit-content
const fillScreen = z.literal("fill-screen"); // 100vw which is just length

const start = z.literal("start");
const end = z.literal("end");
const center = z.literal("center");
const stretch = z.literal("stretch");
const spaceBetween = z.literal("space-between");
const nowrap = z.literal("nowrap");
const wrap = z.literal("wrap");

export const colorValuseShape = z.object({
  value: z.string(),
  opacity: z.coerce.number().min(0).max(100),
});

export const gradientValueSchema = z.object({
  deg: z.coerce.number(),
  colors: z.array(
    z.object({
      ...colorValuseShape.shape,
      position: z.coerce.number().optional(),
    })
  ),
});

export const linearGradientSchema = z.object({
  type: z.literal("linear-gradient"),
  ...gradientValueSchema.shape,
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

export const colorVariableValueSchema = z.object({
  type: z.literal("variable"),
  value: z.string(),
});

export const imageSchema = z.object({
  type: z.literal("image"),
  value: z.string(),
  objectFit: z
    .union([
      z.literal("cover"),
      z.literal("contain"),
      z.literal("fill"),
      z.literal("tile"),
    ])
    .optional(),
});

export const colorSchema = z.discriminatedUnion("type", [
  imageSchema,
  linearGradientSchema,
  radialGradientSchema,
  conicGradientSchema,
  colorValueSchema,
  colorVariableValueSchema,
]);

// Properties ------------------------------------------------------------
// margin
const marginLeft = z.union([length, auto]);
const marginRight = z.union([length, auto]);
const marginTop = z.union([length, auto]);
const marginBottom = z.union([length, auto]);

// padding
const paddingLeft = length;
const paddingRight = length;
const paddingTop = length;
const paddingBottom = length;

// width
const width = z.union([length, auto, fillContainer, hugContent, fillScreen]);
const minWidth = z.union([length, auto, fillContainer, hugContent, fillScreen]);
const maxWidth = z.union([length, none, fillContainer, hugContent, fillScreen]);

// height
const height = z.union([length, auto, fillContainer, hugContent, fillScreen]);
const minHeight = z.union([
  length,
  auto,
  fillContainer,
  hugContent,
  fillScreen,
]);
const maxHeight = z.union([
  length,
  none,
  fillContainer,
  hugContent,
  fillScreen,
]);

// display
const display = z.union([
  z.literal("flex-col"),
  z.literal("flex-row"),
  z.literal("grid"),
  z.literal("inline"),
  z.literal("hidden"),
]);
const justifyContent = z.union([start, end, center, spaceBetween]);
const alignItems = z.union([start, end, center]);
const flexWrap = z.union([nowrap, wrap]);
const gapX = length;
const gapY = length;
const gridCols = length;

// overflow
const overflowX = z.union([
  z.literal("hidden"),
  z.literal("auto"),
  z.literal("visible"),
]);
const overflowY = z.union([
  z.literal("hidden"),
  z.literal("auto"),
  z.literal("visible"),
]);

// border radius
const full = z.literal("full");
// ---
const borderRadiusTopLeft = z.union([length, full]);
const borderRadiusTopRight = z.union([length, full]);
const borderRadiusBottomRight = z.union([length, full]);
const borderRadiusBottomLeft = z.union([length, full]);

// opacity
const opacity = length.min(0).max(100);

// fill
const fill = z.union([colorSchema, none]);

// stroke
const strokeFill = z.union([
  z.discriminatedUnion("type", [colorValueSchema, colorVariableValueSchema]),
  none,
]);
const strokeWidth = length;
const strokeStyle = z.union([
  z.literal("solid"),
  z.literal("dashed"),
  z.literal("dotted"),
  z.literal("double"),
]);

// drop shadow
const dropShadowShape = z.object({
  x: z.coerce.number(),
  y: z.coerce.number(),
  spread: z.coerce.number(),
  color: colorValueSchema,
});

const dropShadow = z.union([dropShadowShape, none]);

// blur
const blur = length;

// backdrop blur
const backdropBlur = length;

// position
const position = z.union([
  z.literal("relative"),
  z.literal("absolute"),
  z.literal("fixed"),
  z.literal("sticky"),
]);
const colSpan = length;
const justifySelf = z.union([start, end, center, stretch, auto]);
const alignSelf = z.union([start, end, center, stretch, auto]);

const top = length;
const right = length;
const bottom = length;
const left = length;

// Typography
const fontSize = length;
const fontWeight = z.union([
  z.literal("thin"),
  z.literal("extralight"),
  z.literal("light"),
  z.literal("normal"),
  z.literal("medium"),
  z.literal("semibold"),
  z.literal("bold"),
  z.literal("extrabold"),
  z.literal("black"),
]);
const fontFamily = z.string();
const fontStyle = z.union([z.literal("normal"), z.literal("italic")]);
const leading = length;
const tracking = length;
const textAlign = z.union([
  z.literal("left"),
  z.literal("center"),
  z.literal("right"),
  z.literal("justify"),
]);

// Style
export const style = z.object({
  marginLeft,
  marginRight,
  marginTop,
  marginBottom,
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingBottom,
  width,
  minWidth,
  maxWidth,
  height,
  minHeight,
  maxHeight,
  display,
  justifyContent,
  alignItems,
  flexWrap,
  gapX,
  gapY,
  gridCols,
  overflowX,
  overflowY,
  borderRadiusTopLeft,
  borderRadiusTopRight,
  borderRadiusBottomRight,
  borderRadiusBottomLeft,
  opacity,
  fill,
  strokeFill,
  strokeWidth,
  strokeStyle,
  dropShadow,
  blur,
  backdropBlur,
  position,
  colSpan,
  justifySelf,
  alignSelf,
  top,
  right,
  bottom,
  left,
  fontSize,
  fontWeight,
  fontFamily,
  fontStyle,
  leading,
  tracking,
  textAlign,
});

export type StyleSchema = z.infer<typeof style>;
