import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Separator } from "../ui/separator";
import { FormInput } from "./form-input";
import {
  FormSelect,
  FormSelectContent,
  FormSelectItem,
  FormSelectTrigger,
  FormSelectValue,
} from "./form-select";
import { ImagePicker } from "./image-array-form";
import { Button } from "../ui/button";
import { MinusCircle, PlusCircle } from "lucide-react";
import { ImageUploader } from "./image-uploader";
import { FormTextArea } from "./form-text-area";

const carouselSchema = z.object({
  name: z.literal("carousel"),
  object: z.object({
    imageIds: z
      .array(
        z.object({
          imageId: z.string(),
        })
      )
      .min(1, { message: "Atleast one image is required" }),
  }),
});

const productCarouselSchema = z.object({
  name: z.literal("productCarousel"),
  object: z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    collectionId: z.string().min(1, { message: "Please select a collection" }),
  }),
});

const collectionCarouselSchema = z.object({
  name: z.literal("collectionCarousel"),
  object: z.object({
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

const banner = z.object({
  name: z.literal("banner"),
  object: z.object({
    imageId: z.string().min(1, { message: "Image is required" }),
    link: z.string().url({ message: "Link must be a valid URL" }),
  }),
});

const categories = z.object({
  name: z.literal("categories"),
  object: z.object({
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

export const contentSchema = z.object({
  index: z.string().optional(),
  content: z.union([
    banner,
    categories,
    carouselSchema,
    productCarouselSchema,
    collectionCarouselSchema,
  ]),
});

export type ContentSchema = z.infer<typeof contentSchema>;

export const contentFormSchema = z.object({
  contents: z.array(
    z.object({
      content: contentSchema,
    })
  ),
});

export type ContentFormSchema = z.infer<typeof contentFormSchema>;

export function AddContentForm({
  index,
  onSubmit,
  form,
}: {
  index?: number;
  form: UseFormReturn<ContentSchema>;
  onSubmit: (data: ContentSchema) => void;
}) {
  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
          e.stopPropagation();
        }}
      >
        {/* FIXME: Invalid content type error handler (problem: Invalid literal value, expected "carousel") */}
        <FormSelect
          label="Content Type"
          control={form.control}
          name="content.name"
        >
          <FormSelectTrigger className="w-full">
            <FormSelectValue placeholder="Select a content type" />
          </FormSelectTrigger>
          <FormSelectContent>
            <FormSelectItem value="carousel">Carousel</FormSelectItem>
            <FormSelectItem value="productCarousel">
              Product Carousel
            </FormSelectItem>
            <FormSelectItem value="banner">Banner</FormSelectItem>
            <FormSelectItem value="categories">Categories</FormSelectItem>
            <FormSelectItem value="collectionCarousel">
              Collection Carousel
            </FormSelectItem>
          </FormSelectContent>
        </FormSelect>
        {/* <pre>{JSON.stringify(form.watch("index"), null, 2)}</pre> */}
        <input {...form.register("index")} type="hidden" value={index} />
        <>
          <Separator className="my-4" />

          {form.watch("content.name") === "carousel" && (
            <CarouselForm form={form} />
          )}
          {form.watch("content.name") === "productCarousel" && (
            <div className="flex flex-col gap-4">
              <ProductCarouselForm form={form} />
            </div>
          )}
          {form.watch("content.name") === "banner" && (
            <div className="flex flex-col gap-4">
              <BannerForm form={form} />
            </div>
          )}
          {form.watch("content.name") === "categories" && (
            <div className="flex flex-col gap-4">
              <CategoriesForm form={form} />
            </div>
          )}
          {form.watch("content.name") === "collectionCarousel" && (
            <div className="flex flex-col gap-4">
              <CollectionCarouselForm form={form} />
            </div>
          )}
        </>
      </form>
    </Form>
  );
}

function BannerForm({ form }: { form: UseFormReturn<ContentSchema> }) {
  return (
    <>
      <ImageUploader
        control={form.control}
        name="content.object.imageId"
        label="Image"
      />
      <FormInput
        control={form.control}
        name="content.object.link"
        placeholder="Enter link"
        label="Link"
      />
    </>
  );
}

function CategoriesForm({ form }: { form: UseFormReturn<ContentSchema> }) {
  const fieldArray = useFieldArray({
    control: form.control,
    name: "content.object.items",
  });

  const categories = useQuery(api.stores.getStoreCategories);

  return (
    <>
      {fieldArray.fields.map((item, index) => (
        <div key={item.id} className="flex flex-col gap-4">
          <ImageUploader
            control={form.control}
            name={`content.object.items.${index}.imageId`}
            label="Image"
          />
          <FormInput
            control={form.control}
            name={`content.object.items.${index}.title`}
            placeholder="Enter title"
            label="Title"
          />
          <FormSelect
            label="Select a category"
            control={form.control}
            name={`content.object.items.${index}.categoryId`}
          >
            <FormSelectTrigger className="w-full">
              <FormSelectValue placeholder="Select a category" />
            </FormSelectTrigger>
            <FormSelectContent>
              {categories?.map((category) => (
                <FormSelectItem key={category._id} value={category._id}>
                  {category.name}
                </FormSelectItem>
              ))}
            </FormSelectContent>
          </FormSelect>
          <Button
            type="button"
            variant="outline"
            onClick={() => fieldArray.remove(index)}
          >
            <MinusCircle className="size-4" /> Remove
          </Button>
          <Separator />
        </div>
      ))}
      <Button
        type="button"
        onClick={() =>
          fieldArray.append({ imageId: "", title: "", categoryId: "" })
        }
      >
        <PlusCircle className="size-4" /> Add Item
      </Button>
    </>
  );
}

function CollectionCarouselForm({
  form,
}: {
  form: UseFormReturn<ContentSchema>;
}) {
  const fieldArray = useFieldArray({
    control: form.control,
    name: "content.object.items",
  });

  const collections = useQuery(api.collections.getStoreCollections);

  return (
    <>
      {fieldArray.fields.map((item, index) => (
        <div key={item.id} className="flex flex-col gap-4">
          <ImageUploader
            control={form.control}
            name={`content.object.items.${index}.imageId`}
            label="Image"
          />
          <FormInput
            control={form.control}
            name={`content.object.items.${index}.title`}
            placeholder="Enter title"
            label="Title"
          />
          <FormTextArea
            control={form.control}
            name={`content.object.items.${index}.description`}
            placeholder="Enter description"
            label="Description"
          />
          <FormSelect
            label="Select a collection"
            control={form.control}
            name={`content.object.items.${index}.collectionId`}
          >
            <FormSelectTrigger className="w-full">
              <FormSelectValue placeholder="Select a collection" />
            </FormSelectTrigger>
            <FormSelectContent>
              {collections?.map((collection) => (
                <FormSelectItem key={collection._id} value={collection._id}>
                  {collection.name}
                </FormSelectItem>
              ))}
            </FormSelectContent>
          </FormSelect>
          <Button
            type="button"
            variant="outline"
            onClick={() => fieldArray.remove(index)}
          >
            <MinusCircle className="size-4" /> Remove
          </Button>
          <Separator />
        </div>
      ))}
      <Button
        type="button"
        onClick={() =>
          fieldArray.append({
            imageId: "",
            title: "",
            description: "",
            collectionId: "",
          })
        }
      >
        <PlusCircle className="size-4" /> Add Item
      </Button>
    </>
  );
}

function CarouselForm({ form }: { form: UseFormReturn<ContentSchema> }) {
  const fieldArray = useFieldArray({
    control: form.control,
    name: "content.object.imageIds",
  });

  return (
    <FormField
      control={form.control}
      name="content.object.imageIds"
      render={() => (
        <FormItem>
          <ImagePicker
            // @ts-expect-error incompatible fieldArray types -> but like they should be
            fieldArray={fieldArray}
            containerClassName="flex flex-col gap-2"
            imageClassName="aspect-[5/2]"
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ProductCarouselForm({ form }: { form: UseFormReturn<ContentSchema> }) {
  const collections = useQuery(api.collections.getStoreCollections);
  return (
    <>
      <FormInput
        control={form.control}
        name="content.object.title"
        placeholder="Enter name"
        label="Title"
      />
      <FormInput
        control={form.control}
        name="content.object.description"
        placeholder="Enter description"
        label="Description"
      />
      <FormSelect
        label="Select a collection"
        control={form.control}
        name="content.object.collectionId"
      >
        <FormSelectTrigger className="w-full">
          <FormSelectValue placeholder="Select a collection" />
        </FormSelectTrigger>
        <FormSelectContent>
          {collections?.map((collection) => (
            <FormSelectItem key={collection._id} value={collection._id}>
              {collection.name}
            </FormSelectItem>
          ))}
        </FormSelectContent>
      </FormSelect>
    </>
  );
}
