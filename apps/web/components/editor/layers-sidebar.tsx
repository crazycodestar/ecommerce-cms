"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { useEditor } from "@/hooks/use-editor";
import { Element } from "@/hooks/use-editor/elements";
import { useTree } from "@/hooks/use-tree";
import { useState } from "react";
import { PartialPlaceInstruction, StepType, TreeItem } from "./tree-item";

type Item = {
  name: string;
  children?: Element["id"][];
};

function FlatMap(element: Element): Record<string, Item> {
  const data: Record<string, Item> = {
    [element.id]: {
      name: element.name,
      children: element.children?.map((child) => child.id) ?? [],
    },
  };

  element.children?.forEach((child) => {
    const childData = FlatMap(child);
    Object.entries(childData).forEach(([key, value]) => {
      data[key] = value;
    });
  });

  return data;
}

export function LayersSidebar() {
  const pages = useEditor((state) => state.pages);

  const root = pages[0].body.id;
  const { tree } = useTree({ rootId: root });

  const items = tree.getItems();

  function getStep(currentIndent: number, index: number) {
    const prevItemIndent = items[index - 1]?.indent as number | undefined;
    const nextItemIndent = items[index + 1]?.indent as number | undefined;

    const step: StepType = {
      top: undefined,
      bottom: undefined,
    };

    if (prevItemIndent && currentIndent < prevItemIndent)
      step.top = [prevItemIndent, currentIndent];
    if (!nextItemIndent || currentIndent > nextItemIndent)
      step.bottom = [currentIndent, nextItemIndent ?? 0];

    return step;
  }

  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null
  );

  function handleHighlightIndent(indent: number | null, index: number) {
    if (indent === null) return setHighlightedItemId(null);

    for (let i = index - 1; i > -1; i--) {
      if (items[i].isExpanded() && items[i].indent === indent - 1) {
        setHighlightedItemId(items[i].getId());
        return;
      }
    }

    setHighlightedItemId(null);
  }

  function handlePlace(placeInstruction: PartialPlaceInstruction) {
    if (
      placeInstruction.instruction === "place-in-folder-at-bottom" &&
      !highlightedItemId
    ) {
      const dropElementIndex = items.findIndex(
        (item) => item.getId() === placeInstruction.dropElementId
      );
      if (dropElementIndex === -1) return;

      const itemWithHighlightedIndent = items[dropElementIndex + 1];
      if (!itemWithHighlightedIndent)
        return tree.reorder({
          instruction: "place-in-folder-at-bottom",
          elementId: placeInstruction.elementId,
        });

      return tree.reorder({
        instruction: "place-in-folder-at-sibling",
        elementId: placeInstruction.elementId,
        siblingId: itemWithHighlightedIndent.getId(),
        position: "before",
      });
    }

    if (placeInstruction.instruction === "place-in-folder-at-bottom")
      return tree.reorder({
        instruction: "place-in-folder-at-bottom",
        elementId: placeInstruction.elementId,
        parentId: highlightedItemId!,
      });

    if (placeInstruction.instruction === "place-in-folder-at-sibling")
      return tree.reorder({
        instruction: "place-in-folder-at-sibling",
        elementId: placeInstruction.elementId,
        siblingId: placeInstruction.siblingId,
        position: placeInstruction.position,
      });

    if (placeInstruction.instruction === "place-in-folder-at-top")
      return tree.reorder({
        instruction: "place-in-folder-at-top",
        elementId: placeInstruction.elementId,
        parentId: placeInstruction.parentId,
      });
  }

  return (
    <Sidebar
      collapsible="none"
      variant="floating"
      className="hidden flex-1 md:flex absolute top-0 left-[calc(var(--sidebar-width-icon)+1.1px)] z-50"
    >
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-foreground text-base font-medium">Layers</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="w-fit min-w-full">
          <SidebarMenu>
            {items.map((item, index) => (
              <TreeItem
                key={item.getId()}
                item={item}
                step={getStep(item.indent, index)}
                isHighlighted={highlightedItemId === item.getId()}
                onHighlightIndent={(indent) =>
                  handleHighlightIndent(indent, index)
                }
                onPlace={handlePlace}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
