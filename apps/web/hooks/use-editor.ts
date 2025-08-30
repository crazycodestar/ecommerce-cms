import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { template } from "./template";

const CarouselSchema = z.object({
  type: z.literal("carousel"),
  content: z.object({
    items: z
      .array(
        z.object({
          imageId: z.string(),
          collectionId: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .min(1, { message: "Atleast one image is required" }),
  }),
});
export type CarouselSchema = z.infer<typeof CarouselSchema>;

export const CollectionCarouselSchema = z.object({
  type: z.literal("collectionCarousel"),
  content: z.object({
    items: z
      .array(
        z.object({
          imageId: z.string().min(1, { message: "Image is required" }),
          title: z.string().min(1, { message: "Title is required" }),
          description: z
            .string()
            .min(1, { message: "Description is required" }),
          collectionId: z
            .string()
            .min(1, { message: "Please select a collection" }),
        })
      )
      .min(1, { message: "Atleast one collection is required" }),
  }),
});
export type CollectionCarouselSchema = z.infer<typeof CollectionCarouselSchema>;

const ProductCarouselSchema = z.object({
  type: z.literal("productCarousel"),
  content: z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    collectionId: z.string().min(1, { message: "Please select a collection" }),
  }),
});
export type ProductCarouselSchema = z.infer<typeof ProductCarouselSchema>;

const BannerSchema = z.object({
  type: z.literal("banner"),
  content: z.object({
    imageId: z.string().min(1, { message: "Image is required" }),
    link: z.string().url({ message: "Link must be a valid URL" }),
  }),
});
export type BannerSchema = z.infer<typeof BannerSchema>;

const CategoriesSchema = z.object({
  type: z.literal("categories"),
  content: z.object({
    items: z
      .array(
        z.object({
          imageId: z.string().min(1, { message: "Image is required" }),
          title: z.string().min(1, { message: "Title is required" }),
          categoryId: z
            .string()
            .min(1, { message: "Please select a category" }),
        })
      )
      .min(1, { message: "Atleast one category is required" }),
  }),
});
export type CategoriesSchema = z.infer<typeof CategoriesSchema>;

export const Content = z.object({
  id: z.string(),
  // name: z.string(),
  // type: z.string(),
  content: z.discriminatedUnion("type", [
    CollectionCarouselSchema,
    ProductCarouselSchema,
    CarouselSchema,
    BannerSchema,
    CategoriesSchema,
  ]),
});

export type Content = z.infer<typeof Content>;

export const contentTypes: (Content["content"] & { name: string })[] = [
  {
    type: "banner",
    name: "Banner",
    content: {
      imageId: "",
      link: "",
    },
  },
  {
    type: "carousel",
    name: "Carousel",
    content: {
      items: [],
    },
  },
  {
    type: "categories",
    name: "Categories",
    content: {
      items: [],
    },
  },
  {
    type: "collectionCarousel",
    name: "Collection Carousel",
    content: {
      items: [],
    },
  },
  {
    type: "productCarousel",
    name: "Product Carousel",
    content: {
      title: "",
      description: "",
      collectionId: "",
    },
  },
];

export type ClassName = {
  id: string;
  text: string;
};

// First, define the base element types
export type BaseElement = {
  id: string;
  name: string;
  hasBeenEdited?: boolean;
  className?: ClassName[];
};

export type BodyElement = BaseElement & {
  type: "body";
  children: Element[];
};

export type SectionElement = BaseElement & {
  type: "section";
  children: Element[];
};

export type TextElement = BaseElement & {
  type: "text";
  text: string;
};

export type ImageElement = BaseElement & {
  type: "image";
  src: string;
  alt?: string;
};

export type ContainerElement = BaseElement & {
  type: "container";
  children: Element[];
};

export type LinkElement = BaseElement & {
  type: "link";
  href: string;
  text: string;
};

export type LinkBlockElement = BaseElement & {
  type: "linkBlock";
  href: string;
  children: Element[];
};

export type CodeEmbedElement = BaseElement & {
  type: "codeEmbed";
  code: string;
};

// Union type of all possible elements
export type Element =
  | BodyElement
  | SectionElement
  | TextElement
  | ImageElement
  | ContainerElement
  | LinkElement
  | LinkBlockElement
  | CodeEmbedElement;

// Factory object with proper typing
export const Element = {
  body: {
    id: "",
    name: "Body",
    type: "body" as const,
    children: [],
  },
  section: {
    id: "",
    name: "Section",
    type: "section" as const,
    children: [],
  },
  text: {
    id: "",
    name: "Text",
    type: "text" as const,
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
  },
  image: {
    id: "",
    name: "Image",
    type: "image" as const,
    src: "/placeholder.svg",
    alt: "",
  },
  container: {
    id: "",
    name: "Container",
    type: "container" as const,
    children: [],
  },
  link: {
    id: "",
    name: "Link",
    type: "link" as const,
    href: "/",
    text: "Link",
  },
  linkBlock: {
    id: "",
    name: "Link Block",
    type: "linkBlock" as const,
    href: "/",
    children: [],
  },
  codeEmbed: {
    id: "",
    name: "Code Embed",
    type: "codeEmbed" as const,
    code: "",
  },
} satisfies Record<Element["type"], Element>;

export type ElementType = (typeof Element)[keyof typeof Element]["type"];

export type Page = {
  id: string;
  name: string;
  elements: Element[];
};

function getDefaultElement(
  element: Element["type"]
): Omit<Element, "hasBeenEdited" | "id"> {
  return Element[element as keyof typeof Element];
}

export type Pages = [Page & { id: "home" }, ...Page[]];
interface EditorState {
  // pages
  pages: Pages;
  addContentToPage: (
    pageId: string,
    parentId: string | undefined,
    elementType: Element["type"]
  ) => void;
  insertContentToPage: (
    pageId: string,
    siblingId: string,
    instruction: "before" | "after",
    elementType: Element["type"]
  ) => void;
  updateElement: (id: Element["id"], element: Partial<Element>) => void;

  // content
  content: Content[];
  addContent: (content: Content) => void;
  insertContent: (index: number, content: Content) => void;
  removeContent: (index: number) => void;
  updateContent: (index: number, content: Content) => void;
  moveContent: (from: number, to: number) => void;
  setContent: (content: Content[]) => void;

  // focus element
  focusElement: Element["id"] | null;
  setFocusElement: (id: Element["id"] | null) => void;
}

export const useEditor = create<EditorState>()(
  persist(
    (set) => ({
      focusElement: null,
      content: [],
      pages: template as Pages,
      addContentToPage: (pageId, parentId, elementType) =>
        set((state) => {
          const page = state.pages.find((page) => page.id === pageId);
          if (!page) return state;

          page.elements = parentId
            ? layers.add(page.elements, parentId, elementType)
            : [...page.elements, layers.newItem(elementType)];

          return {
            pages: state.pages,
          };
        }),
      insertContentToPage: (pageId, siblingId, instruction, elementType) =>
        set((state) => {
          const page = state.pages.find((page) => page.id === pageId);
          if (!page) return state;

          page.elements = layers.insert(
            instruction,
            page.elements,
            siblingId,
            elementType
          );

          return {
            pages: state.pages,
          };
        }),
      addContent: (content) =>
        set((state) => ({ content: [...state.content, content] })),
      insertContent: (index, content) =>
        set((state) => ({
          content: [
            ...state.content.slice(0, index),
            content,
            ...state.content.slice(index),
          ],
        })),
      removeContent: (index) =>
        set((state) => ({
          content: state.content.filter((_, i) => i !== index),
        })),
      updateContent: (index, content) =>
        set((state) => ({
          content: state.content.map((c, i) => (i === index ? content : c)),
        })),
      moveContent: (from, to) =>
        set((state) => {
          const newContent = [...state.content];
          const [removed] = newContent.splice(from, 1);
          newContent.splice(to, 0, removed);
          return { content: newContent };
        }),
      setContent: (content) => set({ content }),
      setFocusElement: (id) => set({ focusElement: id }),
      updateElement: (id, element) =>
        set((state) => ({
          pages: state.pages.map((page) => ({
            ...page,
            elements: layers.update(page.elements, id, element),
          })) as Pages,
        })),
    }),
    {
      name: "editor-storage", // unique name for localStorage key
      version: 1,
      partialize: (state) => ({
        focusElement: state.focusElement,
        content: state.content,
        pages: state.pages,
      }),
    }
  )
);

export const layers = {
  add: (
    data: Element[],
    parentId: string,
    newItemType: Element["type"]
  ): Element[] => {
    const newItem = layers.newItem(newItemType);
    return data.map((item) => {
      if (item.id === parentId && "children" in item) {
        return {
          ...item,
          children: [...item.children, newItem],
        };
      }
      if (layers.hasChildren(item)) {
        return {
          ...item,
          children: layers.add(item.children, parentId, newItemType),
        };
      }
      return item;
    });
  },
  insert(
    pos: "before" | "after",
    data: Element[],
    siblingId: string,
    newItemType: Element["type"]
  ): Element[] {
    return data.flatMap((item) => {
      if (item.id === siblingId) {
        const newItem = layers.newItem(newItemType);
        return pos === "before" ? [newItem, item] : [item, newItem];
      }
      if (layers.hasChildren(item)) {
        return {
          ...item,
          children: layers.insert(pos, item.children, siblingId, newItemType),
        };
      }
      return item;
    });
  },
  update: (
    data: Element[],
    id: string,
    element: Partial<Element>
  ): Element[] => {
    return data.map((item) => {
      if (item.id === id) return { ...item, ...element, hasBeenEdited: true };
      if (layers.hasChildren(item)) {
        return {
          ...item,
          children: layers.update(item.children, id, element),
        };
      }
      return item;
    }) as Element[];
  },
  // utilities
  newItem: (type: Element["type"]): Element => {
    return {
      ...getDefaultElement(type),
      hasBeenEdited: false,
      id: crypto.randomUUID(),
    } as Element;
  },
  find: (data: Element[], id: string): Element | undefined => {
    for (const element of data) {
      if (element.id === id) return element;
      if (layers.hasChildren(element)) {
        const found = layers.find(element.children, id);
        if (found) return found;
      }
    }
  },
  hasChildren: (data: Element): data is Element & { children: Element[] } => {
    if (!("children" in data)) return false;
    return data.children.length > 0;
  },
};

type WindowWithSync = Window & typeof globalThis & { sync: () => void };

export function useSync() {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || isHydrated) return;

    (window as WindowWithSync).sync = useEditor.persist.rehydrate;
    setIsHydrated(true);
  }, [isHydrated]);
}

// 🔑 add a sync listener
if (typeof window !== "undefined") {
  window.addEventListener("storage", () => {
    (window as WindowWithSync).sync();

    const iframe = document.querySelector(
      "#editor-iframe"
    ) as HTMLIFrameElement | null;
    if (!iframe) return;
    (iframe.contentWindow as WindowWithSync).sync();
  });
}
