import { Slot } from "@/db/types";

export type HighlightBox = {
  left: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  type: Slot["type"] | undefined;
  name: string;
  id: string;
  parentId?: string;
  componentId?: string;
};

export const recursivelyFindNearestElement = (
  el: HTMLElement
): (HTMLElement & { dataset: { id: string } }) | null => {
  if (el.dataset.id)
    return el as HTMLElement & { dataset: { id: string; parentId?: string } };
  if (el.parentElement) return recursivelyFindNearestElement(el.parentElement);
  return null;
};

export type DropIndicatorType = Omit<
  HighlightBox,
  "type" | "bottom" | "id" | "name"
>;
