import { useEffect } from "react";
import { z } from "zod";
import { useEditor } from ".";
import { isEqual } from "es-toolkit";
import { cn } from "@/lib/utils";

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

type StyleType<T extends {}> = {
  schema: z.ZodObject<any>;
  defaultValues: T;
  transform: (value: T) => string;
};

/*
 * This structures the schemas and types for the styles
 */

export type ClassName = string;

export const marginShape = z.union([z.coerce.number(), z.literal("auto")]);
export type MarginShape = z.infer<typeof marginShape>;

export const marginSchema = z.object({
  margin: z.object({
    top: marginShape,
    right: marginShape,
    bottom: marginShape,
    left: marginShape,
  }),
});
export type MarginSchema = z.infer<typeof marginSchema>;

export const margin: StyleType<MarginSchema> = {
  schema: marginSchema,
  defaultValues: {
    margin: {
      top: "auto",
      right: "auto",
      bottom: "auto",
      left: "auto",
    },
  },
  transform: (value: MarginSchema) => {
    function formatMargin(value: number | "auto") {
      if (typeof value === "number") return `[${value}px]`;
      return value;
    }
    if (isEqual(value, margin.defaultValues)) return "";

    const isSame = Object.values(value.margin).every(
      (v) => v === value.margin.top
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
      value.margin.top === margin.defaultValues.margin.top;

    const isHorizontal = value.margin.left === value.margin.right;
    const isHorizontalDefault =
      value.margin.left === margin.defaultValues.margin.left;

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
  padding: z.object({
    top: z.coerce.number(),
    right: z.coerce.number(),
    bottom: z.coerce.number(),
    left: z.coerce.number(),
  }),
});
export type PaddingSchema = z.infer<typeof paddingSchema>;

export const padding: StyleType<PaddingSchema> = {
  schema: paddingSchema,
  defaultValues: {
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  transform: (value: PaddingSchema) => {
    if (isEqual(value, padding.defaultValues)) return "";

    const isSame = Object.values(value.padding).every(
      (v) => v === value.padding.top
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
      value.padding.top === padding.defaultValues.padding.top;

    const isHorizontal = value.padding.left === value.padding.right;
    const isHorizontalDefault =
      value.padding.left === padding.defaultValues.padding.left;

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
  width: widthObjectShape,
  // maxWidth: auxWidthObjectShape,
  // minWidth: auxWidthObjectShape,
});
export type WidthSchema = z.infer<typeof widthSchema>;

export const width: StyleType<WidthSchema> = {
  schema: widthSchema,
  defaultValues: {
    width: "auto",
  },
  transform: (value: WidthSchema) => {
    if (isEqual(value, width.defaultValues)) return "";

    if (value.width === "auto") return "w-auto";
    if (value.width === "fill-container") return "w-full";
    if (value.width === "hug-content") return "w-fit";
    if (value.width === "fill-screen") return "w-screen";

    return `w-[${value.width}px]`;
  },
};

export const auxWidthObjectShape = z
  .union([
    z.coerce.number(),
    z.literal("fill-container"),
    z.literal("hug-content"),
    z.literal("fill-screen"),
  ])
  .optional();

export const maxWidthSchema = z.object({
  maxWidth: auxWidthObjectShape,
});
export type MaxWidthSchema = z.infer<typeof maxWidthSchema>;

export const maxWidth: StyleType<MaxWidthSchema> = {
  schema: maxWidthSchema,
  defaultValues: {
    maxWidth: undefined,
  },
  transform: (value: MaxWidthSchema) => {
    if (value.maxWidth === undefined) return "";

    if (value.maxWidth === "fill-container") return "max-w-full";
    if (value.maxWidth === "hug-content") return "max-w-fit";
    if (value.maxWidth === "fill-screen") return "max-w-screen";

    return `max-w-[${value.maxWidth}px]`;
  },
};

export const minWidthSchema = z.object({
  minWidth: auxWidthObjectShape,
});
export type MinWidthSchema = z.infer<typeof minWidthSchema>;

export const minWidth: StyleType<MinWidthSchema> = {
  schema: minWidthSchema,
  defaultValues: {
    minWidth: undefined,
  },
  transform: (value: MinWidthSchema) => {
    if (value.minWidth === undefined) return "";

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
  height: heightObjectShape,
});
export type HeightSchema = z.infer<typeof heightSchema>;

export const height: StyleType<HeightSchema> = {
  schema: heightSchema,
  defaultValues: {
    height: "auto",
  },
  transform: (value: HeightSchema) => {
    if (isEqual(value, height.defaultValues)) return "";

    if (value.height === "auto") return "h-auto";
    if (value.height === "fill-container") return "h-full";
    if (value.height === "hug-content") return "h-fit";
    if (value.height === "fill-viewport") return "h-screen";

    return `h-[${value.height}px]`;
  },
};

export const auxHeightObjectShape = z
  .union([
    z.coerce.number(),
    z.literal("fill-container"),
    z.literal("hug-content"),
    z.literal("fill-viewport"),
  ])
  .optional();

export const maxHeightSchema = z.object({
  maxHeight: auxHeightObjectShape,
});
export type MaxHeightSchema = z.infer<typeof maxHeightSchema>;

export const maxHeight: StyleType<MaxHeightSchema> = {
  schema: maxHeightSchema,
  defaultValues: {
    maxHeight: undefined,
  },
  transform: (value: MaxHeightSchema) => {
    if (value.maxHeight === undefined) return "";

    if (value.maxHeight === "fill-container") return "max-h-full";
    if (value.maxHeight === "hug-content") return "max-h-fit";
    if (value.maxHeight === "fill-viewport") return "max-h-screen";

    return `max-h-[${value.maxHeight}px]`;
  },
};

export const minHeightSchema = z.object({
  minHeight: auxHeightObjectShape,
});
export type MinHeightSchema = z.infer<typeof minHeightSchema>;

export const minHeight: StyleType<MinHeightSchema> = {
  schema: minHeightSchema,
  defaultValues: {
    minHeight: undefined,
  },
  transform: (value: MinHeightSchema) => {
    if (value.minHeight === undefined) return "";

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

export const displaySchema = z.object({
  display: displayObjectShape,
});
export type DisplaySchema = z.infer<typeof displaySchema>;

export const display: StyleType<DisplaySchema> = {
  schema: displaySchema,
  defaultValues: {
    display: "flex-col",
  },
  transform: (value: DisplaySchema) => {
    if (isEqual(value, display.defaultValues)) return "";

    switch (value.display) {
      case "flex-col":
        // return "flex flex-col";
        return "";
      case "flex-row":
        return "flex flex-row";
      case "grid":
        return "grid";
      case "inline":
        return "inline";
      default:
        return "";
    }
  },
};

export const gapXSchema = z.object({
  gapX: z.coerce.number().optional(),
});
export type GapXSchema = z.infer<typeof gapXSchema>;

export const gapX: StyleType<GapXSchema> = {
  schema: gapXSchema,
  defaultValues: {
    gapX: undefined,
  },
  transform: (value: GapXSchema) => {
    if (value.gapX === undefined || value.gapX === 0) return "";
    return `gap-[${value.gapX}px]`;
  },
};

export const gapYSchema = z.object({
  gapY: z.coerce.number().optional(),
});
export type GapYSchema = z.infer<typeof gapYSchema>;

export const gapY: StyleType<GapYSchema> = {
  schema: gapYSchema,
  defaultValues: {
    gapY: undefined,
  },
  transform: (value: GapYSchema) => {
    if (value.gapY === undefined || value.gapY === 0) return "";
    return `gap-y-[${value.gapY}px]`;
  },
};

export const justifyContentSchema = z.object({
  justifyContent: z
    .union([
      z.literal("start"),
      z.literal("end"),
      z.literal("center"),
      z.literal("space-between"),
    ])
    .optional(),
});
export type JustifyContentSchema = z.infer<typeof justifyContentSchema>;

export const justifyContent: StyleType<JustifyContentSchema> = {
  schema: justifyContentSchema,
  defaultValues: {
    justifyContent: "start",
  },
  transform: (value: JustifyContentSchema) => {
    if (
      value.justifyContent === undefined ||
      isEqual(value, justifyContent.defaultValues)
    )
      return "";

    switch (value.justifyContent) {
      case "start":
        return "justify-start";
      case "end":
        return "justify-end";
      case "center":
        return "justify-center";
      case "space-between":
        return "justify-between";
      default:
        return "";
    }
  },
};

export const alignItemsSchema = z.object({
  alignItems: z
    .union([
      z.literal("start"),
      z.literal("end"),
      z.literal("center"),
      z.literal("space-between"),
    ])
    .optional(),
});
export type AlignItemsSchema = z.infer<typeof alignItemsSchema>;

export const alignItems: StyleType<AlignItemsSchema> = {
  schema: alignItemsSchema,
  defaultValues: {
    alignItems: "start",
  },
  transform: (value: AlignItemsSchema) => {
    if (
      value.alignItems === undefined ||
      isEqual(value, alignItems.defaultValues)
    )
      return "";

    switch (value.alignItems) {
      case "start":
        return "items-start";
      case "end":
        return "items-end";
      case "center":
        return "items-center";
      case "space-between":
        return "items-stretch";
      default:
        return "";
    }
  },
};

export const flexWrapSchema = z.object({
  flexWrap: z.union([z.literal("nowrap"), z.literal("wrap")]).optional(),
});
export type FlexWrapSchema = z.infer<typeof flexWrapSchema>;

export const flexWrap: StyleType<FlexWrapSchema> = {
  schema: flexWrapSchema,
  defaultValues: {
    flexWrap: undefined,
  },
  transform: (value: FlexWrapSchema) => {
    if (value.flexWrap === undefined) return "";

    switch (value.flexWrap) {
      case "nowrap":
        return "flex-nowrap";
      case "wrap":
        return "flex-wrap";
      default:
        return "";
    }
  },
};

export const gridColsSchema = z.object({
  gridCols: z.coerce.number().optional(),
});
export type GridColsSchema = z.infer<typeof gridColsSchema>;

export const gridCols: StyleType<GridColsSchema> = {
  schema: gridColsSchema,
  defaultValues: {
    gridCols: undefined,
  },
  transform: (value: GridColsSchema) => {
    if (value.gridCols === undefined) return "";
    return `grid-cols-${value.gridCols}`;
  },
};

export const overflowSchema = z.object({
  overflow: z.union([z.literal("hidden"), z.literal("auto")]).optional(),
});
export type OverflowSchema = z.infer<typeof overflowSchema>;

export const overflow: StyleType<OverflowSchema> = {
  schema: overflowSchema,
  defaultValues: {
    overflow: undefined,
  },
  transform: (value: OverflowSchema) => {
    if (value.overflow === undefined) return "";

    switch (value.overflow) {
      case "hidden":
        return "overflow-hidden";
      case "auto":
        return "overflow-auto";
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
  opacity: z.coerce.number().optional(),
});
export type OpacitySchema = z.infer<typeof opacitySchema>;

export const opacity: StyleType<OpacitySchema> = {
  schema: opacitySchema,
  defaultValues: {
    opacity: 100,
  },
  transform: (value: OpacitySchema) => {
    if (isEqual(value, opacity.defaultValues) || value.opacity === undefined)
      return "";
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
    .optional(),
});
export type BorderRadiusSchema = z.infer<typeof borderRadiusSchema>;

export const borderRadius: StyleType<BorderRadiusSchema> = {
  schema: borderRadiusSchema,
  defaultValues: {
    borderRadius: {
      topLeft: 0,
      topRight: 0,
      bottomRight: 0,
      bottomLeft: 0,
    },
  },
  transform: (value: BorderRadiusSchema) => {
    if (
      isEqual(value, borderRadius.defaultValues) ||
      value.borderRadius === undefined
    )
      return "";

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

const style = [
  margin,
  padding,
  width,
  height,
  maxHeight,
  minHeight,
  display,
  gapX,
  gapY,
  justifyContent,
  alignItems,
  flexWrap,
  gridCols,
  overflow,
  opacity,
  borderRadius,
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
  ...gapXSchema.shape,
  ...gapYSchema.shape,
  ...justifyContentSchema.shape,
  ...alignItemsSchema.shape,
  ...flexWrapSchema.shape,
  ...gridColsSchema.shape,
  ...overflowSchema.shape,
  ...opacitySchema.shape,
  ...borderRadiusSchema.shape,
});
export type StyleSchema = z.infer<typeof styleSchema>;

/*
 * and provides the default values for each property type
 */

export function getDefaultValues() {
  return {
    ...margin.defaultValues,
    ...padding.defaultValues,
    ...width.defaultValues,
    ...height.defaultValues,
    ...display.defaultValues,
    ...gapX.defaultValues,
    ...gapY.defaultValues,
    ...justifyContent.defaultValues,
    ...alignItems.defaultValues,
    ...flexWrap.defaultValues,
    ...gridCols.defaultValues,
    ...overflow.defaultValues,
    ...opacity.defaultValues,
    ...borderRadius.defaultValues,
  };
}

/*
 * This implements the stuctures into CSS styles for each property type
 */

export const parseJSONToTailwindCSS = <T extends StyleSchema>(
  styleObj: T | undefined
): string => {
  if (styleObj === undefined) return "";

  return cn(
    Object.entries(styleObj)
      .map(([type, value]) => {
        const styleType = style.find((style) =>
          Object.keys(style.defaultValues).includes(type)
        );

        // @ts-expect-error
        return styleType!.transform(Object.fromEntries([[type, value]]));
      })
      .join(" ")
  );
};

/*
 * This is the hook that is used to generate the CSS styles
 */

export const useBaseStyles = () => {
  useEffect(() => {
    const baseStyle = document.createElement("style");
    baseStyle.innerHTML = `
    div, section {
      display: flex;
      flex-direction: column;
      align-items: start;
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
