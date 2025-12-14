"use client";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ItemInstance, useTreeItem } from "@/hooks/use-tree";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";
import React from "react";

const indentWidth = 24;

export type TreeItemProps = {
  item: ItemInstance;
};

export function TreeItem({ item }: TreeItemProps) {
  const { ref, state, dragging, isHighlighted } = useTreeItem({
    item,
    indentWidth,
  });

  const indentStyle = {
    paddingLeft: `${item.indent * indentWidth + 8}px`,
  } satisfies React.CSSProperties;

  const handleExpand = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!item.isFolder()) return;
    if (item.isExpanded()) {
      item.collapse();
    } else {
      item.expand();
    }
  };

  return (
    <div className="relative">
      <SidebarMenuButton
        isActive={item.isFocused()}
        className={cn(
          "[&>svg]:size-[13px] h-7 relative",
          dragging && "opacity-50"
        )}
        style={indentStyle}
        onClick={item.focus}
        ref={ref}
      >
        {item.isFolder() && (
          <div className="p-0.5" onClick={handleExpand}>
            {item.isExpanded() ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
          </div>
        )}
        {item.isFolder() ? <Folder /> : <File />}
        <span className="text-xs">
          {item.getItemData().name} {item.getId().slice(0, 2)} {item.orderKey}
        </span>
      </SidebarMenuButton>

      {state.type === "is-dragging-over" &&
        state.closestEdge === "center" &&
        item.isFolder() && (
          <div
            className={cn(
              "absolute inset-0 border-2 border-muted-foreground rounded-md z-10 pointer-events-none"
            )}
            style={{
              left: `${state.step * indentWidth}px`,
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
            left: `${state.step * indentWidth}px`,
          }}
        />
      ) : null}
    </div>
  );
}
