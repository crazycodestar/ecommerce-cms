"use client";

import { Checkbox } from "@/components/ui/checkbox";
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
import { DataModel, Id } from "@packages/backend/convex/_generated/dataModel";
import { ProductSchema } from "@/lib/validations/product";
import React from "react";
import { useFieldArray, UseFormReturn, useWatch } from "react-hook-form";
import { RichTextFormInput, Tiptap } from "../tiptap";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { CategoryPicker } from "./category-picker";
import { ProductImagePicker } from "./image-picker";
import { MetadataForm } from "./metadata-form";
import { PropertyFieldArray } from "./property-form";
import { UnitTypeform } from "./unit-type-form";
import { VariantForm } from "./variant-form";

interface ProductFormProps {
  onSubmit: (values: ProductSchema) => void;
  form: UseFormReturn<ProductSchema>;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function ProductForm({
  onSubmit,
  form,
  children,
  disabled,
}: ProductFormProps) {
  const [step, setStep] = React.useState<"basic" | "advanced">("basic");
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

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate basic information fields
    const basicFields = [
      "name",
      "price",
      "stock",
      "images",
      "isUnspecified",
      "additionalInformation",
      "unitType",
    ] as const;
    const result = await form.trigger(basicFields);

    if (result) {
      setStep("advanced");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {step === "basic" ? (
          <div className="space-y-8">
            <div className="space-y-2">
              <div>
                <h1 className="font-medium">Upload Product Images</h1>
              </div>
              <FormField
                control={form.control}
                name="images"
                render={() => (
                  <FormItem>
                    <ProductImagePicker fieldArray={imageFieldArray} />
                    <FormMessage />
                    <FormDescription>
                      Upload up to 12 images. Max size 5MB
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <div>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between">
                        <span>Product Name</span>
                        <span>
                          {160 - (values.name?.length || 0)} characters
                          remaining
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
                        <FormDescription>
                          Enter the price in Naira.
                        </FormDescription>
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
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              disabled={values.isUnspecified}
                              placeholder="Enter stock quantity"
                              {...field}
                            />
                            <UnitTypeform
                              control={form.control}
                              name="unitType"
                            />
                          </div>
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
                  <FormField
                    control={form.control}
                    name="additionalInformation"
                    render={() => (
                      <FormItem>
                        <FormLabel>Additional Information</FormLabel>
                        <FormControl>
                          <Tiptap>
                            <RichTextFormInput
                              control={form.control}
                              name="additionalInformation"
                            />
                          </Tiptap>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBasicSubmit}
                disabled={disabled}
              >
                Advanced Settings
              </Button>
              {children}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Advanced Settings</h1>
              <p className="text-muted-foreground">
                Configure additional product details and specifications.
              </p>
            </div>

            <Separator />
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
                      <h1 className="text-2xl font-bold">
                        Metadata (optional)
                      </h1>
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
                        <MetadataForm
                          form={form}
                          fieldArray={metadataFieldArray}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("basic")}
              >
                Go Back
              </Button>
              {children}
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}

export const formatProductFromForm = (
  values: ProductSchema
): Omit<
  DataModel["products"]["document"],
  "_id" | "storeId" | "_creationTime"
> => ({
  isUnspecified: values.isUnspecified,
  name: values.name,
  additionalInformation: values.additionalInformation,
  price: values.price,
  stock: values.stock,
  unitType: values.unitType as Id<"unitTypes">,
  images: values.images.map((i) => i.imageId as Id<"_storage">),
  categoryId: values.categoryId as Id<"categories">,
  properties: values.properties?.map((rp) => ({
    propertyId: rp.property.key as Id<"properties">,
    value: rp.value,
  })),
  variants: values.variants.map((v) => ({
    name: v.name,
    options: v.options.map((o) => ({
      name: o.name,
      price: o.price,
      ...(o.imageId && {
        imageId: o.imageId as Id<"_storage">,
      }),
      stock: o.stock,
      isUnspecified: o.isUnspecified,
    })),
  })),
  metadataIds: values.metadatas.map((m) => m._id as Id<"metadatas">),
});
