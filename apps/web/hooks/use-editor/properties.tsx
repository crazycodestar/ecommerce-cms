import { opacityPercentToHex } from "@/lib/opacity-to-hex";
import { cn } from "@/lib/utils";
import { isEqual } from "es-toolkit";
import { useEffect } from "react";
import { z } from "zod";
import { Element } from "./elements";
import { type FieldNamesMarkedBoolean } from "react-hook-form";
import { Variable, vars } from "./variables";
import {
  colorValueSchema,
  conicGradientSchema,
  GradientValueSchema,
  linearGradientSchema,
  radialGradientSchema,
} from "./shared";

/*
 * This is a singleton object that contains the methods for adding,
 * updating, removing, and creating class names for the styles.
 */
// export const styles = {
//   add: (data: Style[], property: Style) => {
//     return [...data, property];
//   },
//   update: (data: Style[], newItem: Style) => {
//     return data.map((item) =>
//       item.className === newItem.className ? newItem : item
//     );
//   },
//   remove: (
//     data: Style[],
//     className: `ck-${PropertySchema["type"]}-${string}`
//   ) => {
//     return data.filter((item) => item.className !== className);
//   },
//   // utilities
//   createClassName: (data: Style[], type: PropertySchema["type"]) => {
//     let maxValue = 0;

//     data.forEach((item) => {
//       const itemType = item.className.split("-")[1];
//       if (itemType === type) {
//         const value = item.className.split("-")[2];
//         if (!isNaN(Number(value))) {
//           maxValue = Math.max(maxValue, Number(value));
//         }
//       }
//     });

//     maxValue++;

//     return `ck-${type}-${maxValue}` as PropertyClassName;
//   },

//   getClassNameByPropertyType: (
//     classNames: ClassName[],
//     type: PropertySchema["type"]
//   ) => {
//     return classNames.find((className) =>
//       className.startsWith(`ck-${type}-`)
//     ) as PropertyClassName | undefined;
//   },
// };

export function isTextElement(type: Element["type"]) {
  return type === "text" || type === "link";
}

function generateOpacityHex(opacity: number) {
  return opacity !== 100 ? opacityPercentToHex(opacity) : "";
}

function formatReturnedValue<T extends string | number>(
  value: string | number,
  type: T
): T {
  if (type === "number") return Number(value) as T;
  return value as T;
}

type ThreeBlueOneBrown<T extends string | number> = [T, T, T, T];
function threeBlueOneBrown<T extends string | number>(
  values: ThreeBlueOneBrown<T>
) {
  const dict: Record<T, number> = {} as Record<T, number>;

  for (let i = 0; i < values.length; i++) {
    const value = dict[values[i]];
    if (value) dict[values[i]] = value + 1;
    else dict[values[i]] = 1;
  }

  let threeBlue: T | null = null;
  let oneBrown: T | null = null;

  Object.entries(dict).forEach(([value, count]) => {
    if (count === 3)
      threeBlue = formatReturnedValue(value as T, typeof values[0]) as T;
    else if (count === 1)
      oneBrown = formatReturnedValue(value as T, typeof values[0]) as T;
  });

  return threeBlue && oneBrown ? [threeBlue, oneBrown] : null;
}

type StyleType<
  T extends {},
  U extends ((arg: Element["type"]) => T) | (() => T),
> = {
  schema: z.ZodObject<any>;
  defaultValues: U;
  defaultTransform: U extends (arg: infer V) => T
    ? V extends Element["type"]
      ? (arg: Element["type"]) => string
      : () => string
    : () => string;
  transform: U extends (arg: infer V) => T
    ? V extends Element["type"]
      ? (value: T, arg: Element["type"]) => string | undefined
      : (value: T) => string | undefined
    : (value: T) => string | undefined;
};

/*
 * This structures the schemas and types for the styles
 */

export type ClassName = string;

export const marginShape = z.union([z.coerce.number(), z.literal("auto")]);
export type MarginShape = z.infer<typeof marginShape>;

export const marginSchema = z.object({
  margin: z
    .object({
      top: marginShape,
      right: marginShape,
      bottom: marginShape,
      left: marginShape,
    })
    .optional()
    .nullable(),
});
export type MarginSchema = z.infer<typeof marginSchema>;

export const margin: StyleType<MarginSchema, () => MarginSchema> = {
  schema: marginSchema,
  defaultValues: () => ({
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  }),
  defaultTransform: () => "m-0",
  transform: (value: MarginSchema) => {
    function formatMargin(value: number | "auto") {
      if (typeof value === "number") return `[${value}px]`;
      return value;
    }
    if (value.margin === undefined) return;
    if (value.margin === null) return margin.defaultTransform();

    const isSame = Object.values(value.margin).every(
      (v) => v === value.margin?.top
    );
    if (isSame) return `m-${formatMargin(value.margin.top)}`;

    const assertThreeBlueOneBrown = threeBlueOneBrown(
      Object.values(value.margin) as ThreeBlueOneBrown<number>
    );
    if (assertThreeBlueOneBrown) {
      const [threeBlue, oneBrown] = assertThreeBlueOneBrown;
      const [side] = Object.entries(value.margin).find(
        ([_, value]) => value === oneBrown
      ) as [string, number];

      const oneBrownTailwindCSSStyle =
        side === "top"
          ? "mt"
          : side === "right"
            ? "mr"
            : side === "bottom"
              ? "mb"
              : "ml";
      return `m-${formatMargin(threeBlue)} ${oneBrownTailwindCSSStyle}-${formatMargin(oneBrown)}`;
    }

    const isVertical = value.margin.top === value.margin.bottom;
    const isVerticalDefault =
      value.margin.top === margin.defaultValues().margin?.top;

    const isHorizontal = value.margin.left === value.margin.right;
    const isHorizontalDefault =
      value.margin.left === margin.defaultValues().margin?.left;

    if (isVertical && isHorizontal)
      return `mx-${formatMargin(value.margin.left)} my-${formatMargin(value.margin.top)}`;
    if (isVertical && !isVerticalDefault)
      return `my-${formatMargin(value.margin.top)} ml-${formatMargin(value.margin.left)} mr-${formatMargin(value.margin.right)}`;
    if (isHorizontal && !isHorizontalDefault)
      return `mx-${formatMargin(value.margin.right)} mt-${formatMargin(value.margin.top)} mb-${formatMargin(value.margin.bottom)}`;

    return `mt-${formatMargin(value.margin.top)} mr-${formatMargin(value.margin.right)} mb-${formatMargin(value.margin.bottom)} ml-${formatMargin(value.margin.left)}`;
  },
};

export const paddingSchema = z.object({
  padding: z
    .object({
      top: z.coerce.number(),
      right: z.coerce.number(),
      bottom: z.coerce.number(),
      left: z.coerce.number(),
    })
    .optional()
    .nullable(),
});
export type PaddingSchema = z.infer<typeof paddingSchema>;

export const padding: StyleType<PaddingSchema, () => PaddingSchema> = {
  schema: paddingSchema,
  defaultValues: () => ({
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  }),
  defaultTransform: () => "p-0",
  transform: (value) => {
    if (value.padding === undefined) return;
    if (value.padding === null) return padding.defaultTransform();

    const isSame = Object.values(value.padding).every(
      (v) => v === value.padding?.top
    );
    if (isSame) return `p-[${value.padding.top}px]`;

    const assertThreeBlueOneBrown = threeBlueOneBrown(
      Object.values(value.padding) as ThreeBlueOneBrown<number>
    );
    if (assertThreeBlueOneBrown) {
      const [threeBlue, oneBrown] = assertThreeBlueOneBrown;
      const [side] = Object.entries(value.padding).find(
        ([_, value]) => value === oneBrown
      ) as [string, number];

      const oneBrownTailwindCSSStyle =
        side === "top"
          ? "pt"
          : side === "right"
            ? "pr"
            : side === "bottom"
              ? "pb"
              : "pl";
      return `p-[${threeBlue}px] ${oneBrownTailwindCSSStyle}-[${oneBrown}px]`;
    }

    const isVertical = value.padding.top === value.padding.bottom;
    const isVerticalDefault =
      value.padding.top === padding.defaultValues().padding?.top;

    const isHorizontal = value.padding.left === value.padding.right;
    const isHorizontalDefault =
      value.padding.left === padding.defaultValues().padding?.left;

    if (isVertical && isHorizontal)
      return `px-[${value.padding.left}px] py-[${value.padding.top}px]`;
    if (isVertical && !isVerticalDefault)
      return `py-[${value.padding.top}px] pl-[${value.padding.left}px] pr-[${value.padding.right}px]`;
    if (isHorizontal && !isHorizontalDefault)
      return `px-[${value.padding.right}px] pt-[${value.padding.top}px] pb-[${value.padding.bottom}px]`;

    return `pt-[${value.padding.top}px] pr-[${value.padding.right}px] pb-[${value.padding.bottom}px] pl-[${value.padding.left}px]`;
  },
};

export const widthObjectShape = z.union([
  z.coerce.number(),
  z.literal("auto"),
  z.literal("fill-container"),
  z.literal("hug-content"),
  z.literal("fill-screen"),
]);

export const widthSchema = z.object({
  width: widthObjectShape.optional().nullable(),
  // maxWidth: auxWidthObjectShape,
  // minWidth: auxWidthObjectShape,
});
export type WidthSchema = z.infer<typeof widthSchema>;

export const width: StyleType<WidthSchema, () => WidthSchema> = {
  schema: widthSchema,
  defaultValues: () => ({
    width: "auto",
  }),
  defaultTransform: () => "w-auto",
  transform: (value: WidthSchema) => {
    if (value.width === undefined) return;
    if (value.width === null) return width.defaultTransform();

    if (value.width === "auto") return "w-auto";
    if (value.width === "fill-container") return "w-full";
    if (value.width === "hug-content") return "w-fit";
    if (value.width === "fill-screen") return "w-screen";

    return `w-[${value.width}px]`;
  },
};

export const auxWidthObjectShape = z.union([
  z.coerce.number(),
  z.literal("fill-container"),
  z.literal("hug-content"),
  z.literal("fill-screen"),
]);

export const maxWidthSchema = z.object({
  maxWidth: auxWidthObjectShape.optional().nullable(),
});
export type MaxWidthSchema = z.infer<typeof maxWidthSchema>;

export const maxWidth: StyleType<MaxWidthSchema, () => MaxWidthSchema> = {
  schema: maxWidthSchema,
  defaultValues: () => ({
    maxWidth: undefined,
  }),
  defaultTransform: () => "max-w-none",
  transform: (value: MaxWidthSchema) => {
    if (value.maxWidth === undefined) return;
    if (value.maxWidth === null) return maxWidth.defaultTransform();

    if (value.maxWidth === "fill-container") return "max-w-full";
    if (value.maxWidth === "hug-content") return "max-w-fit";
    if (value.maxWidth === "fill-screen") return "max-w-screen";

    return `max-w-[${value.maxWidth}px]`;
  },
};

export const minWidthSchema = z.object({
  minWidth: auxWidthObjectShape.optional().nullable(),
});
export type MinWidthSchema = z.infer<typeof minWidthSchema>;

export const minWidth: StyleType<MinWidthSchema, () => MinWidthSchema> = {
  schema: minWidthSchema,
  defaultValues: () => ({
    minWidth: undefined,
  }),
  defaultTransform: () => "min-w-none",
  transform: (value: MinWidthSchema) => {
    if (value.minWidth === undefined) return;
    if (value.minWidth === null) return minWidth.defaultTransform();

    if (value.minWidth === "fill-container") return "min-w-full";
    if (value.minWidth === "hug-content") return "min-w-fit";
    if (value.minWidth === "fill-screen") return "min-w-screen";

    return `min-w-[${value.minWidth}px]`;
  },
};

export const heightObjectShape = z.union([
  z.coerce.number(),
  z.literal("auto"),
  z.literal("fill-container"),
  z.literal("hug-content"),
  z.literal("fill-viewport"),
]);

export const heightSchema = z.object({
  height: heightObjectShape.optional().nullable(),
});
export type HeightSchema = z.infer<typeof heightSchema>;

export const height: StyleType<HeightSchema, () => HeightSchema> = {
  schema: heightSchema,
  defaultValues: () => ({
    height: "auto",
  }),
  defaultTransform: () => "h-auto",
  transform: (value: HeightSchema) => {
    if (value.height === undefined) return;
    if (value.height === null) return height.defaultTransform();

    if (value.height === "auto") return "h-auto";
    if (value.height === "fill-container") return "h-full";
    if (value.height === "hug-content") return "h-fit";
    if (value.height === "fill-viewport") return "h-screen";

    return `h-[${value.height}px]`;
  },
};

export const auxHeightObjectShape = z.union([
  z.coerce.number(),
  z.literal("fill-container"),
  z.literal("hug-content"),
  z.literal("fill-viewport"),
]);

export const maxHeightSchema = z.object({
  maxHeight: auxHeightObjectShape.optional().nullable(),
});
export type MaxHeightSchema = z.infer<typeof maxHeightSchema>;

export const maxHeight: StyleType<MaxHeightSchema, () => MaxHeightSchema> = {
  schema: maxHeightSchema,
  defaultValues: () => ({
    maxHeight: undefined,
  }),
  defaultTransform: () => "max-h-none",
  transform: (value: MaxHeightSchema) => {
    if (value.maxHeight === undefined) return;
    if (value.maxHeight === null) return maxHeight.defaultTransform();

    if (value.maxHeight === "fill-container") return "max-h-full";
    if (value.maxHeight === "hug-content") return "max-h-fit";
    if (value.maxHeight === "fill-viewport") return "max-h-screen";

    return `max-h-[${value.maxHeight}px]`;
  },
};

export const minHeightSchema = z.object({
  minHeight: auxHeightObjectShape.optional().nullable(),
});
export type MinHeightSchema = z.infer<typeof minHeightSchema>;

export const minHeight: StyleType<MinHeightSchema, () => MinHeightSchema> = {
  schema: minHeightSchema,
  defaultValues: () => ({
    minHeight: undefined,
  }),
  defaultTransform: () => "min-h-none",
  transform: (value: MinHeightSchema) => {
    if (value.minHeight === undefined) return;
    if (value.minHeight === null) return minHeight.defaultTransform();

    if (value.minHeight === "fill-container") return "min-h-full";
    if (value.minHeight === "hug-content") return "min-h-fit";
    if (value.minHeight === "fill-viewport") return "min-h-screen";

    return `min-h-[${value.minHeight}px]`;
  },
};

export const displayObjectShape = z.union([
  z.literal("flex-col"),
  z.literal("flex-row"),
  z.literal("grid"),
  z.literal("inline"),
]);

export const placeShape = z.object({
  justifyContent: z
    .union([
      z.literal("start"),
      z.literal("end"),
      z.literal("center"),
      z.literal("space-between"),
    ])
    .optional(),
  alignItems: z
    .union([z.literal("start"), z.literal("end"), z.literal("center")])
    .optional(),
});

export type PlaceShape = z.infer<typeof placeShape>;

export const gapXShape = z.object({
  gapX: z.coerce.number().optional(),
});

export const gapYShape = z.object({
  gapY: z.coerce.number().optional(),
});

export const flexColSchema = z.object({
  type: z.literal("flex-col"),
  ...placeShape.shape,
  ...gapXShape.shape,
});

export const flexRowSchema = z.object({
  type: z.literal("flex-row"),
  flexWrap: z.union([z.literal("nowrap"), z.literal("wrap")]).optional(),
  ...placeShape.shape,
  ...gapXShape.shape,
});

export const gridSchema = z.object({
  type: z.literal("grid"),
  gridCols: z.coerce.number(),
  ...placeShape.shape,
  ...gapXShape.shape,
  ...gapYShape.shape,
});

export const inlineSchema = z.object({
  type: z.literal("inline"),
});

export const hiddenSchema = z.object({
  type: z.literal("hidden"),
});

export const displaySchema = z.object({
  display: z
    .discriminatedUnion("type", [
      flexColSchema,
      flexRowSchema,
      gridSchema,
      inlineSchema,
      hiddenSchema,
    ])
    .optional()
    .nullable(),
});
export type DisplaySchema = z.infer<typeof displaySchema>;

export const display: StyleType<DisplaySchema, () => DisplaySchema> = {
  schema: displaySchema,
  defaultValues: () => ({
    display: {
      type: "flex-col",
      justifyContent: "start",
      alignItems: "start",
      gapX: 0,
    },
  }),
  defaultTransform: () =>
    "flex flex-col justify-start items-start gap-0 gap-y-0 grid-cols-1",
  transform: (value: DisplaySchema) => {
    if (value.display === undefined) return;
    if (value.display === null) return display.defaultTransform();

    let style: string[] = [];

    function resolveJusitifyContent(
      justifyContent: PlaceShape["justifyContent"]
    ) {
      if (justifyContent === "start") return "justify-start";

      if (justifyContent === "end") return "justify-end";

      if (justifyContent === "center") return "justify-center";

      if (justifyContent === "space-between") return "justify-between";

      return "";
    }

    function resolveAlignItems(alignItems: PlaceShape["alignItems"]) {
      if (alignItems === "start") return "items-start";

      if (alignItems === "end") return "items-end";

      if (alignItems === "center") return "items-center";

      return "";
    }

    function resolveFlexWrap(
      flexWrap: (DisplaySchema["display"] & { type: "flex-row" })["flexWrap"]
    ) {
      if (flexWrap === "nowrap") return "flex-nowrap";

      if (flexWrap === "wrap") return "flex-wrap";

      return "";
    }

    function resolveGridCols(
      gridCols: (DisplaySchema["display"] & { type: "grid" })["gridCols"]
    ) {
      if (gridCols === undefined) return "grid-cols-1";

      return `grid-cols-${gridCols}`;
    }

    switch (value.display.type) {
      case "flex-col":
        style.push("flex", "flex-col");
        style.push(resolveJusitifyContent(value.display.justifyContent));
        style.push(resolveAlignItems(value.display.alignItems));
        if (value.display.gapX === 0) style.push("gap-0");
        else style.push(`gap-[${value.display.gapX}px]`);
        break;
      case "flex-row":
        style.push("flex", "flex-row");
        style.push(resolveJusitifyContent(value.display.justifyContent));
        style.push(resolveAlignItems(value.display.alignItems));
        if (value.display.gapX === 0) style.push("gap-0");
        else style.push(`gap-[${value.display.gapX}px]`);
        style.push(resolveFlexWrap(value.display.flexWrap));
        break;
      case "grid":
        style.push("grid");
        style.push(resolveJusitifyContent(value.display.justifyContent));
        style.push(resolveAlignItems(value.display.alignItems));
        if (value.display.gapX === 0) style.push("gap-0");
        else style.push(`gap-[${value.display.gapX}px]`);
        if (value.display.gapY === 0) style.push("gap-y-0");
        else style.push(`gap-y-[${value.display.gapY}px]`);
        style.push(resolveGridCols(value.display.gridCols));
        break;
      case "inline":
        style.push("inline");
        break;
      case "hidden":
        style.push("hidden");
        break;
    }

    return style.join(" ");
  },
};

export const overflowSchema = z.object({
  overflow: z
    .union([z.literal("hidden"), z.literal("auto"), z.literal("visible")])
    .optional()
    .nullable(),
});
export type OverflowSchema = z.infer<typeof overflowSchema>;

export const overflow: StyleType<OverflowSchema, () => OverflowSchema> = {
  schema: overflowSchema,
  defaultValues: () => ({
    overflow: "visible",
  }),
  defaultTransform: () => "overflow-visible",
  transform: (value: OverflowSchema) => {
    if (value.overflow === undefined) return;
    if (value.overflow === null) return overflow.defaultTransform();

    switch (value.overflow) {
      case "hidden":
        return "overflow-hidden";
      case "auto":
        return "overflow-auto";
      case "visible":
        return "overflow-visible";
      default:
        return "";
    }
  },
};

export const borderRadiusObjectShape = z.union([
  z.coerce.number(),
  z.literal("full"),
]);
export type BorderRadiusObjectShape = z.infer<typeof borderRadiusObjectShape>;

export const opacitySchema = z.object({
  opacity: z.coerce.number().min(0).max(100).optional().nullable(),
});
export type OpacitySchema = z.infer<typeof opacitySchema>;

export const opacity: StyleType<OpacitySchema, () => OpacitySchema> = {
  schema: opacitySchema,
  defaultValues: () => ({
    opacity: 100,
  }),
  defaultTransform: () => "opacity-100",
  transform: (value: OpacitySchema) => {
    if (value.opacity === undefined) return;
    if (value.opacity === null) return opacity.defaultTransform();

    if (value.opacity % 5) return `opacity-[${value.opacity / 100}]`;
    return `opacity-${value.opacity}`;
  },
};

export const borderRadiusSchema = z.object({
  borderRadius: z
    .object({
      topLeft: borderRadiusObjectShape,
      topRight: borderRadiusObjectShape,
      bottomRight: borderRadiusObjectShape,
      bottomLeft: borderRadiusObjectShape,
    })
    .optional()
    .nullable(),
});
export type BorderRadiusSchema = z.infer<typeof borderRadiusSchema>;

export const borderRadius: StyleType<
  BorderRadiusSchema,
  () => BorderRadiusSchema
> = {
  schema: borderRadiusSchema,
  defaultValues: () => ({
    borderRadius: {
      topLeft: 0,
      topRight: 0,
      bottomRight: 0,
      bottomLeft: 0,
    },
  }),
  defaultTransform: () => "rounded-none",
  transform: (value: BorderRadiusSchema) => {
    if (value.borderRadius === undefined) return;
    if (value.borderRadius === null) return borderRadius.defaultTransform();

    const { topLeft, topRight, bottomRight, bottomLeft } = value.borderRadius;

    // If all corners are the same
    if (
      topLeft === topRight &&
      topRight === bottomRight &&
      bottomRight === bottomLeft
    ) {
      if (topLeft === 0) return "";
      if (topLeft === "full") return "rounded-full";
      return `rounded-[${topLeft}px]`;
    }

    // If top and bottom are the same, left and right are the same
    if (topLeft === bottomLeft && topRight === bottomRight) {
      if (topLeft === topRight) {
        if (topLeft === 0) return "";
        if (topLeft === "full") return "rounded-full";
        return `rounded-[${topLeft}px]`;
      }
      // Different horizontal and vertical radii
      let classes = "";
      if (topLeft !== 0) {
        if (topLeft === "full") classes += "rounded-tl-full rounded-bl-full ";
        else classes += `rounded-tl-[${topLeft}px] rounded-bl-[${topLeft}px] `;
      }
      if (topRight !== 0) {
        if (topRight === "full") classes += "rounded-tr-full rounded-br-full ";
        else
          classes += `rounded-tr-[${topRight}px] rounded-br-[${topRight}px] `;
      }
      return classes.trim();
    }

    // All corners are different
    let classes = "";
    if (topLeft !== 0) {
      if (topLeft === "full") classes += "rounded-tl-full ";
      else classes += `rounded-tl-[${topLeft}px] `;
    }
    if (topRight !== 0) {
      if (topRight === "full") classes += "rounded-tr-full ";
      else classes += `rounded-tr-[${topRight}px] `;
    }
    if (bottomRight !== 0) {
      if (bottomRight === "full") classes += "rounded-br-full ";
      else classes += `rounded-br-[${bottomRight}px] `;
    }
    if (bottomLeft !== 0) {
      if (bottomLeft === "full") classes += "rounded-bl-full ";
      else classes += `rounded-bl-[${bottomLeft}px] `;
    }
    return classes.trim();
  },
};

const imageSchema = z.object({
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

export type ImageSchema = z.infer<typeof imageSchema>;

export const colorSchema = z.discriminatedUnion("type", [
  imageSchema,
  linearGradientSchema,
  radialGradientSchema,
  conicGradientSchema,
  colorValueSchema,
]);

export type ColorSchema = z.infer<typeof colorSchema>;

export const fillSchema = z.object({
  fill: vars
    .createSchemaWithVariableType("color", colorSchema)
    .optional()
    .nullable(),
});

export type FillSchema = z.infer<typeof fillSchema>;

export const fill: StyleType<
  FillSchema,
  (element: Element["type"]) => FillSchema
> = {
  schema: fillSchema,
  defaultValues: (type) => {
    if (isTextElement(type)) {
      return {
        fill: {
          type: "default",
          value: {
            type: "color",
            value: "#000000",
            opacity: 100,
          },
        },
      };
    } else {
      return {
        fill: undefined,
      };
    }
  },
  defaultTransform: (type) => {
    if (isTextElement(type)) {
      return "text-[#000000]";
    } else {
      return "bg-transparent";
    }
  },
  transform: (valueWithVariable, type) => {
    if (valueWithVariable.fill === undefined) return;
    if (valueWithVariable.fill === null) return fill.defaultTransform(type);

    if (valueWithVariable.fill.type === "variable") return;

    const fillValue = valueWithVariable.fill.value!;

    // const fillValue = (value.fill.value);
    // const clipToText = value.fill.clipToText;

    function parseGradientValue(value: GradientValueSchema) {
      let style: string[] = [];
      if (value.deg !== 180) style.push(`${value.deg}deg`);

      const colors = value.colors
        .map(
          (color) =>
            `${color.value}${generateOpacityHex(color.opacity)}${color.position && color.position !== 100 ? `_${color.position}%` : ""}`
        )
        .join();

      style.push(colors);
      return style.join();
    }

    let style: string[] = [];
    switch (fillValue.type) {
      case "image":
        style.push(
          `bg-[url(${fillValue.value})] ${isTextElement(type) && "bg-clip-text text-transparent"}`
        );
        if (fillValue.objectFit && fillValue.objectFit !== "tile") {
          style.push(`bg-${fillValue.objectFit}`);
        } else if (fillValue.objectFit) {
          style.push(`bg-repeat`);
        }
        break;
      case "linear-gradient":
        style.push(
          `bg-linear-[${parseGradientValue(fillValue)}] ${isTextElement(type) && "bg-clip-text text-transparent"}`
        );

        break;
      case "radial-gradient":
        style.push(
          `bg-radial-[${parseGradientValue(fillValue)}] ${isTextElement(type) && "bg-clip-text text-transparent"}`
        );

        break;
      case "conic-gradient":
        style.push(
          `bg-conic-[${parseGradientValue(fillValue)}] ${isTextElement(type) && "bg-clip-text text-transparent"}`
        );
        break;
      case "color":
        style.push(
          `${isTextElement(type) ? "text" : "bg"}-[${fillValue.value}${generateOpacityHex(fillValue.opacity)}]`
        );
        break;
    }

    // if (clipToText) {
    //   style.push(`bg-clip-text`);
    // }

    const result = style.join(" ");
    return result;
  },
};

export const strokeSchema = z.object({
  stroke: z
    .object({
      fill: colorValueSchema,
      width: z.coerce.number(),
      style: z.union([
        z.literal("solid"),
        z.literal("dashed"),
        z.literal("dotted"),
        z.literal("double"),
      ]),
    })
    .optional()
    .nullable(),
});

export type StrokeSchema = z.infer<typeof strokeSchema>;

export const stroke: StyleType<StrokeSchema, () => StrokeSchema> = {
  schema: strokeSchema,
  defaultValues: () => ({
    stroke: undefined,
  }),
  defaultTransform: () => "border-[0px] border-solid border-[#000000]",
  transform: (value: StrokeSchema) => {
    if (value.stroke === undefined) return;
    if (value.stroke === null) return stroke.defaultTransform();

    let style: string[] = [];
    style.push(
      `border-[${value.stroke.fill.value}${generateOpacityHex(value.stroke.fill.opacity)}]`
    );
    style.push(`border-[${value.stroke.width}px]`);
    style.push(`border-${value.stroke.style}`);
    return style.join(" ");
  },
};

export const dropShadowSchema = z.object({
  dropShadow: z
    .object({
      x: z.coerce.number(),
      y: z.coerce.number(),
      spread: z.coerce.number(),
      color: colorValueSchema,
    })
    .optional()
    .nullable(),
});
export type DropShadowSchema = z.infer<typeof dropShadowSchema>;

export const dropShadow: StyleType<DropShadowSchema, () => DropShadowSchema> = {
  schema: dropShadowSchema,
  defaultValues: () => ({
    dropShadow: undefined,
  }),
  defaultTransform: () => "drop-shadow-[0px_0px_0px_#000000]",
  transform: ({ dropShadow: dropShadowValue }: DropShadowSchema) => {
    if (dropShadowValue === undefined) return;
    if (dropShadowValue === null) return dropShadow.defaultTransform();

    return `drop-shadow-[${dropShadowValue.x}px_${dropShadowValue.y}px_${dropShadowValue.spread}px_${dropShadowValue.color.value}${generateOpacityHex(dropShadowValue.color.opacity)}]`;
  },
};

export const blurSchema = z.object({
  blur: z.coerce.number().optional().nullable(),
});
export type BlurSchema = z.infer<typeof blurSchema>;

export const blur: StyleType<BlurSchema, () => BlurSchema> = {
  schema: blurSchema,
  defaultValues: () => ({
    blur: undefined,
  }),
  defaultTransform: () => "blur-[0px]",
  transform: ({ blur: blurValue }: BlurSchema) => {
    if (blurValue === undefined) return;
    if (blurValue === null) return blur.defaultTransform();
    return `blur-[${blurValue}px]`;
  },
};

export const backdropBlurSchema = z.object({
  backdropBlur: z.coerce.number().optional().nullable(),
});
export type BackdropBlurSchema = z.infer<typeof backdropBlurSchema>;

export const backdropBlur: StyleType<
  BackdropBlurSchema,
  () => BackdropBlurSchema
> = {
  schema: backdropBlurSchema,
  defaultValues: () => ({
    backdropBlur: undefined,
  }),
  defaultTransform: () => "backdrop-blur-[0px]",
  transform: ({ backdropBlur: backdropBlurValue }: BackdropBlurSchema) => {
    if (backdropBlurValue === undefined) return;
    if (backdropBlurValue === null) return backdropBlur.defaultTransform();
    return `backdrop-blur-[${backdropBlurValue}px]`;
  },
};

export const positionSchema = z.object({
  position: z
    .discriminatedUnion("type", [
      z.object({
        type: z.literal("relative"),
        justifySelf: z
          .union([
            z.literal("start"),
            z.literal("end"),
            z.literal("center"),
            z.literal("stretch"),
          ])
          .optional(),
        alignSelf: z
          .union([
            z.literal("start"),
            z.literal("end"),
            z.literal("center"),
            z.literal("stretch"),
          ])
          .optional(),
        colSpan: z.coerce.number().optional(),
      }),
      z.object({
        type: z.literal("absolute"),
      }),
      z.object({
        type: z.literal("fixed"),
      }),
      z.object({
        type: z.literal("sticky"),
      }),
    ])
    .optional()
    .nullable(),
});
export type PositionSchema = z.infer<typeof positionSchema>;

export const position: StyleType<PositionSchema, () => PositionSchema> = {
  schema: positionSchema,
  defaultValues: () => ({
    position: {
      type: "relative",
      colSpan: 1,
    },
  }),
  defaultTransform: () => "relative self-auto m-0 col-span-1",
  transform: (value: PositionSchema) => {
    if (value.position === undefined) return;
    if (value.position === null) return position.defaultTransform();

    switch (value.position.type) {
      case "relative":
        let style = `relative ${value.position.alignSelf ? `self-${value.position.alignSelf}` : "self-auto"} ${value.position.colSpan && value.position.colSpan !== 1 ? `col-span-${value.position.colSpan}` : "col-span-1"}`;
        switch (value.position.justifySelf) {
          case "start":
            style += ` mr-auto`;
            break;
          case "center":
            style += ` mx-auto`;
            break;
          case "end":
            style += ` ml-auto`;
            break;
          default:
            style += ` m-0`;
            break;
        }
        return style;
      case "absolute":
        return `absolute`;
      case "fixed":
        return `fixed`;
      case "sticky":
        return `sticky`;
    }
  },
};

export const PositionValueSchema = z.object({
  pos: z.coerce.number(),
  isFlipped: z.boolean(),
});

export const xSchema = z.object({
  x: PositionValueSchema.optional().nullable(),
});
export type XSchema = z.infer<typeof xSchema>;

export const x: StyleType<XSchema, () => XSchema> = {
  schema: xSchema,
  defaultValues: () => ({
    x: {
      pos: 0,
      isFlipped: false,
    },
  }),
  defaultTransform: () => "left-[0px] right-[0px]",
  transform: (value: XSchema) => {
    const xValue = value.x;
    if (xValue === undefined) return;
    if (xValue === null) return x.defaultTransform();

    if (xValue.pos === 0) return "";
    if (xValue.isFlipped) return `right-[${xValue.pos}px]`;
    return `left-[${xValue.pos}px]`;
  },
};

export const ySchema = z.object({
  y: PositionValueSchema.optional().nullable(),
});
export type YSchema = z.infer<typeof ySchema>;

export const y: StyleType<YSchema, () => YSchema> = {
  schema: ySchema,
  defaultValues: () => ({
    y: {
      pos: 0,
      isFlipped: false,
    },
  }),
  defaultTransform: () => "top-[0px] bottom-[0px]",
  transform: (value: YSchema) => {
    const yValue = value.y;
    if (yValue === undefined) return;
    if (yValue === null) return y.defaultTransform();

    if (yValue.pos === 0) return "";
    if (yValue.isFlipped) return `bottom-[${yValue.pos}px]`;
    return `top-[${yValue.pos}px]`;
  },
};

export const fontSizeSchema = z.object({
  fontSize: z.coerce.number().optional().nullable(),
});
export type FontSizeSchema = z.infer<typeof fontSizeSchema>;

export const fontSize: StyleType<
  FontSizeSchema,
  (element: Element["type"]) => FontSizeSchema
> = {
  schema: fontSizeSchema,
  defaultValues: () => ({
    fontSize: 16,
  }),
  defaultTransform: (type) => {
    if (isTextElement(type)) {
      return "text-[16px]";
    } else {
      return "";
    }
  },
  transform: (value, type) => {
    const fontSizeValue = value.fontSize;

    if (fontSizeValue === undefined || !isTextElement(type)) return;
    if (fontSizeValue === null) return fontSize.defaultTransform(type);
    return `text-[${fontSizeValue}px]`;
  },
};

export const fontWeightSchema = z.object({
  fontWeight: z
    .union([
      z.literal("thin"),
      z.literal("extralight"),
      z.literal("light"),
      z.literal("normal"),
      z.literal("medium"),
      z.literal("semibold"),
      z.literal("bold"),
      z.literal("extrabold"),
      z.literal("black"),
    ])
    .optional()
    .nullable(),
});
export type FontWeightSchema = z.infer<typeof fontWeightSchema>;

export const fontWeight: StyleType<
  FontWeightSchema,
  (element: Element["type"]) => FontWeightSchema
> = {
  schema: fontWeightSchema,
  defaultValues: () => ({
    fontWeight: "normal",
  }),
  defaultTransform: (type) => {
    if (isTextElement(type)) {
      return "font-normal";
    } else {
      return "";
    }
  },
  transform: (value, type) => {
    if (value.fontWeight === undefined || !isTextElement(type)) return;
    if (value.fontWeight === null) return fontWeight.defaultTransform(type);

    if (value.fontWeight === "normal") return "";
    return `font-${value.fontWeight}`;
  },
};

export const fontFamilySchema = z.object({
  fontFamily: z.string().optional().nullable(),
});
export type FontFamilySchema = z.infer<typeof fontFamilySchema>;

export const fontFamily: StyleType<
  FontFamilySchema,
  (element: Element["type"]) => FontFamilySchema
> = {
  schema: fontFamilySchema,
  defaultValues: () => ({
    fontFamily: "system-ui",
  }),
  defaultTransform: (type) => {
    if (isTextElement(type)) {
      return "system-ui";
    } else {
      return "";
    }
  },
  transform: (value, type) => {
    if (value.fontFamily === undefined || !isTextElement(type)) return;
    if (value.fontFamily === null) return fontFamily.defaultTransform(type);

    if (value.fontFamily === "system-ui") return "";
    return `font-[${value.fontFamily}]`;
  },
};

export const fontStyleSchema = z.object({
  fontStyle: z
    .union([z.literal("normal"), z.literal("italic")])
    .optional()
    .nullable(),
});
export type FontStyleSchema = z.infer<typeof fontStyleSchema>;

export const fontStyle: StyleType<
  FontStyleSchema,
  (element: Element["type"]) => FontStyleSchema
> = {
  schema: fontStyleSchema,
  defaultValues: () => ({
    fontStyle: "normal",
  }),
  defaultTransform: (type) => {
    if (isTextElement(type)) {
      return "font-normal";
    } else {
      return "";
    }
  },
  transform: (value, type) => {
    if (value.fontStyle === undefined || !isTextElement(type)) return;
    if (value.fontStyle === null) return fontStyle.defaultTransform(type);

    if (value.fontStyle === "normal") return "";
    return `italic`;
  },
};

export const leadingSchema = z.object({
  leading: z.coerce.number().optional().nullable(),
});
export type LeadingSchema = z.infer<typeof leadingSchema>;

export const leading: StyleType<
  LeadingSchema,
  (element: Element["type"]) => LeadingSchema
> = {
  schema: leadingSchema,
  defaultValues: () => ({
    leading: 1.5,
  }),
  defaultTransform: (type) => {
    if (isTextElement(type)) {
      return "leading-[1.5em]";
    } else {
      return "";
    }
  },
  transform: (value, type) => {
    if (value.leading === undefined || !isTextElement(type)) return;
    if (value.leading === null) return leading.defaultTransform(type);

    return `leading-[${value.leading}em]`;
  },
};

export const trackingSchema = z.object({
  tracking: z.coerce.number().optional().nullable(),
});
export type TrackingSchema = z.infer<typeof trackingSchema>;

export const tracking: StyleType<
  TrackingSchema,
  (element: Element["type"]) => TrackingSchema
> = {
  schema: trackingSchema,
  defaultValues: () => ({
    tracking: 0,
  }),
  defaultTransform: (type) => {
    if (isTextElement(type)) {
      return "tracking-[0em]";
    } else {
      return "";
    }
  },
  transform: (value, type) => {
    if (value.tracking === undefined || !isTextElement(type)) return;
    if (value.tracking === null) return tracking.defaultTransform(type);

    return `tracking-[${value.tracking}em]`;
  },
};

export const textAlignSchema = z.object({
  textAlign: z
    .union([
      z.literal("left"),
      z.literal("center"),
      z.literal("right"),
      z.literal("justify"),
    ])
    .optional()
    .nullable(),
});
export type TextAlignSchema = z.infer<typeof textAlignSchema>;

export const textAlign: StyleType<
  TextAlignSchema,
  (element: Element["type"]) => TextAlignSchema
> = {
  schema: textAlignSchema,
  defaultValues: () => ({
    textAlign: "left",
  }),
  defaultTransform: (type) => {
    if (isTextElement(type)) {
      return "text-left";
    } else {
      return "";
    }
  },
  transform: (value, type) => {
    if (value.textAlign === undefined || !isTextElement(type)) return;
    if (value.textAlign === null) return textAlign.defaultTransform(type);

    return `text-${value.textAlign}`;
  },
};

const style = [
  margin,
  padding,
  width,
  minWidth,
  maxWidth,
  height,
  maxHeight,
  minHeight,
  display,
  overflow,
  opacity,
  borderRadius,
  fill,
  stroke,
  dropShadow,
  blur,
  backdropBlur,
  position,
  x,
  y,
  fontSize,
  fontWeight,
  fontFamily,
  fontStyle,
  leading,
  tracking,
  textAlign,
];

export const styleSchema = z.object({
  ...marginSchema.shape,
  ...paddingSchema.shape,
  ...widthSchema.shape,
  ...maxWidthSchema.shape,
  ...minWidthSchema.shape,
  ...heightSchema.shape,
  ...maxHeightSchema.shape,
  ...minHeightSchema.shape,
  ...displaySchema.shape,
  ...overflowSchema.shape,
  ...opacitySchema.shape,
  ...borderRadiusSchema.shape,
  ...fillSchema.shape,
  ...strokeSchema.shape,
  ...dropShadowSchema.shape,
  ...blurSchema.shape,
  ...backdropBlurSchema.shape,
  ...positionSchema.shape,
  ...xSchema.shape,
  ...ySchema.shape,
  ...fontSizeSchema.shape,
  ...fontWeightSchema.shape,
  ...fontFamilySchema.shape,
  ...fontStyleSchema.shape,
  ...leadingSchema.shape,
  ...trackingSchema.shape,
  ...textAlignSchema.shape,
});

export type StyleSchema = z.infer<typeof styleSchema>;

const attributes = ["hover", "active"] as const;
const breakpoints = ["md", "sm"] as const;

export type StyleObject = {
  default: StyleSchema;
  breakpoints: Record<(typeof breakpoints)[number], StyleSchema>;
  attributes: Record<(typeof attributes)[number], StyleSchema>;
};

export type StyleKey =
  | "default"
  | (typeof breakpoints)[number]
  | (typeof attributes)[number];

/*
 * and provides the default values for each property type
 */

export const getDefaultValues = (type: Element["type"]) => ({
  ...margin.defaultValues(),
  ...padding.defaultValues(),
  ...width.defaultValues(),
  ...maxWidth.defaultValues(),
  ...minWidth.defaultValues(),
  ...height.defaultValues(),
  ...maxHeight.defaultValues(),
  ...minHeight.defaultValues(),
  ...display.defaultValues(),
  ...overflow.defaultValues(),
  ...opacity.defaultValues(),
  ...borderRadius.defaultValues(),
  ...fill.defaultValues(type),
  ...stroke.defaultValues(),
  ...dropShadow.defaultValues(),
  ...blur.defaultValues(),
  ...backdropBlur.defaultValues(),
  ...position.defaultValues(),
  ...x.defaultValues(),
  ...y.defaultValues(),
  ...fontSize.defaultValues(type),
  ...fontWeight.defaultValues(type),
  ...fontFamily.defaultValues(type),
  ...fontStyle.defaultValues(type),
  ...leading.defaultValues(type),
  ...tracking.defaultValues(type),
  ...textAlign.defaultValues(type),
});

function assertIsAttribute(
  styleKey: any
): styleKey is (typeof attributes)[number] {
  return attributes.includes(styleKey);
}

function assertIsBreakpoint(
  styleKey: any
): styleKey is (typeof breakpoints)[number] {
  return breakpoints.includes(styleKey);
}

export function getStyleValues({
  values,
  styleKey,
  type,
}: {
  values: StyleObject;
  styleKey: StyleKey;
  type: Element["type"];
}): StyleSchema {
  const defaultValues = getDefaultValues(type);

  const isAttribute = assertIsAttribute(styleKey);
  const isBreakpoint = assertIsBreakpoint(styleKey);

  if (isAttribute) {
    return {
      ...defaultValues,
      ...values.default,
      ...values.attributes[styleKey],
    };
  }

  if (isBreakpoint) {
    let breakpointValues = { ...defaultValues, ...values.default };

    for (const value in values.breakpoints) {
      if (styleKey === value)
        return { ...breakpointValues, ...values.breakpoints[value] };
      breakpointValues = {
        ...breakpointValues,
        ...values.breakpoints[value as (typeof breakpoints)[number]],
      };
    }
  }

  return { ...defaultValues, ...values.default };
}

export function getStyleValuesBase({
  values,
  styleKey,
  type,
}: {
  values: StyleObject;
  styleKey: StyleKey;
  type: Element["type"];
}): StyleSchema {
  const base = { ...getDefaultValues(type) };

  const isBreakpoint = assertIsBreakpoint(styleKey);
  const isAttribute = assertIsAttribute(styleKey);

  if (isBreakpoint) {
    let breakpointValues = { ...base, ...values.default };

    for (const value in values.breakpoints) {
      if (styleKey === value) return breakpointValues;
      breakpointValues = {
        ...breakpointValues,
        ...values.breakpoints[value as (typeof breakpoints)[number]],
      };
    }
  }

  if (isAttribute) {
    return { ...base, ...values.default };
  }

  return base;
}

export function updateStyleValues({
  initialValues,
  updatedValues,
  dirtyFields,
  styleKey,
  type,
}: {
  initialValues: StyleObject;
  updatedValues: StyleSchema;
  dirtyFields: FieldNamesMarkedBoolean<StyleSchema>;
  styleKey: StyleKey;
  type: Element["type"];
}): StyleObject {
  const base = getStyleValuesBase({ values: initialValues, styleKey, type });
  const updatedStyle: StyleSchema = {};

  Object.entries(updatedValues).forEach(([key, value]) => {
    const isEqualEval = isEqual(value, base[key as keyof StyleSchema]);
    const isNull = value === null;
    const isDirty = dirtyFields[key as keyof StyleSchema];
    const isDefault = styleKey === "default";

    if (isEqualEval && !isDirty) return;
    if (isEqualEval && isDirty && isDefault) return;
    if (isNull && isDirty && isDefault) return;

    if (value === undefined) return;

    // @ts-expect-error key mapping poorly implemented
    return (updatedStyle[key as keyof StyleSchema] = value);
  });

  const isAttribute = assertIsAttribute(styleKey);
  const isBreakpoint = assertIsBreakpoint(styleKey);

  if (isAttribute) {
    return {
      ...initialValues,
      attributes: {
        ...initialValues.attributes,
        [styleKey]: updatedStyle,
      },
    };
  }

  if (isBreakpoint) {
    return {
      ...initialValues,
      breakpoints: {
        ...initialValues.breakpoints,
        [styleKey]: updatedStyle,
      },
    };
  }

  return {
    ...initialValues,
    default: updatedStyle,
  };
}

/*
 * This implements the stuctures into CSS styles for each property type
 */

function assertIsVariable(
  value: any
): value is { type: "variable"; id: string } {
  if (!value) return false;
  return value.type === "variable";
}

export const parseJSONToTailwindCSS = (
  styleObj: StyleSchema | undefined,
  elementType: Element["type"],
  variables: Variable[],
  prefix?: string
): string => {
  if (styleObj === undefined || !Object.keys(styleObj).length) return "";

  const tailwindCSSArray = Object.entries(styleObj).flatMap(([type, value]) => {
    const styleType = style.find((style) =>
      Object.keys(style.schema.shape).includes(type)
    );

    function getValue<T>(value: T) {
      if (assertIsVariable(value)) {
        value;
        return vars.getVariable(value, variables);
      }
      return value;
    }

    const tailwindCSSStyle = styleType!.transform(
      Object.fromEntries([[type, getValue(value)]]),
      elementType
    );

    return tailwindCSSStyle ? tailwindCSSStyle.split(" ") : [];
  });

  if (prefix) return `${prefix}:${tailwindCSSArray.join(` ${prefix}:`)}`;
  return tailwindCSSArray.join(" ");
};

function isValueEqual<T>(value1: T, value2: T) {
  if (typeof value1 !== typeof value2) return false;
  if (typeof value1 === "object") return isEqual(value1, value2);
  return value1 === value2;
}

export const generateTailwindCSS = (
  styleObj: StyleObject | undefined,
  elementType: Element["type"],
  variables: Variable[]
): string | undefined => {
  if (!styleObj) return;
  // rough cut
  let styleObjectReversedOnBreakPointsBreakpoints = {
    lg: { ...styleObj.default },
    ...styleObj.breakpoints,
  };

  let breakpointValues = { ...styleObj.default };

  for (const breakpoint in styleObjectReversedOnBreakPointsBreakpoints) {
    const breakpointValuesObj = {
      ...breakpointValues,
    };

    Object.entries(
      styleObjectReversedOnBreakPointsBreakpoints[
        breakpoint as (typeof breakpoints)[number]
      ]
    ).forEach(([key, value]) => {
      if (value === null)
        return (breakpointValuesObj[key as keyof StyleSchema] = undefined);
      // @ts-expect-error key mapping poorly implemented
      breakpointValuesObj[key as keyof StyleSchema] = value;
    });

    styleObjectReversedOnBreakPointsBreakpoints = {
      ...styleObjectReversedOnBreakPointsBreakpoints,
      [breakpoint as (typeof breakpoints)[number]]: breakpointValuesObj,
    };
    breakpointValues = { ...breakpointValuesObj };
  }

  const styleObjectReversedOnBreakPoints = {
    ...styleObj,
    breakpoints: styleObjectReversedOnBreakPointsBreakpoints,
  };

  // omit duplicates
  const breakpointsStyles: Partial<
    Record<(typeof breakpoints)[number], StyleSchema>
  > = {};
  let compoundStyles: StyleSchema = {};

  function generateBreakpointStyles(
    breakpointValue: StyleSchema,
    compoundStyles: StyleSchema
  ) {
    const compoundStylesEntries = Object.entries(compoundStyles);
    if (!compoundStylesEntries.length) return breakpointValue;

    const breakpointStyles: StyleSchema = {};

    compoundStylesEntries.forEach(([key]) => {
      const breakpointValueValue = breakpointValue[key as keyof StyleSchema];
      const compoundStylesValue = compoundStyles[key as keyof StyleSchema];

      if (breakpointValueValue === undefined && compoundStylesValue !== null)
        return (breakpointStyles[key as keyof StyleSchema] = null);

      if (
        isValueEqual(breakpointValueValue, compoundStylesValue) ||
        breakpointValueValue === undefined
      )
        return;

      // @ts-expect-error key mapping poorly implemented
      return (breakpointStyles[key as keyof StyleSchema] =
        breakpointValueValue);
    });

    return breakpointStyles;
  }

  const reversedBreakpoints = Object.entries(
    styleObjectReversedOnBreakPoints.breakpoints
  ).reverse();

  reversedBreakpoints.forEach(([breakpointKey, breakpointValue]) => {
    const breakpointStyles = generateBreakpointStyles(
      breakpointValue,
      compoundStyles
    );

    breakpointsStyles[breakpointKey as (typeof breakpoints)[number]] =
      breakpointStyles;
    compoundStyles = { ...compoundStyles, ...breakpointStyles };
  });

  const breakpointsTailwindCSS = Object.entries(breakpointsStyles)
    .map(([breakpointKey, breakpointStyles], index) => {
      const prefix = index ? breakpointKey : undefined;
      return parseJSONToTailwindCSS(
        breakpointStyles,
        elementType,
        variables,
        prefix
      );
    })
    .join(" ");

  const attributesTailwindCSS = Object.entries(
    styleObjectReversedOnBreakPoints.attributes
  )
    .map(([attributeKey, attributeStyles]) => {
      return parseJSONToTailwindCSS(
        attributeStyles,
        elementType,
        variables,
        attributeKey
      );
    })
    .join(" ");

  return [breakpointsTailwindCSS, attributesTailwindCSS].join(" ");
};

/*
 * This is the hook that is used to generate the CSS styles
 */

export const useBaseStyles = () => {
  useEffect(() => {
    const baseStyle = document.createElement("style");
    baseStyle.innerHTML = `
      @layer base {
        div, section {
          display: flex;
          flex-direction: column;
          align-items: start;
        }
      }
    `;
    document.head.appendChild(baseStyle);

    const tailwindCSSScript = document.createElement("script");
    tailwindCSSScript.src =
      "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
    document.head.appendChild(tailwindCSSScript);

    return () => {
      document.head.removeChild(baseStyle);
      document.head.removeChild(tailwindCSSScript);
    };
  }, []);
};

export const useTailwindCSS = () => {
  useEffect(() => {
    const tailwindCSSScript = document.createElement("script");
    tailwindCSSScript.src =
      "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
    document.head.appendChild(tailwindCSSScript);

    return () => {
      document.head.removeChild(tailwindCSSScript);
    };
  }, []);
};
