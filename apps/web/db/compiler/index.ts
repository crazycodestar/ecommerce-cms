import { StyleOnElementType } from "@/db/types";
import { StyleSchema } from "@/db/types/style";
import { Slot } from "../types";
import { defaultStyle } from "./default";
import transformer from "./transformer";

function parseJSONToTailwindCSS(
  styleObj: StyleSchema | undefined,
  elementType: Slot["type"],
  prefix?: string
): string {
  if (styleObj === undefined || !Object.keys(styleObj).length) return "";

  const tailwindCSSArray = transformer(styleObj, elementType)
    .split(" ")
    .filter(Boolean);

  if (prefix) return `${prefix}:${tailwindCSSArray.join(` ${prefix}:`)}`;
  return tailwindCSSArray.join(" ");
}

function removeDefaults(
  properties: StyleSchema,
  defaultStyle: StyleSchema
): StyleSchema {
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([key, value]) => value !== defaultStyle[key as keyof StyleSchema]
    )
  ) as StyleSchema;
}

function reverseStyleObjectToMobileFirstStyleObject(
  styleObj: Record<StyleOnElementType, StyleSchema>
): Record<StyleOnElementType, StyleSchema> {
  // breakpoint.sm
  const sm = removeDefaults(
    {
      ...styleObj.default,
      ...styleObj["breakpoint.md"],
      ...styleObj["breakpoint.sm"],
    },
    defaultStyle
  );

  // breakpoint.md
  const md = removeDefaults(
    {
      ...styleObj.default,
      ...styleObj["breakpoint.md"],
    },
    {
      ...defaultStyle,
      ...sm,
    }
  );

  // default
  const default_ = removeDefaults(
    {
      ...styleObj.default,
    },
    {
      ...defaultStyle,
      ...sm,
      ...md,
    }
  );

  // attribute.hover
  const hover = removeDefaults(
    {
      ...styleObj["attribute.hover"],
    },
    {
      ...defaultStyle,
      ...sm,
      ...md,
      ...default_,
    }
  );

  // attribute.active
  const active = removeDefaults(
    {
      ...styleObj["attribute.active"],
    },
    {
      ...defaultStyle,
      ...sm,
      ...md,
      ...default_,
    }
  );

  return {
    default: default_,
    "breakpoint.sm": sm,
    "breakpoint.md": md,
    "attribute.hover": hover,
    "attribute.active": active,
  };
}

export function generateTailwindCSS(
  styleObj: Record<StyleOnElementType, StyleSchema>,
  elementType: Slot["type"]
): string | undefined {
  const mobileFirstStyleObj =
    reverseStyleObjectToMobileFirstStyleObject(styleObj);

  const breakpointSmTailwindCSS = parseJSONToTailwindCSS(
    mobileFirstStyleObj["breakpoint.sm"],
    elementType
  );
  const breakpointMdTailwindCSS = parseJSONToTailwindCSS(
    mobileFirstStyleObj["breakpoint.md"],
    elementType,
    "md"
  );
  const defaultTailwindCSS = parseJSONToTailwindCSS(
    mobileFirstStyleObj.default,
    elementType,
    "lg"
  );
  const attributeHoverTailwindCSS = parseJSONToTailwindCSS(
    mobileFirstStyleObj["attribute.hover"],
    elementType,
    "hover"
  );
  const attributeActiveTailwindCSS = parseJSONToTailwindCSS(
    mobileFirstStyleObj["attribute.active"],
    elementType,
    "active"
  );

  return [
    breakpointSmTailwindCSS,
    breakpointMdTailwindCSS,
    defaultTailwindCSS,
    attributeHoverTailwindCSS,
    attributeActiveTailwindCSS,
  ].join(" ");
}
