"use client";

import { Form } from "@/components/ui/form";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEditor } from "@/hooks/use-editor";
import { layers } from "@/hooks/use-editor/elements";
import {
  getDefaultValues,
  isTextElement,
  styleSchema,
  StyleSchema,
} from "@/hooks/use-editor/properties";
import { MousePointer } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Appearance } from "./appearance";
import { Layout } from "./layout";
import { StyleProvider } from "./style-context";
import { Stroke } from "./stroke";
import { Effects } from "./effects";
import { Position } from "./position";
import { Typography } from "./typography";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PropertiesSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const focusElement = useEditor((state) => state.focusElement);
  const pages = useEditor((state) => state.pages);
  const element = focusElement
    ? layers.find(pages[0].elements, focusElement.id)
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
