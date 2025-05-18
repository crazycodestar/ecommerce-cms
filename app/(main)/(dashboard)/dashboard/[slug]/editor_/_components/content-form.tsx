"use client";

import {
  FormSelect,
  FormSelectContent,
  FormSelectItem,
  FormSelectTrigger,
  FormSelectValue,
} from "@/components/form/form-select";
import { ImageUploader } from "@/components/form/image-uploader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { tryCatch } from "@/lib/try-catch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define the schema for the collection list item
// const collectionListItemSchema = z.object({
//   imageId: z.string().min(1, { message: "Image is required" }),
//   title: z.string().min(1, { message: "Title is required" }),
//   collectionId: z.string().min(1, { message: "Collection ID is required" }),
// });

// Define the main form schema
const contentFormSchema = z.object({
  brandColor: z.string().min(1, { message: "Brand color is required" }),
  titleFont: z.enum([
    "Inter",
    "Roboto",
    "Montserrat",
    "Lora",
    "Poppins",
    "Geist",
    "Geist_Mono",
  ]),
  bodyFont: z.enum([
    "Inter",
    "Roboto",
    "Montserrat",
    "Lora",
    "Poppins",
    "Geist",
    "Geist_Mono",
  ]),
  hero: z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    imageId: z.string().min(1, { message: "Image is required" }),
  }),
  //   collectionList: z.object({
  //     items: z
  //       .array(collectionListItemSchema)
  //       .min(1, { message: "At least one collection is required" }),
  //   }),
});

export type ContentFormValues = z.infer<typeof contentFormSchema>;

export const useContentForm = (contentJson?: string) => {
  const content = contentJson ? JSON.parse(contentJson) : undefined;

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      brandColor: "#e11d48",
      titleFont: "Montserrat",
      bodyFont: "Inter",
      hero: {
        title: "",
        description: "",
        imageId: "",
      },
      //   collectionList: {
      //     items: [],
      //   },
    },
    values: content ?? {},
  });

  const store = useQuery(api.stores.getMyStore);
  const updateContentJson = useMutation(api.contents.updateContentJson);
  const [isPending, startTransition] = useTransition();
  const [isGeneratingSite, setIsGeneratingSite] = useState<boolean | null>(
    null
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromOnboarding = searchParams.get("from") === "onboarding";
  useEffect(() => {
    if (isGeneratingSite === null) return;

    if (store?.siteUrl) {
      setIsGeneratingSite(false);
    }
  }, [store?.siteUrl, isFromOnboarding, router, searchParams, isGeneratingSite]);

  async function onSubmit(data: ContentFormValues) {
    startTransition(async () => {
      const { error } = await tryCatch(
        updateContentJson({
          contentJson: JSON.stringify(data),
        })
      );
      if (error) {
        console.error(error);
        toast.error("Failed to update content");
        return;
      }

      if (store?.siteUrl) {
        toast.success("Content updated successfully");
        return;
      }

      setIsGeneratingSite(true);
    });
  }

  return { form, onSubmit, isPending, isGeneratingSite };
};

export function ContentForm({
  form,
  onSubmit,
  isPending,
}: {
  form: UseFormReturn<ContentFormValues>;
  onSubmit: (data: ContentFormValues) => void;
  isPending: boolean;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-12">
        {/* Brand Color Picker */}
        <FormField
          control={form.control}
          name="brandColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block mb-2 text-base font-semibold">
                Brand Color
              </FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  {/* Color input with swatch */}
                  <label className="relative cursor-pointer">
                    <input
                      type="color"
                      className="w-12 h-12 p-0 border-none bg-transparent shadow-sm"
                      {...field}
                      value={field.value}
                      style={{ background: "none" }}
                    />
                    <span className="sr-only">Pick brand color</span>
                  </label>
                  {/* Hex code display with copy */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={field.value}
                        className="px-2 py-1 rounded border bg-muted text-sm font-mono cursor-pointer select-all"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        aria-label="Brand color hex code"
                      />
                      {/* <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-pink-500 px-1"
                        onClick={() =>
                          navigator.clipboard.writeText(field.value)
                        }
                        tabIndex={-1}
                        aria-label="Copy hex code"
                      >
                        Copy
                      </button> */}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Pick your brand&apos;s primary color
                    </span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Font Pickers */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Typography</h3>

          <FormSelect
            control={form.control}
            name="titleFont"
            label="Title Font"
          >
            <FormSelectTrigger className="w-full">
              <FormSelectValue placeholder="Select title font" />
            </FormSelectTrigger>
            <FormSelectContent>
              <FormSelectItem value="Inter">Inter</FormSelectItem>
              <FormSelectItem value="Roboto">Roboto</FormSelectItem>
              <FormSelectItem value="Montserrat">Montserrat</FormSelectItem>
              <FormSelectItem value="Lora">Lora</FormSelectItem>
              <FormSelectItem value="Poppins">Poppins</FormSelectItem>
              <FormSelectItem value="Geist">Geist</FormSelectItem>
              <FormSelectItem value="Geist_Mono">Geist Mono</FormSelectItem>
            </FormSelectContent>
          </FormSelect>

          <FormSelect control={form.control} name="bodyFont" label="Body Font">
            <FormSelectTrigger className="w-full">
              <FormSelectValue placeholder="Select body font" />
            </FormSelectTrigger>
            <FormSelectContent>
              <FormSelectItem value="Inter">Inter</FormSelectItem>
              <FormSelectItem value="Roboto">Roboto</FormSelectItem>
              <FormSelectItem value="Montserrat">Montserrat</FormSelectItem>
              <FormSelectItem value="Lora">Lora</FormSelectItem>
              <FormSelectItem value="Poppins">Poppins</FormSelectItem>
              <FormSelectItem value="Geist">Geist</FormSelectItem>
              <FormSelectItem value="Geist_Mono">Geist Mono</FormSelectItem>
            </FormSelectContent>
          </FormSelect>
        </div>

        {/* Hero Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Hero Section</h3>
          <ImageUploader
            control={form.control}
            name="hero.imageId"
            label="Hero Image"
          />
          <FormField
            control={form.control}
            name="hero.title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter hero title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hero.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter hero description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Collection List Section */}
        {/* <CollectionListForm form={form} /> */}

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-sidebar">
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}