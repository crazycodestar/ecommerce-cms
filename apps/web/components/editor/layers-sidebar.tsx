"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { db } from "@/db";
import { Tree, useTree } from "@/hooks/use-tree";
import { useLiveQuery } from "dexie-react-hooks";
import { TreeItem } from "./tree-item";
import { useEditor } from "@/context/editor";

export function LayersSidebar() {
  const { bodyId } = useEditor();
  const { tree } = useTree({ rootId: bodyId ?? "" });
  const items = tree.getItems();

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
      <Tree items={items} rootId={bodyId ?? ""}>
        <SidebarContent>
          <SidebarGroup className="w-fit min-w-full">
            <SidebarMenu>
              {items.map((item) => (
                <TreeItem key={item.getId()} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Tree>
    </Sidebar>
  );
}
