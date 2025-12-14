import {
  createStyle,
  getStylesOnElements,
  updateStyle,
} from "@/db/resource/styles";
import { Slot, Style, StyleOnElement } from "@/db/types";
import { StyleSchema } from "@/db/types/style";
import { defaultStyle } from "../../compiler/default";

type StyleWithUndeterminedId = Omit<Style, "id"> & { id?: string };
type StyleObject = Record<StyleOnElement["type"], StyleWithUndeterminedId>;
type StyleObjectWithUndefined = Record<
  StyleOnElement["type"],
  Style | undefined
>;

async function getStyleObject(slotId: Slot["id"]): Promise<StyleObject> {
  const res = await getStylesOnElements({
    filters: {
      slotId,
    },
    includes: ["style"],
  });

  const fetchedStyles = await res.reduce((acc, curr) => {
    acc[curr.type] = curr.style;
    return acc;
  }, {} as StyleObjectWithUndefined);

  const defaultStyles = {
    properties: {
      ...defaultStyle,
      ...fetchedStyles.default?.properties,
    },
    id: fetchedStyles.default?.id,
  };
  const breakpointMd = {
    properties: {
      ...defaultStyles.properties,
      ...fetchedStyles["breakpoint.md"]?.properties,
    },
    id: fetchedStyles["breakpoint.md"]?.id,
  };
  const breakpointSm = {
    properties: {
      ...breakpointMd.properties,
      ...fetchedStyles["breakpoint.sm"]?.properties,
    },
    id: fetchedStyles["breakpoint.sm"]?.id,
  };
  const attributeHover = {
    properties: {
      ...defaultStyles.properties,
      ...fetchedStyles["attribute.hover"]?.properties,
    },
    id: fetchedStyles["attribute.hover"]?.id,
  };
  const attributeActive = {
    properties: {
      ...defaultStyles.properties,
      ...fetchedStyles["attribute.active"]?.properties,
    },
    id: fetchedStyles["attribute.active"]?.id,
  };

  return {
    default: defaultStyles,
    "breakpoint.md": breakpointMd,
    "breakpoint.sm": breakpointSm,
    "attribute.hover": attributeHover,
    "attribute.active": attributeActive,
  };
}

async function handleCreateStyle(
  slotId: Slot["id"],
  type: StyleOnElement["type"],
  style: Partial<StyleSchema>
) {
  return createStyle({
    style,
    slotId,
    type,
  });
}

async function handleUpdateStyle(
  styleId: Style["id"],
  style: Partial<StyleSchema>
) {
  return updateStyle({
    styleId,
    style: {
      properties: style,
    },
  });
}

export const properties = {
  getStyleObject,
  createStyle: handleCreateStyle,
  updateStyle: handleUpdateStyle,
};
