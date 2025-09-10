import { useEffect, useState } from "react";
import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { template } from "./template";
import { Pages, Element, layers } from "./elements";

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

interface EditorState {
  // pages
  pages: Pages;
  addElementToPage: (
    pageId: string,
    parentId: string | undefined,
    elementType: Element["type"]
  ) => void;
  insertElementToPage: (
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
  setFocusElement: (focusElement: Element["id"] | null) => void;

  // properties
  // styles: Style[];
  // addStyle: (style: Style) => void;
  // updateStyle: (className: PropertyClassName, property: PropertySchema) => void;
  // removeStyle: (className: PropertyClassName) => void;
}

export const useEditor = create<EditorState>()(
  persist(
    (set) => ({
      focusElement: null,
      content: [],
      pages: template as Pages,
      // styles: [],
      addElementToPage: (pageId, parentId, elementType) =>
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
      insertElementToPage: (pageId, siblingId, instruction, elementType) =>
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
      updateElement: (id, element) =>
        set((state) => ({
          pages: state.pages.map((page) => ({
            ...page,
            elements: layers.update(page.elements, id, element),
          })) as Pages,
        })),

      setFocusElement: (focusElement) => set({ focusElement }),
      // addStyle: (style) =>
      //   set((state) => ({
      //     styles: styles.add(state.styles, style),
      //   })),
      // updateStyle: (className, property) =>
      //   set((state) => ({
      //     styles: styles.update(state.styles, {
      //       className,
      //       property,
      //     }),
      //   })),
      // removeStyle: (className) =>
      //   set((state) => ({
      //     styles: styles.remove(state.styles, className),
      //   })),
    }),
    {
      name: "editor-storage", // unique name for localStorage key
      version: 1,
      partialize: (state) => ({
        focusElement: state.focusElement,
        content: state.content,
        pages: state.pages,
        // styles: state.styles,
      }),
    }
  )
);

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
