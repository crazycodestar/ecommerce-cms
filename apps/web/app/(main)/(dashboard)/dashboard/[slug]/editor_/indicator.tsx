"use client";

import { useEditor } from "@/context/editor";
import { layers } from "@/db/lib/layers";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
// drag and drop
import { HighlightBox, recursivelyFindNearestElement } from "./lib";

const useInspector = () => {
  const { focusElementId, setFocusElementId } = useEditor();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<HighlightBox | null>(null);
  const [focusElementPreview, setFocusElementPreview] =
    useState<HighlightBox | null>(null);

  async function handleMouseMove(e: MouseEvent) {
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
    const parentId = validEl.dataset.parentId;
    const componentId = validEl.dataset.instanceId;

    if (id === activeId) return;

    setActiveId(id);
    const element = await layers.getSlot(id);

    setHighlight({
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
      width: rect.width,
      height: rect.height,
      type: element?.type,
      id,
      name: element?.name ?? "",
      parentId,
      componentId,
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
    const instanceId = validEl?.dataset.parentId || validEl?.dataset.instanceId;
    setFocusElementId(validEl?.dataset.id, instanceId);
  }

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [activeId]);

  const handleFocusElementPreview = async (
    boundingClientRect: Omit<HighlightBox, "type" | "name">
  ) => {
    const element = await layers.getSlot(boundingClientRect.id);
    if (!element) return setFocusElementPreview(null);

    setFocusElementPreview({
      ...boundingClientRect,
      type: element.type,
      name: element.name,
    });
  };

  useEffect(() => {
    if (!focusElementId) return setFocusElementPreview(null);
    const el = document.querySelector(`[data-id="${focusElementId}"]`);
    const validEl = el
      ? recursivelyFindNearestElement(el as HTMLElement)
      : null;
    if (!validEl || !el) return setFocusElementPreview(null);

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const rect = entry.target.getBoundingClientRect();
        handleFocusElementPreview({
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          width: rect.width,
          height: rect.height,
          id: focusElementId,
          parentId: validEl.dataset.parentId,
          componentId: validEl.dataset.instanceId,
        });
      }
    });

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [focusElementId]);

  const handlePlaceInspectorLabel = (highlight: HighlightBox) => {
    return highlight.top ? highlight.top - 20 : window.scrollY;
  };

  return { highlight, handlePlaceInspectorLabel, focusElementPreview };
};

export function Indicator({
  isDragging,
  activeElement,
}: {
  isDragging: boolean;
  activeElement: HighlightBox | null;
}) {
  const { highlight, handlePlaceInspectorLabel, focusElementPreview } =
    useInspector();

  function DragIndicator() {
    return (
      <>
        {/* Label Box */}
        {activeElement && (
          <div
            id="inspector-label"
            className={cn(
              "capitalize absolute text-white text-xs py-0.5 px-[5px] rounded-[3px] whitespace-nowrap z-50",
              activeElement.top ? "rounded-b-none" : "rounded-t-none",
              activeElement.componentId ? "bg-component" : "bg-highlight",
              activeElement.parentId && "hidden"
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
            className={cn(
              "absolute border-2 pointer-events-none z-50",
              activeElement.componentId || activeElement.parentId
                ? "border-component"
                : "border-highlight"
            )}
            style={{
              left: activeElement.left,
              top: activeElement.top,
              width: activeElement.width,
              height: activeElement.height,
            }}
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
          className={cn(
            "absolute border-2 pointer-events-none z-50",
            focusElementPreview.parentId || focusElementPreview.componentId
              ? "border-component"
              : "border-highlight"
          )}
          style={focusElementPreview}
        />

        {/* Focus Element Label Box */}
        <div
          id="focusElement-label"
          className={cn(
            "capitalize absolute text-white text-xs py-0.5 px-[5px] rounded-[3px] whitespace-nowrap z-50",
            focusElementPreview.componentId ? "bg-component" : "bg-highlight",
            focusElementPreview.parentId && "hidden",
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
            className={cn(
              "absolute border-2 pointer-events-none z-50",
              highlight.parentId || highlight.componentId
                ? "border-component"
                : "border-highlight"
            )}
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
              "capitalize absolute bg-transparent text-xs font-medium py-0.5 px-[5px] rounded-[3px] whitespace-nowrap z-50 pointer-events-none",
              highlight.componentId
                ? "ring-inset ring-2 ring-component text-component"
                : "ring-inset ring-2 ring-highlight text-highlight",
              highlight.parentId && "hidden",
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
