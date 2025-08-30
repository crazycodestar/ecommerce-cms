"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Element, useEditor } from "@/hooks/use-editor";
import {
  BoxIcon,
  CodeXmlIcon,
  ImageIcon,
  LinkIcon,
  TextIcon,
} from "lucide-react";

type AddElement = {
  title: string;
  type: Element["type"];
  icon: React.FC;
};

const ELEMENTS = [
  {
    title: "Section",
    type: Element.section.type,
    icon: SectionIcon,
  },
  {
    title: "Text",
    type: Element.text.type,
    icon: TextIcon,
  },
  {
    title: "Image",
    type: Element.image.type,
    icon: ImageIcon,
  },
  {
    title: "Container",
    type: Element.container.type,
    icon: BoxIcon,
  },
  {
    title: "Link",
    type: Element.link.type,
    icon: LinkIcon,
  },
  {
    title: "Link Block",
    type: Element.linkBlock.type,
    icon: LinkBlockIcon,
  },
  {
    title: "Code Embed",
    type: Element.codeEmbed.type,
    icon: CodeXmlIcon,
  },
] satisfies AddElement[];

function getChildren(type: Element["type"]) {
  if (type === Element.section.type) {
    return ELEMENTS.filter((element) => element.type !== "section");
  }
  return [];
}

export function AddElementSidebar({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) {
  const addContentToPage = useEditor((state) => state.addContentToPage);

  const handleAddElement = (element: AddElement) => {
    addContentToPage("home", undefined, element.type);
    setIsOpen(false);
  };

  return (
    <Sidebar
      collapsible="none"
      variant="floating"
      className="hidden flex-1 md:flex absolute top-0 left-[calc(var(--sidebar-width-icon)+1.1px)] z-50"
    >
      <SidebarHeader className="gap-3.5 border-b h-12 flex flex-row items-center p-0 px-2">
        <p className="text-foreground text-sm font-medium">Add Element</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupLabel>Structure</SidebarGroupLabel>
          <SidebarGroupContent className="grid grid-cols-3 gap-1 p-1">
            {ELEMENTS.map((element) => (
              <ElementCard
                key={element.type}
                element={element}
                onDragging={() => setIsOpen(false)}
                onAddElement={handleAddElement}
              />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function ElementCard({
  element,
  onDragging,
  onAddElement,
}: {
  element: AddElement;
  onDragging: () => void;
  onAddElement: (element: AddElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return draggable({
      element: el,
      getInitialDataForExternal: () => ({
        "text/plain": element.type,
      }),
      getInitialData: () => ({
        type: element.type,
      }),
      onDragStart: onDragging,
    });
  }, []);

  return (
    <div
      ref={ref}
      onClick={() => onAddElement(element)}
      className="flex flex-col gap-2 w-full aspect-square hover:bg-muted cursor-pointer hover:cursor-grab rounded-md p-2 items-center justify-center"
    >
      <div className="flex flex-col gap-2 items-center justify-center size-[45px]">
        <element.icon />
      </div>
      <p className="text-xs font-medium text-center">{element.title}</p>
    </div>
  );
}

function SectionIcon() {
  return (
    <div className="pointer-events-none flex flex-col gap-2 w-[40px] h-[30px] border border-dashed border-black items-center justify-center">
      <div className="w-full h-[15px] border border-black border-r-0 border-l-0" />
    </div>
  );
}

function LinkBlockIcon() {
  return (
    <div className="pointer-events-none flex flex-col gap-2 w-[40px] h-[30px] border border-dashed border-black items-center justify-center">
      <LinkIcon className="size-4" />
    </div>
  );
}
