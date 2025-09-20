"use client";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ItemInstance } from "@/hooks/use-tree";
import {
  PlaceInFolderAtBottom,
  PlaceInFolderAtSibling,
  PlaceInFolderAtTop,
} from "@/hooks/use-editor";
import { cn } from "@/lib/utils";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { isEqual } from "es-toolkit";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

const indentWidth = 24;

type TaskState =
  | {
      type: "idle";
    }
  | {
      type: "preview";
      container: HTMLElement;
    }
  | {
      type: "is-dragging";
    }
  | {
      type: "is-dragging-over";
      closestEdge: "top" | "bottom" | "center" | null;
      indent: number;
    };

const idle: TaskState = { type: "idle" };

type GetClosestEdgeAndIndent = {
  height: number;
  deltaX: number;
  deltaY: number;
  indentThreshold: number;
  defaultIndent: number;
  allowedSides: ("top" | "bottom" | "center")[];
  step?: StepType;
};

function getClosestEdgeAndIndent({
  height,
  deltaX,
  deltaY,
  indentThreshold,
  defaultIndent,
  allowedSides,
  step,
}: GetClosestEdgeAndIndent) {
  const threshhold = 8;
  const proxyIndent = Math.trunc(deltaX / indentThreshold);

  if (allowedSides.includes("center")) {
    if (deltaY > threshhold && deltaY < height - threshhold) {
      return { edge: "center" as const, indent: defaultIndent };
    }
  }

  if (allowedSides.includes("top") && deltaY < height / 2) {
    return {
      edge: "top" as const,
      indent: step?.top
        ? Math.max(Math.min(proxyIndent, step.top[0]), step.top[1])
        : defaultIndent,
    };
  }
  if (allowedSides.includes("bottom") && deltaY > height / 2) {
    return {
      edge: "bottom" as const,
      indent: step?.bottom
        ? Math.max(Math.min(proxyIndent, step.bottom[0]), step.bottom[1])
        : defaultIndent,
    };
  }

  return { edge: "center" as const, indent: defaultIndent };
}

export type StepType = Record<"top" | "bottom", [number, number] | undefined>;

export type PartialPlaceInstruction =
  | Omit<PlaceInFolderAtBottom, "parentId">
  | Omit<PlaceInFolderAtSibling, "parentId">
  | PlaceInFolderAtTop;

export type TreeItemProps = {
  item: ItemInstance;
  step?: StepType;
  isHighlighted: boolean;
  onHighlightIndent: (indent: number | null) => void;
  onPlace: (instruction: PartialPlaceInstruction) => void;
};

export function TreeItem({
  item,
  step,
  isHighlighted,
  onHighlightIndent,
  onPlace,
}: TreeItemProps) {
  const indentStyle = {
    paddingLeft: `${item.indent * indentWidth + 8}px`,
  } satisfies React.CSSProperties;

  const handleExpand = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!item.isFolder()) return;
    if (item.isExpanded()) {
      item.collapse();
    } else {
      item.expand();
    }
  };

  const ref = useRef(null);
  const [state, setState] = useState<TaskState>(idle);
  const [dragging, setDragging] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return combine(
      draggable({
        element: el,
        getInitialData() {
          return item;
        },
        onDragStart: () => {
          setState({ type: "is-dragging" });
          setDragging(true);
          setIsExpanded(item.isExpanded());
          item.collapse();
        },
        onDrop: () => {
          setState(idle);
          setDragging(false);
          isExpanded && item.expand();
        },
      }),
      dropTargetForElements({
        element: el,
        canDrop({ source }) {
          // not allowing dropping on yourself
          if (source.element === el) {
            return false;
          }
          // only allowing tasks to be dropped on me
          return true;
        },
        getData({ input, element }) {
          const boundingClientRect = element.getBoundingClientRect();
          const closestEdgeAndIndent = getClosestEdgeAndIndent({
            height: boundingClientRect.height,
            deltaX: input.clientX - boundingClientRect.x,
            deltaY: input.clientY - boundingClientRect.y,
            indentThreshold: indentWidth,
            defaultIndent: item.indent,
            allowedSides: item.isFolder()
              ? item.isExpanded()
                ? ["top", "center"]
                : ["top", "center", "bottom"]
              : ["top", "bottom"],
            step,
          });

          const isStep = !!(
            step &&
            closestEdgeAndIndent.edge &&
            closestEdgeAndIndent.edge !== "center" &&
            step[closestEdgeAndIndent.edge]
          );

          const highlightedIndent =
            item.isFolder() && !isStep ? null : closestEdgeAndIndent.indent;

          return { item, highlightedIndent, isStep, ...closestEdgeAndIndent };
        },
        getIsSticky() {
          return true;
        },
        onDragEnter({ self }) {
          const formattedSelf = self.data as {
            item: ItemInstance;
            highlightedIndent: number | null;
            edge: "top" | "bottom" | "center" | null;
            indent: number;
          };

          onHighlightIndent(formattedSelf.highlightedIndent);
          setState({
            type: "is-dragging-over",
            closestEdge: formattedSelf.edge,
            indent: formattedSelf.indent,
          });
        },
        onDrag({ self }) {
          const formattedSelf = self.data as {
            item: ItemInstance;
            highlightedIndent: number | null;
            edge: "top" | "bottom" | "center" | null;
            indent: number;
          };

          onHighlightIndent(formattedSelf.highlightedIndent);
          setState((current) => {
            if (
              isEqual(current, {
                type: "is-dragging-over",
                closestEdge: formattedSelf.edge,
                indent: formattedSelf.indent,
              })
            ) {
              return current;
            }
            return {
              type: "is-dragging-over",
              closestEdge: formattedSelf.edge,
              indent: formattedSelf.indent,
            };
          });
        },
        onDragLeave() {
          setState(idle);
          onHighlightIndent(null);
        },
        onDrop({ self, source }) {
          setState(idle);
          const formattedSelf = self.data as {
            item: ItemInstance;
            highlightedIndent: number | null;
            edge: "top" | "bottom" | "center" | null;
            indent: number;
            isStep: boolean;
          };

          const sourceItem = source.data as ItemInstance;

          if (
            formattedSelf.isStep &&
            formattedSelf.item.indent !== formattedSelf.indent
          )
            onPlace({
              instruction: "place-in-folder-at-bottom",
              elementId: sourceItem.getId(),
            });
          else if (
            formattedSelf.edge === "top" ||
            formattedSelf.edge === "bottom"
          )
            onPlace({
              instruction: "place-in-folder-at-sibling",
              elementId: sourceItem.getId(),
              siblingId: formattedSelf.item.getId(),
              position: formattedSelf.edge === "top" ? "before" : "after",
            });
          else if (formattedSelf.edge === "center")
            onPlace({
              instruction: "place-in-folder-at-top",
              elementId: sourceItem.getId(),
              parentId: formattedSelf.item.getId(),
            });

          onHighlightIndent(null);
        },
      })
    );
  }, [item.isExpanded(), step]);

  return (
    <div className="relative">
      <SidebarMenuButton
        isActive={item.isFocused()}
        className="[&>svg]:size-[13px] h-7 relative"
        style={indentStyle}
        onClick={item.focus}
        ref={ref}
        disabled={dragging}
      >
        {item.isFolder() && (
          <button className="p-0.5" onClick={handleExpand}>
            {item.isExpanded() ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
          </button>
        )}
        {item.isFolder() ? <Folder /> : <File />}
        <span className="text-xs">
          {item.getItemData().name} {item.getId().slice(0, 2)}
        </span>

        {/* <DropIndicator edge={"bottom"} gap={"8px"} /> */}
        {/* {state.type === "is-dragging-over" && state.closestEdge ? (
          <DropIndicator edge={state.closestEdge} gap={"8px"} />
        ) : null} */}
      </SidebarMenuButton>

      {state.type === "is-dragging-over" &&
        state.closestEdge === "center" &&
        item.isFolder() && (
          <div
            className={cn(
              "absolute inset-0 border-2 border-muted-foreground rounded-md z-10 pointer-events-none"
            )}
            style={{
              left: `${state.indent * indentWidth}px`,
            }}
          />
        )}

      {isHighlighted && (
        <div
          className={cn(
            "absolute inset-0 border-2 border-muted-foreground rounded-md z-10 pointer-events-none"
          )}
          style={{
            left: `${item.indent * indentWidth}px`,
          }}
        />
      )}

      {state.type === "is-dragging-over" && state.closestEdge ? (
        <div
          className={cn(
            "absolute right-0 h-[2px] rounded-full z-10 bg-muted-foreground pointer-events-none",
            state.closestEdge === "top" && "-top-[3px]",
            state.closestEdge === "bottom" && "-bottom-[3px]",
            state.closestEdge === "center" && "hidden"
          )}
          style={{
            left: `${state.indent * indentWidth}px`,
          }}
        />
      ) : null}
    </div>
  );
}
