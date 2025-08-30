"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import * as React from "react";
import { useId, useState } from "react";
import { Tag, TagInput } from "emblor";
import { Label } from "@/components/ui/label";
import { layers, useEditor } from "@/hooks/use-editor";
import { MousePointer } from "lucide-react";

export function PropertiesSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const focusElement = useEditor((state) => state.focusElement);
  const updateElement = useEditor((state) => state.updateElement);
  const pages = useEditor((state) => state.pages);
  const element = focusElement
    ? layers.find(pages[0].elements, focusElement)
    : null;
  const className = element?.className ?? [];

  return (
    <Sidebar collapsible="none" className="min-h-svh" {...props}>
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
      <SidebarContent className="flex flex-col gap-6 h-full p-2">
        {focusElement ? (
          <ClassNameInput
            tags={className}
            setTags={(tags) => updateElement(focusElement, { className: tags })}
          />
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

export function ClassNameInput({
  tags,
  setTags,
}: {
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
}) {
  const id = useId();
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>Class Name (Tailwind)</Label>
      <TagInput
        id={id}
        tags={tags}
        // @ts-expect-error wrongly typed
        setTags={setTags}
        placeholder="Add a tag"
        styleClasses={{
          tagList: {
            container: "gap-1",
          },
          input:
            "rounded-md transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          tag: {
            body: "relative h-7 bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-7",
            closeButton:
              "absolute -inset-y-px -end-px p-0 rounded-s-none rounded-e-md flex size-7 transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-muted-foreground/80 hover:text-foreground",
          },
        }}
        activeTagIndex={activeTagIndex}
        setActiveTagIndex={setActiveTagIndex}
        inlineTags={false}
        inputFieldPosition="top"
      />
    </div>
  );
}
