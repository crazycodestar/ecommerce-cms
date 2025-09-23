"use client";

import { useEditor } from "@/hooks/use-editor";
import { Element, layers, type Page } from "@/hooks/use-editor/elements";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
// drag and drop
import {
  DropIndicatorType,
  HighlightBox,
  recursivelyFindNearestElement,
} from "./lib";

const useInspector = (elements: Element & { children: Element[] }) => {
  const focusElement = useEditor((state) => state.focusElement);
  const setFocusElement = useEditor((state) => state.setFocusElement);

  const [highlight, setHighlight] = useState<HighlightBox | null>(null);
  const [focusElementPreview, setFocusElementPreview] =
    useState<HighlightBox | null>(null);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const el = document.elementFromPoint(e.clientX, e.clientY);

      if (
        !el ||
        (el as HTMLElement).id === "inspector-highlight" ||
        (el as HTMLElement).id === "inspector-label"
      ) {
        return;
      }

      const validEl = recursivelyFindNearestElement(el as HTMLElement);
      if (!validEl) return;

      const rect = validEl.getBoundingClientRect();
      const id = validEl.dataset.id;

      setHighlight({
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        width: rect.width,
        height: rect.height,
        type: layers.find(elements, id)?.type,
        id,
        name: layers.find(elements, id)?.name ?? "",
      });
    }

    const handleMouseLeave = () => setHighlight(null);

    function handleClick(e: MouseEvent) {
      const el = document.elementFromPoint(e.clientX, e.clientY);

      if (
        !el ||
        (el as HTMLElement).id === "focusElement-highlight" ||
        (el as HTMLElement).id === "focusElement-label"
      ) {
        return;
      }

      const validEl = recursivelyFindNearestElement(el as HTMLElement);
      setFocusElement(validEl?.dataset.id ?? null);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [elements]);

  useEffect(() => {
    if (!focusElement) return setFocusElementPreview(null);
    const el = document.querySelector(`[data-id="${focusElement}"]`);
    if (!el) return setFocusElementPreview(null);

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const rect = entry.target.getBoundingClientRect();
        setFocusElementPreview({
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          width: rect.width,
          height: rect.height,
          type: layers.find(elements, focusElement)?.type,
          id: focusElement,
          name: layers.find(elements, focusElement)?.name ?? "",
        });
      }
    });

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [focusElement]);

  const handlePlaceInspectorLabel = (highlight: HighlightBox) => {
    return highlight.top ? highlight.top - 20 : window.scrollY;
  };

  return { highlight, handlePlaceInspectorLabel, focusElementPreview };
};

export function Indicator({
  page,
  isDragging,
  activeElement,
  dropIndicator,
}: {
  page: Page;
  isDragging: boolean;
  activeElement: HighlightBox | null;
  dropIndicator: DropIndicatorType | null;
}) {
  // const { isDragging, activeElement, dropIndicator } = useMonitor(page);
  const { highlight, handlePlaceInspectorLabel, focusElementPreview } =
    useInspector(page.body);

  function DragIndicator() {
    return (
      <>
        {/* Label Box */}
        {activeElement && (
          <div
            id="inspector-label"
            className={cn(
              "capitalize absolute bg-blue-500 text-white text-xs py-0.5 px-[5px] rounded-[3px] whitespace-nowrap z-50",
              activeElement.top ? "rounded-b-none" : "rounded-t-none"
            )}
            style={{
              left: activeElement.left,
              top: handlePlaceInspectorLabel(activeElement),
            }}
          >
            {activeElement.name ?? "Unknown"}
          </div>
        )}

        {/* Active Element Box */}
        {activeElement && (
          <div
            className="absolute border-2 border-blue-500 pointer-events-none z-50"
            style={{
              left: activeElement.left,
              top: activeElement.top,
              width: activeElement.width,
              height: activeElement.height,
            }}
          />
        )}

        {/* Drop Indicator */}
        {dropIndicator && (
          <div
            className="absolute border-2 border-red-500 pointer-events-none z-50"
            style={dropIndicator}
          />
        )}
      </>
    );
  }

  function FocusIndicator() {
    if (!focusElementPreview) return null;

    return (
      <>
        {/* Focus Element Box */}
        <div
          id="focusElement-highlight"
          className="absolute border-2 border-blue-500 pointer-events-none z-50"
          style={focusElementPreview}
        />

        {/* Focus Element Label Box */}
        <div
          id="focusElement-label"
          className={cn(
            "capitalize absolute bg-blue-500 text-white text-xs py-0.5 px-[5px] rounded-[3px] whitespace-nowrap z-50",
            focusElementPreview.top ? "rounded-b-none" : "rounded-t-none"
          )}
          style={{
            left: focusElementPreview.left,
            top: handlePlaceInspectorLabel(focusElementPreview),
          }}
        >
          {focusElementPreview.name ?? "Unknown"}
        </div>
      </>
    );
  }

  function InspectorHighlight() {
    return (
      <>
        {/* Inspector Highlight Box */}
        {highlight && (
          <div
            id="inspector-highlight"
            className="absolute border-2 border-blue-500 pointer-events-none z-50"
            style={{
              left: highlight.left,
              top: highlight.top,
              width: highlight.width,
              height: highlight.height,
            }}
          />
        )}

        {/* Inspector Label Box */}
        {highlight && (
          <div
            id="inspector-label"
            className={cn(
              "capitalize absolute bg-transparent text-blue-500 ring-inset ring-2 ring-blue-500 text-xs font-medium py-0.5 px-[5px] rounded-[3px] whitespace-nowrap z-50 pointer-events-none",
              highlight.top ? "rounded-b-none" : "rounded-t-none"
            )}
            style={{
              left: highlight.left,
              top: handlePlaceInspectorLabel(highlight),
            }}
          >
            {highlight.name ?? "Unknown"}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {isDragging ? (
        <DragIndicator />
      ) : (
        <>
          {focusElementPreview && <FocusIndicator />}
          {highlight && highlight.id !== focusElementPreview?.id && (
            <InspectorHighlight />
          )}
        </>
      )}
    </>
  );
}
