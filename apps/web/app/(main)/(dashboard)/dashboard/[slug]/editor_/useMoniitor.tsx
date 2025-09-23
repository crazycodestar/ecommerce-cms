"use client";

import { useEditor } from "@/hooks/use-editor";
import { Element, layers, type Page } from "@/hooks/use-editor/elements";
import { useEffect, useState } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { monitorForExternal } from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import {
  getClosestAndDropTarget,
  recursivelyFindNearestElement,
  type DropIndicatorType,
  type HighlightBox,
} from "./lib";

export const useMonitor = (page: Page) => {
  const insertElementToPage = useEditor((state) => state.insertElementToPage);
  const moveElement = useEditor((state) => state.moveElement);
  const historyIndex = useEditor((state) => state.historyIndex);

  const [isDragging, setIsDragging] = useState(false);
  const [activeElement, setActiveElement] = useState<HighlightBox | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicatorType | null>(
    null
  );

  function handleCleanUp() {
    setIsDragging(false);
    setActiveElement(null);
    setDropIndicator(null);
  }

  useEffect(() => {
    return combine(
      monitorForExternal({
        onDragStart: () => setIsDragging(true),
        onDrag: ({ location }) => {
          const { closest, activeElement } = getClosestAndDropTarget(
            location,
            page
          );
          setActiveElement(activeElement);
          setDropIndicator(closest);
        },
        onDrop: ({ source, location }) => {
          const { closest, dropTarget } = getClosestAndDropTarget(
            location,
            page
          );
          if (!dropTarget) return handleCleanUp();

          const validDropTarget = recursivelyFindNearestElement(
            dropTarget as HTMLElement
          );
          if (!validDropTarget) return handleCleanUp();

          const elementType = source.getStringData(
            "text/plain"
          ) as Element["type"];
          const instruction = closest?.instruction;

          const newItem = layers.newItem(elementType);
          insertElementToPage(
            page.id,
            validDropTarget.dataset.id,
            instruction,
            newItem
          );

          return handleCleanUp();
        },
      }),
      monitorForElements({
        onDragStart: () => setIsDragging(true),
        onDrag: ({ location }) => {
          const { closest, activeElement } = getClosestAndDropTarget(
            location,
            page
          );
          setActiveElement(activeElement);
          setDropIndicator(closest);
        },
        onDrop: ({ source, location }) => {
          const { closest, dropTarget } = getClosestAndDropTarget(
            location,
            page
          );
          if (!dropTarget) return handleCleanUp();

          const validDropTarget = recursivelyFindNearestElement(
            dropTarget as HTMLElement
          );
          if (!validDropTarget) return handleCleanUp();

          const { element } = source.data as { element: Element };
          const instruction = closest?.instruction;

          moveElement({
            instruction: "place-in-folder-at-sibling",
            siblingId: validDropTarget.dataset.id,
            position: instruction,
            elementId: element.id,
          });

          return handleCleanUp();
        },
      })
    );
  }, [historyIndex]); // FIXME: Might not be necessary if I use the data from the drop target instead of the HTML directly

  return { isDragging, activeElement, dropIndicator };
};
