"use client";

import {
  AddContentForm,
  ContentFormSchema,
  contentFormSchema,
  contentSchema,
  ContentSchema,
} from "@/components/form/content-form";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { ToastSave } from "@/components/toast-save";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { tryCatch } from "@/lib/try-catch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { PackageOpen } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Banner } from "../../../../../../../components/editor/banner";
import { CollectionsCarousel } from "../../../../../../../components/editor/collections-carousel";
import {
  Edit,
  EditClose,
  EditContent,
  EditFooter,
  EditWrapper,
} from "./edit-trigger";
import { HeroCarousel } from "@/components/editor/hero-carousel";
import { ProductCarousel } from "@/components/editor/product-carousel";
import { ShopByCategory } from "@/components/editor/shop-by-category";
import { useParams } from "next/navigation";

const useAddContentForm = (callbackfn: (data: ContentSchema) => void) => {
  const form = useForm<ContentSchema>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      content: {
        object: {
          collectionId: "",
          description: "",
          imageIds: [],
          title: "",
          imageId: "",
          items: [],
          link: "",
        },
      },
    },
  });

  // This function will set all values of the form at once
  const setAllFormValues = (data: Partial<ContentSchema>) => {
    // Loop through each property in the data object
    Object.entries(data).forEach(([fieldName, value]) => {
      // Use setValue to set each field's value
      form.setValue(fieldName as keyof ContentSchema, value, {
        shouldValidate: true, // Trigger validation
        shouldDirty: true, // Mark field as dirty
        shouldTouch: true, // Mark field as touched
      });
    });
  };

  const handleSubmit = (data: ContentSchema) => {
    form.reset();
    callbackfn(data);
  };

  return { form, handleSubmit, setAllFormValues };
};

export function ContentLayout({
  defaultValues,
}: {
  defaultValues: ContentFormSchema;
}) {
  const { slug } = useParams<{ slug: string }>();
  const form = useForm<ContentFormSchema>({
    resolver: zodResolver(contentFormSchema),
    defaultValues,
  });

  // This function will set all values of the form at once
  const setAllFormValues = (data: Partial<ContentFormSchema>) => {
    // Loop through each property in the data object
    Object.entries(data).forEach(([fieldName, value]) => {
      // Use setValue to set each field's value
      form.setValue(fieldName as keyof ContentFormSchema, value, {
        shouldValidate: true, // Trigger validation
        shouldDirty: true, // Mark field as dirty
        shouldTouch: true, // Mark field as touched
      });
    });
  };

  const [isFormDirty, setIsFormDirty] = React.useState(false);
  // Watch for form changes to enable/disable submit button
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      // Check if current values differ from default values
      const isDirty = JSON.stringify(value) !== JSON.stringify(defaultValues);
      setIsFormDirty(isDirty);
    });

    return () => subscription.unsubscribe();
  }, [defaultValues, form, form.watch]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contents",
  });

  const [isPending, startTransition] = React.useTransition();
  const updateContent = useMutation(api.contents.updateContents);
  const handleSubmit = (data: ContentFormSchema) => {
    startTransition(async () => {
      const { error } = await tryCatch(
        updateContent({
          // @ts-expect-error undefined error would never be hit
          contents: data.contents.map(
            ({
              content: {
                content: { name, object },
              },
            }) => ({
              ...(name === "productCarousel" && {
                name,
                object: {
                  collectionId: object.collectionId,
                  title: object.title,
                  description: object.description,
                },
              }),
              ...(name === "carousel" && {
                name,
                object: {
                  imageIds: object.imageIds.map(
                    (i) => i.imageId as Id<"_storage">
                  ),
                },
              }),
              ...(name === "collectionCarousel" && {
                name,
                object: {
                  items: object.items
                    .filter((i) => "collectionId" in i)
                    .map((i) => ({
                      imageId: i.imageId,
                      title: i.title,
                      description: i.description,
                      collectionId: i.collectionId,
                    })),
                },
              }),
              ...(name === "categories" && {
                name,
                object: {
                  items: object.items
                    .filter((i) => "categoryId" in i)
                    .map((i) => ({
                      imageId: i.imageId,
                      title: i.title,
                      categoryId: i.categoryId as Id<"categories">,
                    })),
                },
              }),
              ...(name === "banner" && {
                name,
                object: {
                  imageId: object.imageId,
                  link: object.link,
                },
              }),
            })
          ),
        })
      );

      if (error) {
        console.error(error);
        toast.error("Failed to update content");
        return;
      }

      // form.reset();
      setIsSuccess(true);
      await setTimeout(() => {
        setIsFormDirty(false);
        setTimeout(() => setIsSuccess(false), 100);
      }, 2000);
    });
  };

  const [isSuccess, setIsSuccess] = React.useState(false);
  const state = isSuccess ? "success" : isPending ? "loading" : "initial";

  const handleReset = () => {
    setAllFormValues(defaultValues);
  };

  const [Open, onOpenChange] = React.useState(false);
  const handleAddContent = (data: ContentSchema) => {
    onOpenChange(false);
    console.log("index: ", data.index);
    if (data.index === undefined || data.index === "")
      return append({ content: data });

    const index = parseInt(data.index);
    return form.setValue(`contents.${index}`, {
      content: data,
    });
  };
  const {
    form: addContentForm,
    handleSubmit: handleAddContentSubmit,
    setAllFormValues: setAllAddFormValues,
  } = useAddContentForm(handleAddContent);

  const handleOpenAddSheet = (index?: number) => {
    addContentForm.reset();
    // FIXME: support insert
    // addContentForm.setValue("index", index?.toString() ?? "");
    onOpenChange(true);
  };

  const handleOpenEditSheet = (index: number) => {
    const { content } = form.watch(`contents.${index}`);
    setAllAddFormValues({
      ...content,
      index: index.toString(),
    });
    onOpenChange(true);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex-1 flex flex-col"
      >
        <motion.div
          variants={{
            visible: { opacity: 1, translateY: 0 },
            hidden: { opacity: 0, translateY: 100 },
          }}
          initial="hidden"
          animate={isFormDirty ? "visible" : "hidden"}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={
            "flex items-center justify-center bottom-6 fixed z-50 left-1/2 -translate-x-1/2"
          }
        >
          <ToastSave
            state={state}
            onSave={form.handleSubmit(handleSubmit)}
            onReset={handleReset}
          />
        </motion.div>
        <Edit open={Open} onOpenChange={onOpenChange}>
          {fields?.length !== 0 ? null : (
            <div className="flex flex-col items-center justify-center px-4 flex-1 w-full">
              <AnimatedGroup preset="blur-slide" className="text-center">
                <div className="p-4 mb-3 w-fit rounded-md bg-muted text-muted-foreground mx-auto">
                  <PackageOpen className="size-6" />
                </div>
                <h3 className="text-xl font-bold">No content available.</h3>
                <p className="text-gray-500 mb-4">
                  Start Building your page by adding new content.
                </p>
                <Button type="button" onClick={() => handleOpenAddSheet()}>
                  Add content
                </Button>
              </AnimatedGroup>
            </div>
          )}
          {fields?.map(({ content: { content } }, index) => (
            <React.Fragment key={index}>
              {content.name === "productCarousel" && (
                <div className="mx-4">
                  <EditWrapper
                    onOpenAddSheet={handleOpenAddSheet}
                    onOpenEditSheet={() => handleOpenEditSheet(index)}
                    onRemove={() => remove(index)}
                  >
                    <ProductCarousel
                      storeSlug={slug}
                      title={form.watch(
                        `contents.${index}.content.content.object.title`
                      )}
                      description={form.watch(
                        `contents.${index}.content.content.object.description`
                      )}
                      collectionId={
                        form.watch(
                          `contents.${index}.content.content.object.collectionId`
                        ) as Id<"collections">
                      }
                    />
                  </EditWrapper>
                </div>
              )}
              {content.name === "carousel" && (
                <div className="mx-4">
                  <EditWrapper
                    onOpenAddSheet={handleOpenAddSheet}
                    onOpenEditSheet={() => handleOpenEditSheet(index)}
                    onRemove={() => remove(index)}
                  >
                    <HeroCarousel
                      imageIds={form
                        .watch(
                          `contents.${index}.content.content.object.imageIds`
                        )
                        .map((i) => i.imageId as Id<"_storage">)}
                    />
                  </EditWrapper>
                </div>
              )}
              {content.name === "collectionCarousel" && (
                <div className="mx-4">
                  <EditWrapper
                    onOpenAddSheet={handleOpenAddSheet}
                    onOpenEditSheet={() => handleOpenEditSheet(index)}
                    onRemove={() => remove(index)}
                  >
                    <CollectionsCarousel
                      slides={form
                        .watch(`contents.${index}.content.content.object.items`)
                        .filter((i) => "collectionId" in i)
                        .map((i) => ({
                          imageId: i.imageId as Id<"_storage">,
                          title: i.title,
                          description: i.description,
                          collectionId: i.collectionId,
                        }))}
                    />
                  </EditWrapper>
                </div>
              )}
              {content.name === "categories" && (
                <div className="mx-4">
                  <EditWrapper
                    onOpenAddSheet={handleOpenAddSheet}
                    onOpenEditSheet={() => handleOpenEditSheet(index)}
                    onRemove={() => remove(index)}
                  >
                    <ShopByCategory
                      categories={form
                        .watch(`contents.${index}.content.content.object.items`)
                        .filter((i) => "categoryId" in i)
                        .map((i) => ({
                          title: i.title,
                          imageId: i.imageId as Id<"_storage">,
                          categoryId: i.categoryId as Id<"categories">,
                        }))}
                    />
                  </EditWrapper>
                </div>
              )}
              {content.name === "banner" && (
                <div className="mx-4">
                  <EditWrapper
                    onOpenAddSheet={handleOpenAddSheet}
                    onOpenEditSheet={() => handleOpenEditSheet(index)}
                    onRemove={() => remove(index)}
                  >
                    <Banner
                      imageId={
                        form.watch(
                          `contents.${index}.content.content.object.imageId`
                        ) as Id<"_storage">
                      }
                      link={form.watch(
                        `contents.${index}.content.content.object.link`
                      )}
                    />
                  </EditWrapper>
                </div>
              )}
              <div className="h-8 w-full" />
            </React.Fragment>
          ))}
          <EditContent>
            <div className="flex flex-col gap-2 px-4 py-4 overflow-y-auto">
              <AddContentForm
                form={addContentForm}
                onSubmit={handleAddContentSubmit}
              />
            </div>
            <EditFooter className="border-t px-4 py-4 sm:items-center">
              <EditClose asChild>
                <Button
                  className="w-full"
                  type="button"
                  onClick={addContentForm.handleSubmit(handleAddContentSubmit)}
                >
                  Add Content
                </Button>
              </EditClose>
            </EditFooter>
          </EditContent>
        </Edit>
      </form>
    </Form>
  );
}
