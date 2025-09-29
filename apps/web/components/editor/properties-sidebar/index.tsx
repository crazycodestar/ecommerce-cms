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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "./settings";
import { isTextElement, StyleKey } from "@/hooks/use-editor/properties";
import { Size } from "@/hooks/use-view";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { VariableLibrary } from "./variable-library";

const styleKeyMapping: Record<Size, StyleKey> = {
  desktop: "default",
  tablet: "md",
  mobile: "sm",
};

export function PropertiesSidebar({
  view,
  ...props
}: React.ComponentProps<typeof Sidebar> & { view: Size }) {
  const focusElement = useEditor((state) => state.focusElement);
  const pages = useEditor((state) => state.pages);
  const element = focusElement
    ? layers.find(pages[0].body, focusElement)
    : null;

  const isTextElementBoolean = element && !!isTextElement(element.type);

  const [styleKey, setStyleKey] = React.useState<StyleKey>("default");

  React.useEffect(() => {
    setStyleKey(styleKeyMapping[view]);
  }, [view]);

  return (
    <Sidebar collapsible="none" className="min-h-svh max-h-svh" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium capitalize">
                {element?.type ?? "Select an element"}
              </h3>
              <p className="text-xs text-muted-foreground">Style</p>
            </div>
            <Select
              onValueChange={(value) => setStyleKey(value as StyleKey)}
              value={styleKey}
            >
              <SelectTrigger size="sm" className="w-fit max-h-7">
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Desktop</SelectItem>
                <SelectItem value="md">Tablet</SelectItem>
                <SelectItem value="sm">Mobile</SelectItem>
                <SelectItem value="hover">Hover</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-6 h-full overflow-y-auto">
        {focusElement ? (
          <Tabs defaultValue="style">
            <div className="w-full p-2 pb-0">
              <TabsList className="w-full h-7 rounded-sm">
                <TabsTrigger value="style" className="rounded-sm">
                  Style
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-sm">
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="style">
              <StyleProvider styleKey={styleKey}>
                <Position />
                <Layout />
                <Appearance />
                {isTextElementBoolean && <Typography />}
                <Stroke />
                <Effects />
              </StyleProvider>
            </TabsContent>
            <TabsContent value="settings">
              <Settings />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-2">
            <h3 className="text-sm font-medium mb-2">Variables</h3>
            <VariableLibrary />
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
