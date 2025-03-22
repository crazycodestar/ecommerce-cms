"use client";

import { ProductForm } from "@/components/form/product-form";
import { type ProductSchema, productSchema } from "@/lib/validations/product";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { showErrorToast } from "@/lib/handle-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

export default function ProductsPage() {
  const { slug } = useParams<{ slug: Id<"stores"> }>();
  const store = useQuery(api.stores.getStore, { slug });
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const createProduct = useMutation(api.products.createProduct);

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      isUnspecified: false,
      categoryId: "",
    },
  });

  function handleSubmit(values: z.infer<typeof productSchema>) {
    startTransition(async () => {
      try {
        if (!store) throw new Error("No store");
        await createProduct({
          isUnspecified: values.isUnspecified,
          name: values.name,
          price: values.price,
          stock: values.stock,
          images: values.images.map(
            (i) => i.imageId as unknown as Id<"_storage">
          ),
          storeId: store._id,
          categoryId: values.categoryId as unknown as Id<"categories">,
          properties: values.properties.map((p) => ({
            propertyId: p.property.key as unknown as Id<"properties">,
            value: p.value,
          })),
          variants: values.variants.map((v) => ({
            name: v.name,
            options: v.options.map((o) => ({
              name: o.name,
              price: o.price,
              imageId: o.imageId as unknown as Id<"_storage">,
              stock: o.stock,
              isUnspecified: o.isUnspecified,
            })),
          })),
          metadataIds: values.metadatas.map((m) => m._id as Id<"metadatas">),
        });

        toast.success("Product Created Successfully");
        router.back();
      } catch (err) {
        showErrorToast(err);
      } finally {
        form.reset();
      }
    });
  }

  return (
    <>
      <div className="mx-auto max-w-2xl w-full py-10">
        <ProductForm form={form} onSubmit={handleSubmit}>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader className="mr-2 size-4 animate-spin" />}
            Upload Product
          </Button>
        </ProductForm>
      </div>
    </>
  );
}
