"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Id } from "@/convex/_generated/dataModel";
import React from "react";
import { useFieldArray, UseFormReturn, useWatch } from "react-hook-form";
import { CategoryPicker } from "./category-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductSchema } from "@/lib/validations/product";
import { ProductImagePicker } from "./image-picker";
import { PropertyFieldArray } from "./property-form";
import { VariantForm } from "./variant-form";
import { MetadataForm } from "./metadata-form";
import { Tiptap } from "../tiptap";

interface ProductFormProps {
  onSubmit: (values: ProductSchema) => void;
  form: UseFormReturn<ProductSchema>;
  children: React.ReactNode;
}

export function ProductForm({ onSubmit, form, children }: ProductFormProps) {
  const imageFieldArray = useFieldArray({
    control: form.control,
    name: "images",
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "properties",
  });
  const values = useWatch({ control: form.control });

  const variantFieldArray = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const metadataFieldArray = useFieldArray({
    control: form.control,
    name: "metadatas",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Upload Product Images</h1>
            <p className="text-muted-foreground">
              Upload up to 12 images. Max size 5MB
            </p>
          </div>
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem>
                <ProductImagePicker fieldArray={imageFieldArray} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Product Information</h1>
            <p className="text-muted-foreground">
              Enter information about the product. Learn More
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel className="flex justify-between">
                    <span>Product Name</span>
                    <span>
                      {160 - (values.name?.length || 0)} characters remaining
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter product name"
                      onChange={(e) =>
                        onChange(e.currentTarget.value.slice(0, 160))
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed to customers.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Tiptap />
            {/* <FormField
              control={form.control}
              name="description"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel className="flex justify-between">
                    <span>Product Description</span>
                    <span>
                      {400 - (values.name?.length || 0)} characters remaining
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      onChange={(e) =>
                        onChange(e.currentTarget.value.slice(0, 400))
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Price
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter price"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Enter the price in Naira.</FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <div>
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={values.isUnspecified}
                        placeholder="Enter stock quantity"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the number of items available.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isUnspecified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Unspecified Stock</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Item Specifics</h1>
            <p className="text-muted-foreground">
              Enter the proper information to maximize your reach.
            </p>
          </div>
          <div>
            <FormField
              control={form.control}
              name="categoryId"
              render={() => (
                <FormItem>
                  <CategoryPicker
                    canUpdate={!values.properties?.find((p) => !!p.value)}
                    control={form.control}
                    name="categoryId"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {values.categoryId && (
              <div className="py-4">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold">Required</h1>
                  <p className="text-muted-foreground">
                    Buyers need these details to find you.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="properties"
                  render={() => (
                    <FormItem>
                      <PropertyFieldArray
                        control={form.control}
                        name="properties"
                        fieldArray={fieldArray}
                        categoryId={
                          values.categoryId as unknown as Id<"categories">
                        }
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <div className="py-4">
              <div className="mb-4">
                <h1 className="text-2xl font-bold">Variants (optional)</h1>
                <p className="text-muted-foreground">
                  Add different options for the same product.
                </p>
              </div>
              <FormField
                control={form.control}
                name="variants"
                render={() => (
                  <FormItem>
                    <VariantForm
                      control={form.control}
                      name="variants"
                      fieldArray={variantFieldArray}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="py-4">
              <div className="mb-4">
                <div>
                  <h1 className="text-2xl font-bold">Metadata (optional)</h1>
                  <p className="text-muted-foreground">
                    Add Inputs you&apos;d like to receive from your users
                  </p>
                </div>
              </div>
              <FormField
                control={form.control}
                name="variants"
                render={() => (
                  <FormItem>
                    <MetadataForm form={form} fieldArray={metadataFieldArray} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
        {children}
      </form>
    </Form>
  );
}
