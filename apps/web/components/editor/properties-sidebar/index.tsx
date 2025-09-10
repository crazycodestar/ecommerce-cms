"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEditor } from "@/hooks/use-editor";
import { layers } from "@/hooks/use-editor/elements";
import { MousePointer } from "lucide-react";
import * as React from "react";
import { Appearance } from "./appearance";
import { Effects } from "./effects";
import { Layout } from "./layout";
import { Position } from "./position";
import { Stroke } from "./stroke";
import { StyleProvider } from "./style-context";
import { Typography } from "./typography";

export function PropertiesSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const focusElement = useEditor((state) => state.focusElement);
  const pages = useEditor((state) => state.pages);
  const element = focusElement
    ? layers.find(pages[0].elements, focusElement)
    : null;

  return (
    <Sidebar collapsible="none" className="min-h-svh max-h-svh" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem className="font-medium">
            <h3 className="text-sm font-medium capitalize">
              {element?.type ?? "Select an element"}
            </h3>
            <p className="text-xs text-muted-foreground">Style</p>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-6 h-full overflow-y-auto">
        {focusElement ? (
          <StyleProvider>
            <Position />
            <Layout />
            <Appearance />
            <Typography />
            <Stroke />
            <Effects />
          </StyleProvider>
        ) : (
          <div className="h-[200px] flex items-center justify-center border border-muted-foreground/50 border-dashed rounded-md">
            <div className="flex flex-col items-center gap-2">
              <MousePointer className="h-6 w-6 text-muted-foreground" />
              <p className="text-muted-foreground">Select an element</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
