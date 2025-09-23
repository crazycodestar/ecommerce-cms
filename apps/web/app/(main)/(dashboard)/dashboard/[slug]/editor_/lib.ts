import {
  canHaveChildren,
  ElementType,
  layers,
  type Page,
} from "@/hooks/use-editor/elements";
import { DragLocationHistory } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";

export type HighlightBox = {
  left: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  type: ElementType | undefined;
  name: string;
  id: string;
};

export const recursivelyFindNearestElement = (
  el: HTMLElement
): (HTMLElement & { dataset: { id: string } }) | null => {
  if (el.dataset.id) return el as HTMLElement & { dataset: { id: string } };
  if (el.parentElement) return recursivelyFindNearestElement(el.parentElement);
  return null;
};

export type DropIndicatorType = Omit<
  HighlightBox,
  "type" | "bottom" | "id" | "name"
>;

type Direction = "top" | "right" | "left" | "bottom";

export function closestEdge({
  element,
  mousePosition,
  windowScroll,
  canDrop,
  directions,
}: {
  element: {
    top: number;
    left: number;
    bottom: number;
    right: number;
    width: number;
    height: number;
  };
  mousePosition: { clientX: number; clientY: number };
  windowScroll: { scrollX: number; scrollY: number };
  canDrop: boolean;
  directions: Direction[];
}) {
  if (!canDrop) {
    const distanceObj = {
      top: Math.abs(element.top - mousePosition.clientY),
      right: Math.abs(element.right - mousePosition.clientX),
      left: Math.abs(element.left - mousePosition.clientX),
      bottom: Math.abs(element.bottom - mousePosition.clientY),
    };

    let minDistance: [direction: Direction, distance: number] | undefined;
    Object.entries(distanceObj).forEach(([key, value]) => {
      if (!directions.includes(key as Direction)) return;
      if (minDistance && value > minDistance[1]) return;

      minDistance = [key as Direction, value];
    });

    if (minDistance![0] === "top") {
      return {
        edge: "top" as const,
        instruction: "before" as const,
        top: element.top + windowScroll.scrollY,
        left: element.left + windowScroll.scrollX,
        width: element.width,
        height: 0,
      };
    }
    if (minDistance![0] === "right") {
      return {
        edge: "right" as const,
        instruction: "after" as const,
        top: element.top + windowScroll.scrollY,
        left: element.left + element.width + windowScroll.scrollX,
        width: 0,
        height: element.height,
      };
    }
    if (minDistance![0] === "left") {
      return {
        edge: "left" as const,
        instruction: "before" as const,
        top: element.top + windowScroll.scrollY,
        left: element.left + windowScroll.scrollX,
        width: 0,
        height: element.height,
      };
    }
    if (minDistance![0] === "bottom") {
      return {
        edge: "bottom" as const,
        instruction: "after" as const,
        top: element.top + element.height + windowScroll.scrollY,
        left: element.left + windowScroll.scrollX,
        width: element.width,
        height: 0,
      };
    }
  }
  const THRESHOLD = 10;

  if (
    mousePosition.clientX < element.left + THRESHOLD &&
    directions.includes("left")
  ) {
    return {
      edge: "left" as const,
      instruction: "before" as const,
      top: element.top + windowScroll.scrollY,
      left: element.left + windowScroll.scrollX,
      width: 0,
      height: element.height,
    };
  }
  if (
    mousePosition.clientX > element.right - THRESHOLD &&
    directions.includes("right")
  ) {
    return {
      edge: "right" as const,
      instruction: "after" as const,
      top: element.top + windowScroll.scrollY,
      left: element.left + element.width + windowScroll.scrollX,
      width: 0,
      height: element.height,
    };
  }
  if (
    mousePosition.clientY < element.top + THRESHOLD &&
    directions.includes("top")
  ) {
    return {
      edge: "top" as const,
      instruction: "before" as const,
      top: element.top + windowScroll.scrollY,
      left: element.left + windowScroll.scrollX,
      width: element.width,
      height: 0,
    };
  }
  if (
    mousePosition.clientY > element.bottom - THRESHOLD &&
    directions.includes("bottom")
  ) {
    return {
      edge: "bottom" as const,
      instruction: "after" as const,
      top: element.top + element.height + windowScroll.scrollY,
      left: element.left + windowScroll.scrollX,
      width: element.width,
      height: 0,
    };
  }
  return null;
}

export const getClosestAndDropTarget = (
  location: DragLocationHistory,
  page: Page
) => {
  const dropTarget = location.current.dropTargets[0]?.element as
    | globalThis.Element
    | undefined;
  const parentElement = location.current.dropTargets[1]?.element as
    | globalThis.Element
    | undefined;
  const dropTargetRect = dropTarget?.getBoundingClientRect();

  const dropTargetDataSetId = (dropTarget as HTMLElement)?.dataset.id;
  const dropTargetDataSetElement = dropTargetDataSetId
    ? layers.find(page.body, dropTargetDataSetId)
    : undefined;

  const isFlexRow = parentElement?.className.includes("flex-row");
  const isGrid = parentElement?.className.includes("grid");

  const closest = dropTargetRect
    ? closestEdge({
        element: dropTargetRect,
        mousePosition: location.current.input,
        windowScroll: window,
        canDrop: !!(
          dropTargetDataSetElement && canHaveChildren(dropTargetDataSetElement)
        ),
        directions: isFlexRow
          ? ["left", "right"]
          : isGrid
            ? ["top", "bottom", "left", "right"]
            : ["top", "bottom"],
      })
    : null;

  const parentEl = location.current.dropTargets[1]?.element as
    | globalThis.Element
    | undefined;
  const el = closest ? parentEl : dropTarget;
  const rect = el?.getBoundingClientRect();

  return {
    closest,
    activeElement:
      el && rect
        ? {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY,
            width: rect.width,
            height: rect.height,
            type: layers.find(page.body, el.id)?.type,
            name: layers.find(page.body, el.id)?.name ?? "",
            id: (el as HTMLElement).id,
          }
        : null,
    dropTarget,
  };
};
