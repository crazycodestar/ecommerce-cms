import { Form } from "@/components/ui/form";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/form/form-input";
import {
  FormSelect,
  FormSelectContent,
  FormSelectItem,
  FormSelectTrigger,
  FormSelectValue,
} from "@/components/form/form-select";
import { FormTextArea } from "@/components/form/form-text-area";
import { ImageUploader } from "@/components/form/image-uploader";
import { Content } from "@/hooks/use-editor";
import { CollectionListForm } from "./collection-list-form";


export function ContentForm({
  onSubmit,
  form,
  type,
}: {
  form: UseFormReturn<Content["content"]>;
  onSubmit: (data: Content["content"]) => void;
  type: Content["content"]["type"];
}) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* <pre>{JSON.stringify(form.watch("content.type"), null, 2)}</pre> */}
        <>
          {type === "carousel" && (
            <CarouselForm form={form} />
          )}
          {type === "productCarousel" && (
            <div className="flex flex-col gap-4">
              <ProductCarouselForm form={form} />
            </div>
          )}
          {type === "banner" && (
            <div className="flex flex-col gap-4">
              <BannerForm form={form} />
            </div>
          )}
          {type === "categories" && (
            <div className="flex flex-col gap-4">
              <CollectionListForm form={form} />
              {/* <CategoriesForm form={form} /> */}
            </div>
          )}
          {type === "collectionCarousel" && (
            <div className="flex flex-col gap-4">
              <CollectionCarouselForm form={form} />
            </div>
          )}
          <Separator className="my-4" />
          <Button className="w-full" type="submit">Save</Button>
        </>
      </form>
    </Form>
  );
}

function BannerForm({ form }: { form: UseFormReturn<Content["content"]> }) {
  return (
    <>
      <ImageUploader
        control={form.control}
        name="content.imageId"
        label="Image"
      />
      <FormInput
        control={form.control}
        name="content.link"
        placeholder="Enter link"
        label="Link"
      />
    </>
  );
}

function CategoriesForm({ form }: { form: UseFormReturn<Content["content"]> }) {
  const fieldArray = useFieldArray({
    control: form.control,
    name: "content.items",
  });

  const categories = useQuery(api.stores.getStoreCategories);

  return (
    <>
      {fieldArray.fields.map((item, index) => (
        <div key={item.id} className="flex flex-col gap-4">
          <ImageUploader
            control={form.control}
            name={`content.items.${index}.imageId`}
            label="Image"
          />
          <FormInput
            control={form.control}
            name={`content.items.${index}.title`}
            placeholder="Enter title"
            label="Title"
          />
          <FormSelect
            label="Select a category"
            control={form.control}
            name={`content.items.${index}.categoryId`}
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
  form: UseFormReturn<Content["content"]>;
}) {
  const fieldArray = useFieldArray({
    control: form.control,
    name: "content.items",
  });

  const collections = useQuery(api.collections.getStoreCollections);

  return (
    <>
      {fieldArray.fields.map((item, index) => (
        <div key={item.id} className="flex flex-col gap-4">
          <ImageUploader
            control={form.control}
            name={`content.items.${index}.imageId`}
            label="Image"
          />
          <FormInput
            control={form.control}
            name={`content.items.${index}.title`}
            placeholder="Enter title"
            label="Title"
          />
          <FormTextArea
            control={form.control}
            name={`content.items.${index}.description`}
            placeholder="Enter description"
            label="Description"
          />
          <FormSelect
            label="Select a collection"
            control={form.control}
            name={`content.items.${index}.collectionId`}
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
            collectionId: "",
          })
        }
      >
        <PlusCircle className="size-4" /> Add Item
      </Button>
    </>
  );
}

function CarouselForm({ form }: { form: UseFormReturn<Content["content"]> }) {
  const fieldArray = useFieldArray({
    control: form.control,
    name: "content.items",
  });

  const collections = useQuery(api.collections.getStoreCollections);

  return (
    <>
      {/* <pre>{JSON.stringify(form.watch("content.object.items"), null, 2)}</pre> */}
      {fieldArray.fields.map((item, index) => (
        <div key={item.id} className="flex flex-col gap-4">
          <ImageUploader
            control={form.control}
            name={`content.items.${index}.imageId`}
            label="Image"
          />
          <FormSelect
            label="Select a collection"
            control={form.control}
            name={`content.items.${index}.collectionId`}
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
          <FormInput
            control={form.control}
            name={`content.items.${index}.title`}
            placeholder="Enter title"
            label="Title"
          />
          <FormTextArea
            control={form.control}
            name={`content.items.${index}.description`}
            placeholder="Enter description"
            label="Description"
          />
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
            collectionId: "",
            title: "",
            description: "",
          })
        }
      >
        <PlusCircle className="size-4" /> Add Item
      </Button>
    </>
  );
}

function ProductCarouselForm({ form }: { form: UseFormReturn<Content["content"]> }) {
  const collections = useQuery(api.collections.getStoreCollections);
  return (
    <>
      <FormInput
        control={form.control}
        name="content.title"
        placeholder="Enter name"
        label="Title"
      />
      <FormInput
        control={form.control}
        name="content.description"
        placeholder="Enter description"
        label="Description"
      />
      <FormSelect
        label="Select a collection"
        control={form.control}
        name="content.collectionId"
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