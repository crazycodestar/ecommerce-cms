"use client";

import { MoveElementParams, OnInsertElementParams } from "@/db/lib/layers";
import { Element, Slot } from "@/db/types";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  DragLocationHistory,
  DropTargetRecord,
} from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { monitorForExternal } from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import { useEffect, useState } from "react";
import { type HighlightBox } from "./lib";

type Instruction =
  | {
      position: "before";
      siblingId: Slot["id"];
    }
  | {
      position: "after";
      siblingId: Slot["id"];
    }
  | {
      position: "between";
      siblingId1: Slot["id"];
      siblingId2: Slot["id"];
    };

export type ObserverRect = Instruction & {
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: "horizontal" | "vertical";
};

export type ObserverRectPerChild = Partial<{
  left: Instruction & {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  right: Instruction & {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  top: Instruction & {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  bottom: Instruction & {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}>;

interface useMonitorProps {
  onInsertElement: (params: OnInsertElementParams) => void;
  onMoveElement: (params: MoveElementParams) => void;
}

export const useMonitor = ({
  onInsertElement,
  onMoveElement,
}: useMonitorProps) => {
  const historyIndex = 1; // FIXME: Might not be necessary if I use the data from the drop target instead of the HTML directly

  const [isDragging, setIsDragging] = useState(false);
  const [activeElement, setActiveElement] = useState<HighlightBox | null>(null);
  const [activeObserverRect, setActiveObserverRect] =
    useState<ObserverRect | null>(null);

  function handleCleanUp() {
    setIsDragging(false);
    setActiveElement(null);
    setActiveObserverRect(null);
  }

  useEffect(() => {
    return combine(
      monitorForExternal({
        onDragStart: () => setIsDragging(true),
        onDrag: ({ location }) => {
          const placement = getPlacement(location);
          if (!placement) return handleCleanUp();

          const { dropTargetRect, data, activeObserverRect } = placement;
          setActiveObserverRect(activeObserverRect ?? null);

          setActiveElement(
            dropTargetRect
              ? {
                  left: dropTargetRect.left + window.scrollX,
                  top: dropTargetRect.top + window.scrollY,
                  bottom: dropTargetRect.bottom + window.scrollY,
                  width: dropTargetRect.width,
                  height: dropTargetRect.height,
                  type: data.dropTarget.type,
                  name: data.dropTarget.name,
                  id: data.dropTarget.id,
                }
              : null
          );
        },
        onDrop: ({ source, location }) => {
          const elementType = source.getStringData(
            "text/plain"
          ) as Element["type"];

          const placement = getPlacement(location);
          if (!placement) return handleCleanUp();

          const { data, activeObserverRect } = placement;

          const partialOnInsertElementParams: Omit<
            OnInsertElementParams,
            "instruction"
          > = {
            type: elementType,
            parentId: data.dropTarget.id,
          };

          if (activeObserverRect) {
            switch (activeObserverRect.position) {
              case "before":
                onInsertElement({
                  instruction: {
                    position: "before",
                    siblingId: activeObserverRect.siblingId,
                  },
                  ...partialOnInsertElementParams,
                });
                break;
              case "after":
                onInsertElement({
                  instruction: {
                    position: "after",
                    siblingId: activeObserverRect.siblingId,
                  },
                  ...partialOnInsertElementParams,
                });
                break;
              case "between":
                onInsertElement({
                  instruction: {
                    position: "between",
                    siblingId1: activeObserverRect.siblingId1,
                    siblingId2: activeObserverRect.siblingId2,
                  },
                  ...partialOnInsertElementParams,
                });
                break;
            }
          } else {
            onInsertElement({
              instruction: { position: "insert" },
              ...partialOnInsertElementParams,
            });
          }
          return handleCleanUp();
        },
      }),
      monitorForElements({
        onDragStart: () => setIsDragging(true),
        onDrag: ({ location }) => {
          const placement = getPlacement(location);
          if (!placement) return handleCleanUp();

          const { dropTargetRect, data, activeObserverRect } = placement;
          setActiveObserverRect(activeObserverRect ?? null);

          setActiveElement(
            dropTargetRect
              ? {
                  left: dropTargetRect.left + window.scrollX,
                  top: dropTargetRect.top + window.scrollY,
                  bottom: dropTargetRect.bottom + window.scrollY,
                  width: dropTargetRect.width,
                  height: dropTargetRect.height,
                  type: data.dropTarget.type,
                  name: data.dropTarget.name,
                  id: data.dropTarget.id,
                }
              : null
          );
        },
        onDrop: ({ source, location }) => {
          const { element, parentId } = source.data as {
            element: Slot;
            parentId: string | undefined;
          };

          const placement = getPlacement(location);
          if (!placement) return handleCleanUp();

          const { data, activeObserverRect } = placement;

          const partialParams: Omit<MoveElementParams, "instruction"> = {
            elementId: element.id,
            parentId: data.dropTarget.id,
          };

          if (activeObserverRect) {
            switch (activeObserverRect.position) {
              case "before":
                onMoveElement({
                  instruction: {
                    position: "before",
                    siblingId: activeObserverRect.siblingId,
                  },
                  ...partialParams,
                });
                break;
              case "after":
                onMoveElement({
                  instruction: {
                    position: "after",
                    siblingId: activeObserverRect.siblingId,
                  },
                  ...partialParams,
                });
                break;
              case "between":
                onMoveElement({
                  instruction: {
                    position: "between",
                    siblingId1: activeObserverRect.siblingId1,
                    siblingId2: activeObserverRect.siblingId2,
                  },
                  ...partialParams,
                });
                break;
            }
          } else {
            onMoveElement({
              instruction: { position: "insert" },
              ...partialParams,
            });
          }
          return handleCleanUp();
        },
      })
    );
  }, [historyIndex]); // FIXME: Might not be necessary if I use the data from the drop target instead of the HTML directly

  return {
    isDragging,
    activeElement,
    activeObserverRect,
  };
};

function getPlacement(location: DragLocationHistory) {
  const current = location.current.dropTargets[0];
  const parent = location.current.dropTargets[1];

  const currentRect = current?.element.getBoundingClientRect();

  const isCurrent = !!(
    currentRect &&
    assertCurrent(currentRect, location.current.input) &&
    (current.element as HTMLElement).dataset.droppable === "true"
  );
  const dropTarget = isCurrent ? current : (parent ?? current);
  const dropTargetRect = dropTarget?.element.getBoundingClientRect();
  if (!dropTarget) return null;

  const orientation = getOrientation(dropTarget.element);

  const { observerRects, observerRectsPerChild } = createObserverRects(
    dropTarget,
    orientation === "horizontal" ? ["left", "right"] : ["top", "bottom"]
  );

  const activeObserverRect = getActiveObserverRect(
    observerRects,
    location.current.input
  );

  const data = dropTarget.data as {
    dropTarget: Slot;
    dropTargetParentId: string | undefined;
  };

  return {
    dropTarget,
    dropTargetRect,
    data,
    observerRects,
    observerRectsPerChild,
    activeObserverRect,
  };
}

const THRESHOLD = 10;

function assertCurrent(
  current: DOMRect,
  mousePosition: { clientX: number; clientY: number }
) {
  const insetLeft = current.x + THRESHOLD;
  const insetRight = current.x + current.width - THRESHOLD;
  const insetTop = current.y + THRESHOLD;
  const insetBottom = current.y + current.height - THRESHOLD;

  return (
    mousePosition.clientX >= insetLeft &&
    mousePosition.clientX <= insetRight &&
    mousePosition.clientY >= insetTop &&
    mousePosition.clientY <= insetBottom
  );
}

const pairMapping: Record<
  keyof ObserverRectPerChild,
  [keyof ObserverRectPerChild, "x" | "y"]
> = {
  left: ["right", "y"],
  top: ["bottom", "x"],
  right: ["left", "y"],
  bottom: ["top", "x"],
};

const orientationMapping: Record<
  keyof ObserverRectPerChild,
  "horizontal" | "vertical"
> = {
  left: "vertical",
  top: "horizontal",
  right: "vertical",
  bottom: "horizontal",
};

function createObserverRects(
  dropTarget: DropTargetRecord,
  sides: (keyof ObserverRectPerChild)[]
) {
  const children = Array.from(dropTarget.element.children);
  const observerRectsPerChild = children.map(
    (child): Partial<ObserverRectPerChild> => {
      const rect = child.getBoundingClientRect();

      const formattedChild = child as HTMLElement;
      const isDroppable = formattedChild.dataset.droppable === "true";

      return {
        ...(sides.includes("left") && {
          left: {
            x: rect.x - THRESHOLD,
            y: rect.y,
            width: isDroppable ? THRESHOLD * 2 : THRESHOLD + rect.width / 2,
            height: rect.height,
            position: "before",
            siblingId: formattedChild.dataset.id!,
          },
        }),
        ...(sides.includes("right") && {
          right: {
            x: isDroppable
              ? rect.x + rect.width - THRESHOLD
              : rect.x + rect.width / 2,
            y: rect.y,
            width: isDroppable ? THRESHOLD * 2 : THRESHOLD + rect.width / 2,
            height: rect.height,
            position: "after",
            siblingId: formattedChild.dataset.id!,
          },
        }),
        ...(sides.includes("top") && {
          top: {
            x: rect.x,
            y: rect.y - THRESHOLD,
            width: rect.width,
            height: isDroppable ? THRESHOLD * 2 : THRESHOLD + rect.height / 2,
            position: "before",
            siblingId: formattedChild.dataset.id!,
          },
        }),
        ...(sides.includes("bottom") && {
          bottom: {
            x: rect.x,
            y: isDroppable
              ? rect.y + rect.height - THRESHOLD
              : rect.y + rect.height / 2,
            width: rect.width,
            height: isDroppable ? THRESHOLD * 2 : THRESHOLD + rect.height / 2,
            position: "after",
            siblingId: formattedChild.dataset.id!,
          },
        }),
      };
    }
  );

  const observerRects: ObserverRect[] = [];

  const hash: Record<
    `${keyof ObserverRectPerChild}-${number}-${number}`,
    number | undefined
  > = {};

  observerRectsPerChild.forEach((child, index) => {
    Object.entries(child).forEach(([key, value]) => {
      const formattedKey = key as keyof ObserverRectPerChild;
      const pairKey = pairMapping[formattedKey][0];
      const pairValue = pairMapping[formattedKey][1];

      const pairHashKeyWithoutIndex = `${pairKey}-${value[pairValue]}`;
      const pairHashKeyWithoutIndexFlipped = `${formattedKey}-${value[pairValue]}`;
      const pairHashKey =
        `${pairKey}-${value[pairValue]}-${index}` as keyof typeof hash;
      const pairHashValue = hash[pairHashKey];
      if (pairHashValue) {
        // console.log("hash before", hash);
        // console.log("pairHashValue", pairHashValue);
        Object.entries(hash).forEach(([key, value]) => {
          if (
            key.includes(pairHashKeyWithoutIndex) ||
            key.includes(pairHashKeyWithoutIndexFlipped)
          ) {
            hash[key as keyof typeof hash] = undefined;
          }
        });

        const boundingRect = getBoundingRect(
          observerRects[pairHashValue] as ObserverRect & { siblingId: string },
          value as ObserverRect & { siblingId: string }
        );
        observerRects[pairHashValue] = boundingRect;
      } else {
        for (let i = index + 1; i < observerRectsPerChild.length; i++) {
          hash[`${formattedKey}-${value[pairValue]}-${i}`] =
            observerRects.length;
        }
        // console.log("hash", hash);
        observerRects.push({
          ...value,
          orientation: orientationMapping[formattedKey],
        });
      }
    });
  });

  return { observerRectsPerChild, observerRects };
}

function getBoundingRect(
  rect1: ObserverRect & { siblingId: string },
  rect2: ObserverRect & { siblingId: string }
): ObserverRect {
  const left = Math.min(rect1.x, rect2.x);
  const top = Math.min(rect1.y, rect2.y);
  const right = Math.max(rect1.x + rect1.width, rect2.x + rect2.width);
  const bottom = Math.max(rect1.y + rect1.height, rect2.y + rect2.height);

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    position: "between",
    siblingId1: rect1.siblingId,
    siblingId2: rect2.siblingId,
    orientation: rect1.orientation,
  };
}

function getActiveObserverRect(
  observerRects: ObserverRect[],
  mousePosition: { clientX: number; clientY: number }
): ObserverRect | undefined {
  return observerRects.find((rect) => {
    return (
      mousePosition.clientX >= rect.x &&
      mousePosition.clientX <= rect.x + rect.width &&
      mousePosition.clientY >= rect.y &&
      mousePosition.clientY <= rect.y + rect.height
    );
  });
}

function getOrientation(
  element: globalThis.Element
): "horizontal" | "vertical" {
  const { display, flexDirection } = getComputedStyle(element);

  if (display === "flex" && flexDirection === "column") return "vertical";
  return "horizontal";
}
