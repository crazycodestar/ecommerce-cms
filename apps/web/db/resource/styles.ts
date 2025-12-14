import { db } from "@/db";
import { Slot, Style, StyleOnElement } from "../types";
import { StyleSchema } from "../types/style";

type GetStylesOnElementsFilters = Partial<Omit<StyleOnElement, "id">>;
type GetStylesOnElementsIncludes = "style" | "slot";

type WithStyle<TIncludes> = "style" extends TIncludes
  ? { style: Style | undefined }
  : {};
type WithSlot<TIncludes> = "slot" extends TIncludes
  ? { slot: Slot | undefined }
  : {};

type GetStylesOnElementsResult<T extends GetStylesOnElementsIncludes[]> =
  StyleOnElement & WithStyle<T[number]> & WithSlot<T[number]>;

export async function getStylesOnElements<
  T extends GetStylesOnElementsIncludes[],
>({
  filters,
  includes,
}: {
  filters: GetStylesOnElementsFilters;
  includes: readonly [...T];
}): Promise<GetStylesOnElementsResult<T>[]> {
  let data = await db.stylesOnElements.toArray();

  // filters
  if (filters.styleId)
    data = data.filter(
      (styleOnElement) => styleOnElement.styleId === filters.styleId
    );
  if (filters.slotId)
    data = data.filter(
      (styleOnElement) => styleOnElement.slotId === filters.slotId
    );
  if (filters.type)
    data = data.filter(
      (styleOnElement) => styleOnElement.type === filters.type
    );

  // includes
  if (includes.includes("style")) {
    data = await Promise.all(
      data.map(async (styleOnElement) => {
        return {
          ...styleOnElement,
          style: await db.styles.get(styleOnElement.styleId),
        };
      })
    );
  }

  if (includes.includes("slot")) {
    data = await Promise.all(
      data.map(async (styleOnElement) => {
        return {
          ...styleOnElement,
          slot: await db.slots.get(styleOnElement.slotId),
        };
      })
    );
  }

  return data as GetStylesOnElementsResult<T>[];
}

export async function createStyle({
  style,
  slotId,
  type,
}: {
  style: Partial<StyleSchema>;
  slotId: Slot["id"];
  type: StyleOnElement["type"];
}) {
  const styleId = crypto.randomUUID();
  await db.styles.add({
    id: styleId,
    properties: style,
  });

  await db.stylesOnElements.add({
    id: crypto.randomUUID(),
    styleId,
    slotId,
    type,
  });

  return styleId;
}

export async function updateStyle({
  styleId,
  style,
}: {
  styleId: Style["id"];
  style: Partial<Omit<Style, "id">>;
}) {
  const assertStyle = await db.styles.get(styleId);
  if (!assertStyle) return;

  await db.styles.update(styleId, {
    ...style,
  });
}
