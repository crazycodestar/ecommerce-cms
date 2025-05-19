"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import {
  ChevronLeft,
  ChevronRight,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import { ImageUploader } from "@/components/form/image-uploader";
import { useQuery } from "convex/react";
import { api as convexApi } from "@packages/backend/convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { ContentFormValues } from "./content-form";
import { useState } from "react";
import { z } from "zod";

interface Collection {
  _id: string;
  name: string;
}

// Define the schema for the collection list item
const collectionListItemSchema = z.object({
  imageId: z.string().min(1, { message: "Image is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  collectionId: z.string().min(1, { message: "Collection ID is required" }),
});

// Define the main form schema
export const contentFormSchema = z.object({
  collectionList: z.object({
    items: z
      .array(collectionListItemSchema)
      .min(1, { message: "At least one collection is required" }),
  }),
});

interface CollectionListFormProps {
  form: UseFormReturn<ContentFormValues>;
}

export type ContentFormValues = z.infer<typeof contentFormSchema>;

export function CollectionListForm({ form }: CollectionListFormProps) {
  const collections = useQuery(convexApi.collections.getStoreCollections) ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "collectionList.items",
  });

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < fields.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleRemove = () => {
    remove(currentIndex);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleAdd = () => {
    append({
      imageId: "",
      title: "",
      collectionId: "",
    });
    setCurrentIndex(fields.length);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Collection List</h3>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Collection
        </Button>
      </div>

      {fields.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              className="flex-1"
              variant="outline"
              onClick={handleRemove}
            >
              <h4 className="text-sm font-medium">
                Collection {currentIndex + 1}
              </h4>
              <MinusCircle className="h-4 w-4 ml-2" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === fields.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {fields.map(
            (field, index) =>
              currentIndex === index && (
                <div className="space-y-4 rounded-lg border p-4" key={field.id}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      Collection {currentIndex + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemove}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <ImageUploader
                    control={form.control}
                    name={`collectionList.items.${index}.imageId`}
                    label="Image"
                  />

                  <FormField
                    control={form.control}
                    name={`collectionList.items.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter collection title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`collectionList.items.${index}.collectionId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a collection" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {collections.map((collection: Collection) => (
                              <SelectItem
                                key={collection._id}
                                value={collection._id}
                              >
                                {collection.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
