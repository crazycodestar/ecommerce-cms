import { z } from "zod";
import { create } from "zustand";

const CarouselSchema = z.object({
  type: z.literal("carousel"),
  content: z.object({
    items: z
      .array(
        z.object({
          imageId: z.string(),
          collectionId: z.string(),
        })
      )
      .min(1, { message: "Atleast one image is required" }),
  }),
});

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

const ProductCarouselSchema = z.object({
  type: z.literal("productCarousel"),
  content: z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    collectionId: z.string().min(1, { message: "Please select a collection" }),
  }),
});

const BannerSchema = z.object({
  type: z.literal("banner"),
  content: z.object({
    imageId: z.string().min(1, { message: "Image is required" }),
    link: z.string().url({ message: "Link must be a valid URL" }),
  }),
});

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

export const Content = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  content: z.discriminatedUnion("type", [
    CollectionCarouselSchema,
    ProductCarouselSchema,
    CarouselSchema,
    BannerSchema,
    CategoriesSchema,
  ]),
});

export type Content = z.infer<typeof Content>;

interface EditorState {
  content: Content[];
  addContent: (content: Content) => void;
  insertContent: (index: number, content: Content) => void;
  removeContent: (index: number) => void;
  updateContent: (index: number, content: Content) => void;
  moveContent: (from: number, to: number) => void;
  setContent: (content: Content[]) => void;
}

export const useEditor = create<EditorState>((set) => ({
  content: [],
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
    set((state) => ({ content: state.content.filter((_, i) => i !== index) })),
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
}));
