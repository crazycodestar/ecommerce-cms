import { useEffect, useState } from "react";
import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { template } from "./template";
import { Pages, Element, layers, BodyElement } from "./elements";
import { useHotkeys } from "react-hotkeys-hook";

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

type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

type FunctionParams<T> = {
  [K in FunctionKeys<T>]?: T[K] extends (...args: infer P) => any ? P : never;
};

export type PlaceInFolderAtBottom = {
  instruction: "place-in-folder-at-bottom";
  elementId: Element["id"];
  parentId?: Element["id"];
};

export type PlaceInFolderAtSibling = {
  instruction: "place-in-folder-at-sibling";
  elementId: Element["id"];
  siblingId: Element["id"];
  position: "before" | "after";
};

export type PlaceInFolderAtTop = {
  instruction: "place-in-folder-at-top";
  elementId: Element["id"];
  parentId: Element["id"];
};

export type PlacementInstruction =
  | PlaceInFolderAtBottom
  | PlaceInFolderAtSibling
  | PlaceInFolderAtTop;

interface EditorState {
  // pages
  pages: Pages;
  insertElementToPage: (
    pageId: string,
    siblingId: string,
    instruction: "before" | "after" | undefined,
    newItem: Element
  ) => void;
  moveElement: (placementInstruction: PlacementInstruction) => void;
  updateElement: (id: Element["id"], element: Partial<Element>) => void;
  deleteElement: (elementId: Element["id"]) => void;

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

  // history
  history: {
    undo: FunctionParams<EditorState>;
    redo: FunctionParams<EditorState>;
  }[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;

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
      history: [],
      historyIndex: -1,
      // styles: [],
      insertElementToPage: (pageId, siblingOrParentId, instruction, newItem) =>
        set((state) => {
          const page = state.pages.find((page) => page.id === pageId);
          if (!page) return state;

          // const newItem = layers.newItem(elementType);

          if (!instruction)
            page.body = layers.add(
              page.body,
              siblingOrParentId,
              newItem
            ) as BodyElement;
          else
            page.body = layers.insert(
              instruction,
              page.body,
              siblingOrParentId,
              newItem
            ) as BodyElement;

          return {
            pages: state.pages,
            focusElement: newItem.id,
            history: [
              ...state.history.slice(0, state.historyIndex + 1),
              {
                undo: { deleteElement: [newItem.id] },
                redo: {
                  insertElementToPage: [
                    pageId,
                    siblingOrParentId,
                    instruction,
                    newItem,
                  ],
                },
              },
            ],
            historyIndex: state.historyIndex + 1,
          };
        }),
      moveElement: (placementInstruction) =>
        set((state) => {
          const body = state.pages[0].body;
          const element = layers.find(body, placementInstruction.elementId);
          if (!element) return state;

          if (
            placementInstruction.instruction === "place-in-folder-at-bottom"
          ) {
            const parentId = placementInstruction.parentId ?? body.id;
            const bodyWithoutElement = layers.delete(body, element.id);
            const pageWithElementInserted = layers.insert(
              "end",
              bodyWithoutElement,
              parentId,
              element
            );

            state.pages[0].body = pageWithElementInserted as BodyElement;

            return {
              page: state.pages,
              focusElement: element.id,
              history: [
                ...state.history.slice(0, state.historyIndex + 1),
                {
                  undo: { deleteElement: [element.id] },
                  redo: {
                    moveElement: [placementInstruction],
                  },
                },
              ],
              historyIndex: state.historyIndex + 1,
            };
          }

          if (
            placementInstruction.instruction === "place-in-folder-at-sibling"
          ) {
            const bodyWithoutElement = layers.delete(body, element.id);
            const pageWithElementInserted = layers.insert(
              placementInstruction.position,
              bodyWithoutElement,
              placementInstruction.siblingId,
              element
            );

            state.pages[0].body = pageWithElementInserted as BodyElement;

            return {
              page: state.pages,
              focusElement: element.id,
              history: [
                ...state.history.slice(0, state.historyIndex + 1),
                {
                  undo: { deleteElement: [element.id] },
                  redo: {
                    moveElement: [placementInstruction],
                  },
                },
              ],
              historyIndex: state.historyIndex + 1,
            };
          }

          if (placementInstruction.instruction === "place-in-folder-at-top") {
            const parentId = placementInstruction.parentId;
            const bodyWithoutElement = layers.delete(body, element.id);
            const pageWithElementInserted = layers.insert(
              "start",
              bodyWithoutElement,
              parentId,
              element
            );

            state.pages[0].body = pageWithElementInserted as BodyElement;

            return {
              page: state.pages,
              focusElement: element.id,
              history: [
                ...state.history.slice(0, state.historyIndex + 1),
                {
                  undo: { deleteElement: [element.id] },
                  redo: {
                    moveElement: [placementInstruction],
                  },
                },
              ],
              historyIndex: state.historyIndex + 1,
            };
          }

          return state;
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
        set((state) => {
          const previousElement = layers.find(state.pages[0].body, id);
          if (!previousElement) return state;

          return {
            pages: state.pages.map((page) => ({
              ...page,
              body: layers.update(page.body, id, element),
            })) as Pages,
            focusElement: id,

            history: [
              ...state.history.slice(0, state.historyIndex + 1),
              {
                undo: { updateElement: [id, previousElement] },
                redo: { updateElement: [id, element] },
              },
            ],
            historyIndex: state.historyIndex + 1,
          };
        }),
      deleteElement: (elementId) =>
        set((state) => {
          const element = layers.find(state.pages[0].body, elementId);
          if (!element || element.type === "body") return state;

          const parentOrSibling = layers.findParentOrSiblingId(
            state.pages[0].body,
            elementId
          );
          if (!parentOrSibling) return state;

          return {
            pages: state.pages.map((page) => ({
              ...page,
              body: layers.delete(page.body, elementId),
            })) as Pages,
            focusElement: null,

            history: [
              ...state.history.slice(0, state.historyIndex + 1),
              {
                redo: { deleteElement: [elementId] },
                undo: {
                  insertElementToPage: [
                    state.pages[0].id,
                    parentOrSibling.id,
                    parentOrSibling.instruction,
                    element,
                  ],
                },
              },
            ],
            historyIndex: state.historyIndex + 1,
          };
        }),
      setFocusElement: (focusElement) => set({ focusElement }),

      // history
      undo: () =>
        set((state) => {
          const fns = state.history[state.historyIndex].undo;
          Object.entries(fns).forEach(([fn, params]) => {
            // @ts-expect-error it's all callable
            state[fn](...params);
          });

          return {
            history: state.history,
            historyIndex: state.historyIndex - 1,
          };
        }),
      redo: () =>
        set((state) => {
          const fns = state.history[state.historyIndex + 1].redo;
          Object.entries(fns).forEach(([fn, params]) => {
            // @ts-expect-error it's all callable
            state[fn](...params);
          });

          return {
            history: state.history,
            historyIndex: state.historyIndex + 1,
          };
        }),
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
        history: state.history,
        historyIndex: state.historyIndex,
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
