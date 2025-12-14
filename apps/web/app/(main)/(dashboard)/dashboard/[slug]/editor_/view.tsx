"use client";

import { db } from "@/db";
import { useStyles } from "@/db/compiler/hooks/use-styles";
import { layers } from "@/db/lib/layers";
import { getSlots } from "@/db/resource/slots";
import { cn } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { Fragment } from "react";
import { ElementRouter } from "./element";
import { Indicator } from "./indicator";
import { ObserverRect, ObserverRectPerChild, useMonitor } from "./useMonitor";

export function View() {
  useStyles();

  const { isDragging, activeElement, activeObserverRect } = useMonitor({
    onInsertElement: layers.insertElement,
    onMoveElement: layers.moveElement,
  });

  const content = useLiveQuery(async () => {
    return getSlots({});
  });
  if (!content) return null;

  return (
    <>
      <Indicator isDragging={isDragging} activeElement={activeElement} />
      {/* {observerRectsPerChild && (
        <Guides observerRectsPerChild={observerRectsPerChild} />
      )} */}
      {activeObserverRect && <Guides2 observerRect={activeObserverRect} />}
      {/* {observerRects && <Guides3 observerRects={observerRects} />} */}
      <ElementRouter
        content={content.filter((slot) => slot.parentId === undefined)}
      />
    </>
  );
}

function Guides3({ observerRects }: { observerRects: ObserverRect[] }) {
  return (
    <>
      {observerRects.map((rect, index) => (
        <div
          key={index}
          className="border-highlight border-2 bg-highlight/50 pointer-events-none"
          style={{
            position: "absolute",
            left: rect.x + window.scrollX,
            top: rect.y + window.scrollY,
            width: rect.width,
            height: rect.height,
          }}
        />
      ))}
    </>
  );
}

function Guides2({ observerRect }: { observerRect: ObserverRect }) {
  return (
    <>
      <div
        className={cn(
          "absolute border-highlight border-2 pointer-events-none",
          observerRect.orientation === "horizontal"
            ? `h-1 left-[${observerRect.x + window.scrollX}px] w-[${observerRect.width}px] top-[${observerRect.y + observerRect.height / 2 + window.scrollY}px] -translate-y-1/2`
            : `w-1 top-[${observerRect.y + window.scrollY}px] h-[${observerRect.height}px] left-[${observerRect.x + observerRect.width / 2 + window.scrollX}px] -translate-x-1/2`
        )}
      />
    </>
  );
}

function Guides({
  observerRectsPerChild,
}: {
  observerRectsPerChild: Partial<ObserverRectPerChild>[];
}) {
  return (
    <>
      {observerRectsPerChild.map((child, index) => (
        <Fragment key={index}>
          {child.left && (
            <div
              className="border-highlight border-2 bg-highlight/50 pointer-events-none"
              style={{
                position: "absolute",
                left: child.left.x,
                top: child.left.y,
                width: child.left.width,
                height: child.left.height,
              }}
            />
          )}
          {child.right && (
            <div
              className="border-highlight border-2 bg-highlight/50 pointer-events-none"
              style={{
                position: "absolute",
                left: child.right.x,
                top: child.right.y,
                width: child.right.width,
                height: child.right.height,
              }}
            />
          )}
          {child.top && (
            <div
              className="border-highlight border-2 bg-highlight/50 pointer-events-none"
              style={{
                position: "absolute",
                left: child.top.x,
                top: child.top.y,
                width: child.top.width,
                height: child.top.height,
              }}
            />
          )}
          {child.bottom && (
            <div
              className="border-highlight border-2 bg-highlight/50 pointer-events-none"
              style={{
                position: "absolute",
                left: child.bottom.x,
                top: child.bottom.y,
                width: child.bottom.width,
                height: child.bottom.height,
              }}
            />
          )}
        </Fragment>
      ))}
    </>
  );
}
