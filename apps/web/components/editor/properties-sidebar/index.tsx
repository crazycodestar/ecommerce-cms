"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { State, useEditor } from "@/context/editor";
import { layers } from "@/db/lib/layers";
import { StyleOnElement } from "@/db/types";
import { Size } from "@/hooks/use-view";
import { cn } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { BrushIcon, ComponentIcon, SettingsIcon } from "lucide-react";
import * as React from "react";
import { Appearance } from "./appearance";
import { Layout } from "./layout";
import { Position } from "./position";
import { PropertyButton } from "./property-button";
import { Settings } from "./settings";
import { Stroke } from "./stroke";
import { StyleProvider } from "./style-context";
import { Typography } from "./typography";
import { VariableLibrary } from "./variable-library";
import { comp } from "@/db/lib/comp";

const styleKeyMapping: Record<Size, StyleOnElement["type"]> = {
  desktop: "default",
  tablet: "breakpoint.md",
  mobile: "breakpoint.sm",
};

function getElement(focusElementId: State["focusElementId"]) {
  if (!focusElementId) return;
  return layers.getSlot(focusElementId);
}

export function PropertiesSidebar({
  view,
  ...props
}: React.ComponentProps<typeof Sidebar> & { view: Size }) {
  React.useEffect(() => {
    setStyleKey(styleKeyMapping[view]);
  }, [view]);

  const { focusElementId } = useEditor();
  const element = useLiveQuery(
    () => getElement(focusElementId),
    [focusElementId]
  );

  const isTextElementBoolean =
    element?.type === "text" || element?.type === "link";

  const [styleKey, setStyleKey] =
    React.useState<StyleOnElement["type"]>("default");

  const createComponent = (id: string) => comp.createComponent(id);

  const isComponentElement = useLiveQuery(async () => {
    if (!element) return false;
    return await layers.isComponentElement(element.id);
  }, [element?.id]);

  const handleCreateComponent = () => {
    if (!focusElementId) return;
    if (isComponentElement) return;

    createComponent(focusElementId);
  };

  return (
    <Sidebar collapsible="none" className="min-h-svh max-h-svh" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between">
            <h3 className="text-sm font-medium capitalize">Style</h3>
            {focusElementId && (
              <Select
                onValueChange={(value) =>
                  setStyleKey(value as StyleOnElement["type"])
                }
                value={styleKey}
              >
                <SelectTrigger size="sm" className="w-fit max-h-7">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Desktop</SelectItem>
                  <SelectItem value="breakpoint.md">Tablet</SelectItem>
                  <SelectItem value="breakpoint.sm">Mobile</SelectItem>
                  <SelectItem value="attribute.hover">Hover</SelectItem>
                  <SelectItem value="attribute.active">Active</SelectItem>
                </SelectContent>
              </Select>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-6 h-full overflow-y-auto">
        {focusElementId ? (
          <Tabs defaultValue="style">
            <div className="w-full p-2 pb-0 flex items-center justify-between">
              <h3 className="text-sm font-medium capitalize">
                {element?.type}
              </h3>
              <div className="flex items-center gap-2">
                <PropertyButton
                  className={cn(
                    isComponentElement && "text-component hover:text-component"
                  )}
                  onClick={() => handleCreateComponent()}
                >
                  <ComponentIcon className="size-4" />
                </PropertyButton>

                <TabsList className="h-7 rounded-sm">
                  <TabsTrigger value="style" className="rounded-sm">
                    <BrushIcon className="size-4" />
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="rounded-sm">
                    <SettingsIcon className="size-4" />
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            <TabsContent value="style">
              <StyleProvider styleKey={styleKey}>
                <Position />
                <Layout />
                <Appearance isTextElementBoolean={isTextElementBoolean} />
                {isTextElementBoolean && <Typography />}
                <Stroke />
                {/* <Effects /> */}
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
        {/* <pre>{JSON.stringify(focusElement, null, 2)}</pre>
        <pre>{JSON.stringify(pages[0].body, null, 2)}</pre> */}
      </SidebarContent>
    </Sidebar>
  );
}
