"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useEditor } from "@/context/editor";
import { layers } from "@/db/lib/layers";
import { addSlot } from "@/db/resource/slots";
import { Element } from "@/db/types";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  BoxIcon,
  CodeXmlIcon,
  ImageIcon,
  LinkIcon,
  TextIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";

type AddElement = {
  title: string;
  type: Element["type"];
  icon: React.FC;
};

const ELEMENTS = [
  {
    title: "Section",
    type: "section",
    icon: SectionIcon,
  },
  {
    title: "Text",
    type: "text",
    icon: TextIcon,
  },
  {
    title: "Image",
    type: "image",
    icon: ImageIcon,
  },
  {
    title: "Container",
    type: "container",
    icon: BoxIcon,
  },
  {
    title: "Link",
    type: "link",
    icon: LinkIcon,
  },
  {
    title: "Link Block",
    type: "linkBlock",
    icon: LinkBlockIcon,
  },
  {
    title: "Code Embed",
    type: "codeEmbed",
    icon: CodeXmlIcon,
  },
] satisfies AddElement[];

export function AddElementSidebar({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) {
  const handleAddElement = async (element: AddElement) => {
    const { bodyId } = useEditor();

    const newItem = layers.getDefaultElement(element.type);
    addSlot({
      id: crypto.randomUUID(),
      element: newItem,
      parentId: bodyId,
    });
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
