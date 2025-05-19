"use client";

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
import { tryCatch } from "@/lib/try-catch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
  hero: z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    imageId: z.string().min(1, { message: "Image is required" }),
  }),
  logo: z.object({
    imageId: z.string().min(1, { message: "Logo is required" }),
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
      hero: {
        title: "",
        description: "",
        imageId: "",
      },
      logo: {
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
  }, [
    store?.siteUrl,
    isFromOnboarding,
    router,
    searchParams,
    isGeneratingSite,
  ]);

  async function onSubmit(data: ContentFormValues) {
    startTransition(async () => {
      const { error } = await tryCatch(
        updateContentJson({
          logoId: data.logo as unknown as Id<"_storage">,
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
        {/* Logo Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Brand Logo</h3>
          <ImageUploader
            control={form.control}
            name="logo.imageId"
            label="Logo (PNG only)"
            accept={{
              "image/png": [".png"]
            }}
          />
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
