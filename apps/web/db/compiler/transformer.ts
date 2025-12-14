import { Slot } from "../types";
import { gradientValueSchema, StyleSchema } from "../types/style";
import { defaultStyle } from "./default";
import { threeBlueOneBrown, ThreeBlueOneBrown } from "./lib/threeBlueOnBrown";
import { generateOpacityHex } from "./lib/generateOpacityHex";
import { z } from "zod";

function formatMargin(value?: number | "auto") {
  if (value === undefined) return "0";
  if (typeof value === "number") return `[${value}px]`;
  return value;
}

// margin transformer
function marginTransformer(value: Partial<StyleSchema>) {
  if (
    value.marginLeft === undefined &&
    value.marginRight === undefined &&
    value.marginTop === undefined &&
    value.marginBottom === undefined
  )
    return;
  const margin = {
    top: value.marginTop,
    right: value.marginRight,
    bottom: value.marginBottom,
    left: value.marginLeft,
  };
  const isSame = Object.values(margin).every((v) => v === margin.top);
  if (isSame) return `m-${formatMargin(margin.top)}`;

  const assertThreeBlueOneBrown = threeBlueOneBrown(
    Object.values(margin) as ThreeBlueOneBrown<number>
  );
  if (assertThreeBlueOneBrown) {
    const [threeBlue, oneBrown] = assertThreeBlueOneBrown;
    const [side] = Object.entries(margin).find(
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

  const isVertical = margin.top === margin.bottom;
  const isVerticalDefault = margin.top === defaultStyle.marginTop;

  const isHorizontal = margin.left === margin.right;
  const isHorizontalDefault = margin.left === defaultStyle.marginLeft;

  if (isVertical && isHorizontal)
    return `mx-${formatMargin(margin.left)} my-${formatMargin(margin.top)}`;
  if (isVertical && !isVerticalDefault)
    return `my-${formatMargin(margin.top)} ml-${formatMargin(margin.left)} mr-${formatMargin(margin.right)}`;
  if (isHorizontal && !isHorizontalDefault)
    return `mx-${formatMargin(margin.right)} mt-${formatMargin(margin.top)} mb-${formatMargin(margin.bottom)}`;

  return `mt-${formatMargin(margin.top)} mr-${formatMargin(margin.right)} mb-${formatMargin(margin.bottom)} ml-${formatMargin(margin.left)}`;
}

// padding transformer
function paddingTransformer(value: Partial<StyleSchema>) {
  if (
    value.paddingLeft === undefined &&
    value.paddingRight === undefined &&
    value.paddingTop === undefined &&
    value.paddingBottom === undefined
  )
    return;
  const padding = {
    top: value.paddingTop,
    right: value.paddingRight,
    bottom: value.paddingBottom,
    left: value.paddingLeft,
  };

  const isSame = Object.values(padding).every((v) => v === padding.top);
  if (isSame) return `p-[${padding.top}px]`;

  const assertThreeBlueOneBrown = threeBlueOneBrown(
    Object.values(padding) as ThreeBlueOneBrown<number>
  );
  if (assertThreeBlueOneBrown) {
    const [threeBlue, oneBrown] = assertThreeBlueOneBrown;
    const [side] = Object.entries(padding).find(
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

  const isVertical = padding.top === padding.bottom;
  const isVerticalDefault = padding.top === defaultStyle.paddingTop;

  const isHorizontal = padding.left === padding.right;
  const isHorizontalDefault = padding.left === defaultStyle.paddingLeft;

  if (isVertical && isHorizontal)
    return `px-[${padding.left}px] py-[${padding.top}px]`;
  if (isVertical && !isVerticalDefault)
    return `py-[${padding.top}px] pl-[${padding.left}px] pr-[${padding.right}px]`;
  if (isHorizontal && !isHorizontalDefault)
    return `px-[${padding.right}px] pt-[${padding.top}px] pb-[${padding.bottom}px]`;

  return `pt-[${padding.top}px] pr-[${padding.right}px] pb-[${padding.bottom}px] pl-[${padding.left}px]`;
}

// width transformer
function widthTransformer(value: Partial<StyleSchema>) {
  if (value.width === undefined) return;

  if (value.width === "auto") return "w-auto";
  if (value.width === "fill-container") return "w-full";
  if (value.width === "hug-content") return "w-fit";
  if (value.width === "fill-screen") return "w-screen";

  return `w-[${value.width}px]`;
}

// max width transformer
function maxWidthTransformer(value: Partial<StyleSchema>) {
  if (value.maxWidth === undefined) return;

  if (value.maxWidth === "none") return "max-w-none";
  if (value.maxWidth === "fill-container") return "max-w-full";
  if (value.maxWidth === "hug-content") return "max-w-fit";
  if (value.maxWidth === "fill-screen") return "max-w-screen";

  return `max-w-[${value.maxWidth}px]`;
}

// min width transformer
function minWidthTransformer(value: Partial<StyleSchema>) {
  if (value.minWidth === undefined) return;

  if (value.minWidth === "auto") return "min-w-auto";
  if (value.minWidth === "fill-container") return "min-w-full";
  if (value.minWidth === "hug-content") return "min-w-fit";
  if (value.minWidth === "fill-screen") return "min-w-screen";

  return `min-w-[${value.minWidth}px]`;
}

// height transformer
function heightTransformer(value: Partial<StyleSchema>) {
  if (value.height === undefined) return;

  if (value.height === "auto") return "h-auto";
  if (value.height === "fill-container") return "h-full";
  if (value.height === "hug-content") return "h-fit";
  if (value.height === "fill-screen") return "h-screen";

  return `h-[${value.height}px]`;
}

// max height transformer
function maxHeightTransformer(value: Partial<StyleSchema>) {
  if (value.maxHeight === undefined) return;

  if (value.maxHeight === "none") return "max-h-none";
  if (value.maxHeight === "fill-container") return "max-h-full";
  if (value.maxHeight === "hug-content") return "max-h-fit";
  if (value.maxHeight === "fill-screen") return "max-h-screen";

  return `max-h-[${value.maxHeight}px]`;
}

// min height transformer
function minHeightTransformer(value: Partial<StyleSchema>) {
  if (value.minHeight === undefined) return;

  if (value.minHeight === "auto") return "min-h-auto";
  if (value.minHeight === "fill-container") return "min-h-full";
  if (value.minHeight === "hug-content") return "min-h-fit";
  if (value.minHeight === "fill-screen") return "min-h-screen";

  return `min-h-[${value.minHeight}px]`;
}

// display transformer
function displayTransformer(value: Partial<StyleSchema>) {
  if (
    value.display === undefined &&
    value.gapX === undefined &&
    value.gapY === undefined &&
    value.gridCols === undefined &&
    value.flexWrap === undefined &&
    value.justifyContent === undefined &&
    value.alignItems === undefined
  )
    return;

  let style: string[] = [];

  function resolveJusitifyContent(
    justifyContent: Partial<StyleSchema>["justifyContent"]
  ) {
    if (justifyContent === "start") return "justify-start";

    if (justifyContent === "end") return "justify-end";

    if (justifyContent === "center") return "justify-center";

    if (justifyContent === "space-between") return "justify-between";

    return "";
  }

  function resolveAlignItems(alignItems: Partial<StyleSchema>["alignItems"]) {
    if (alignItems === "start") return "items-start";

    if (alignItems === "end") return "items-end";

    if (alignItems === "center") return "items-center";

    return "";
  }

  function resolveFlexWrap(flexWrap: Partial<StyleSchema>["flexWrap"]) {
    if (flexWrap === "nowrap") return "flex-nowrap";

    if (flexWrap === "wrap") return "flex-wrap";

    return "";
  }

  function resolveGridCols(gridCols: Partial<StyleSchema>["gridCols"]) {
    if (gridCols === undefined) return "grid-cols-1";

    return `grid-cols-${gridCols}`;
  }

  style.push(resolveJusitifyContent(value.justifyContent));
  style.push(resolveAlignItems(value.alignItems));

  if (value.gapX !== undefined || value.gapY !== undefined) {
    if (value.gapX !== undefined && value.gapY !== undefined) {
      if (value.gapX === value.gapY)
        style.push(value.gapX === 0 ? "gap-0" : `gap-[${value.gapX}px]`);
      else
        style.push(
          `${value.gapX === 0 ? "gap-x-0" : `gap-x-[${value.gapX}px]`} ${value.gapY === 0 ? "gap-y-0" : `gap-y-[${value.gapY}px]`}`
        );
    } else if (value.gapX !== undefined) {
      style.push(value.gapX === 0 ? "gap-0" : `gap-[${value.gapX}px]`);
    }
  }

  style.push(resolveFlexWrap(value.flexWrap));
  style.push(resolveGridCols(value.gridCols));

  switch (value.display) {
    case "flex-col":
      style.push("flex", "flex-col");
      break;
    case "flex-row":
      style.push("flex", "flex-row");
      break;
    case "grid":
      style.push("grid");
      break;
    case "inline":
      style.push("inline");
      break;
    case "hidden":
      style.push("hidden");
      break;
  }

  return style.join(" ");
}

// overflow transformer
function overflowTransformer(value: Partial<StyleSchema>) {
  if (value.overflowX === undefined && value.overflowY === undefined) return;

  if (value.overflowX === value.overflowY) return `overflow-${value.overflowX}`;

  return `${value.overflowX ? `overflow-x-${value.overflowX}` : ""} ${value.overflowY ? `overflow-y-${value.overflowY}` : ""}`;
}

// opacity transformer
function opacityTransformer(value: Partial<StyleSchema>) {
  if (value.opacity === undefined) return;

  if (value.opacity % 5) return `opacity-[${value.opacity / 100}]`;
  return `opacity-${value.opacity}`;
}

// border radius transformer

function borderRadiusTransformer(value: Partial<StyleSchema>) {
  if (
    value.borderRadiusTopLeft === undefined &&
    value.borderRadiusTopRight === undefined &&
    value.borderRadiusBottomRight === undefined &&
    value.borderRadiusBottomLeft === undefined
  )
    return;

  const { topLeft, topRight, bottomRight, bottomLeft } = {
    topLeft: value.borderRadiusTopLeft,
    topRight: value.borderRadiusTopRight,
    bottomRight: value.borderRadiusBottomRight,
    bottomLeft: value.borderRadiusBottomLeft,
  };

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
      else classes += `rounded-tr-[${topRight}px] rounded-br-[${topRight}px] `;
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
}

// fill transformer
const isTextElement = (type: Slot["type"]) =>
  type === "text" || type === "link";

type GradientValueSchema = z.infer<typeof gradientValueSchema>;

function fillTransformer(value: Partial<StyleSchema>, type: Slot["type"]) {
  if (value.fill === undefined) return;

  if (value.fill === "none") return "bg-transparent";

  const fillValue = value.fill;

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
    case "variable":
      style.push(`bg-${fillValue.value}`);
      break;
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
}

// stroke transformer
// FIXME: This is a temporary solution to handle the stroke transformer
function strokeTransformer(value: Partial<StyleSchema>) {
  if (
    value.strokeFill === undefined ||
    value.strokeWidth === undefined ||
    value.strokeStyle === undefined
  )
    return;

  if (value.strokeFill === "none") return "border-none";

  const stroke = {
    fill: value.strokeFill,
    width: value.strokeWidth,
    style: value.strokeStyle,
  };

  let style: string[] = [];
  stroke.fill.type === "color" &&
    style.push(
      `border-[${stroke.fill.value}${generateOpacityHex(stroke.fill.opacity)}]`
    );
  stroke.fill.type === "variable" &&
    style.push(`border-[${stroke.fill.value}]`);
  style.push(`border-[${stroke.width}px]`);
  style.push(`border-${stroke.style}`);
  return style.join(" ");
}

// drop shadow transformer
function dropShadowTransformer(value: Partial<StyleSchema>) {
  if (value.dropShadow === undefined) return;

  if (value.dropShadow === "none") return "shadow-none";
  return `drop-shadow-[${value.dropShadow.x}px_${value.dropShadow.y}px_${value.dropShadow.spread}px_${value.dropShadow.color.value}${generateOpacityHex(value.dropShadow.color.opacity)}]`;
}

// blur transformer
function blurTransformer(value: Partial<StyleSchema>) {
  if (value.blur === undefined) return;
  return `blur-[${value.blur}px]`;
}

// backdrop blur transformer
function backdropBlurTransformer(value: Partial<StyleSchema>) {
  if (value.backdropBlur === undefined) return;
  return `backdrop-blur-[${value.backdropBlur}px]`;
}

// position transformer
function positionTransformer(value: Partial<StyleSchema>) {
  if (value.position === undefined) return;

  switch (value.position) {
    case "relative":
      let style = `relative ${value.alignSelf ? `self-${value.alignSelf}` : "self-auto"} ${value.colSpan && value.colSpan !== 1 ? `col-span-${value.colSpan}` : "col-span-1"}`;
      switch (value.justifySelf) {
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
}

// x transformer
function xTransformer(value: Partial<StyleSchema>) {
  if (value.left === undefined && value.right === undefined) return;
  return `${value.left ? `left-[${value.left}px]` : ""} ${value.right ? `right-[${value.right}px]` : ""}`;
}

// y transformer
function yTransformer(value: Partial<StyleSchema>) {
  if (value.top === undefined && value.bottom === undefined) return;
  return `${value.top ? `top-[${value.top}px]` : ""} ${value.bottom ? `bottom-[${value.bottom}px]` : ""}`;
}

// font size transformer
function fontSizeTransformer(value: Partial<StyleSchema>, type: Slot["type"]) {
  const fontSizeValue = value.fontSize;
  if (fontSizeValue === undefined || !isTextElement(type)) return;
  return `text-[${fontSizeValue}px]`;
}

// font weight transformer
function fontWeightTransformer(
  value: Partial<StyleSchema>,
  type: Slot["type"]
) {
  if (value.fontWeight === undefined || !isTextElement(type)) return;

  if (value.fontWeight === "normal") return "";
  return `font-${value.fontWeight}`;
}

// font family transformer
function fontFamilyTransformer(
  value: Partial<StyleSchema>,
  type: Slot["type"]
) {
  if (value.fontFamily === undefined || !isTextElement(type)) return;

  if (value.fontFamily === "system-ui") return "";
  return `font-[${value.fontFamily}]`;
}

// font style transformer
function fontStyleTransformer(value: Partial<StyleSchema>, type: Slot["type"]) {
  if (value.fontStyle === undefined || !isTextElement(type)) return;

  if (value.fontStyle === "normal") return "";
  return `italic`;
}

// leading transformer
function leadingTransformer(value: Partial<StyleSchema>, type: Slot["type"]) {
  if (value.leading === undefined || !isTextElement(type)) return;
  return `leading-[${value.leading}em]`;
}

// tracking transformer
function trackingTransformer(value: Partial<StyleSchema>, type: Slot["type"]) {
  if (value.tracking === undefined || !isTextElement(type)) return;
  return `tracking-[${value.tracking}em]`;
}

// text align transformer
function textAlignTransformer(value: Partial<StyleSchema>, type: Slot["type"]) {
  if (value.textAlign === undefined || !isTextElement(type)) return;
  return `text-${value.textAlign}`;
}

function transform(value: Partial<StyleSchema>, type: Slot["type"]) {
  const properties = {
    margin: marginTransformer(value),
    padding: paddingTransformer(value),
    width: widthTransformer(value),
    maxWidth: maxWidthTransformer(value),
    minWidth: minWidthTransformer(value),
    height: heightTransformer(value),
    maxHeight: maxHeightTransformer(value),
    minHeight: minHeightTransformer(value),
    display: displayTransformer(value),
    overflow: overflowTransformer(value),
    opacity: opacityTransformer(value),
    borderRadius: borderRadiusTransformer(value),
    fill: fillTransformer(value, type),
    stroke: strokeTransformer(value),
    dropShadow: dropShadowTransformer(value),
    blur: blurTransformer(value),
    backdropBlur: backdropBlurTransformer(value),
    position: positionTransformer(value),
    x: xTransformer(value),
    y: yTransformer(value),
    fontSize: fontSizeTransformer(value, type),
    fontWeight: fontWeightTransformer(value, type),
    fontFamily: fontFamilyTransformer(value, type),
    fontStyle: fontStyleTransformer(value, type),
    leading: leadingTransformer(value, type),
    tracking: trackingTransformer(value, type),
    textAlign: textAlignTransformer(value, type),
  };
  return Object.values(properties).filter(Boolean).join(" ");
}

export default transform;
