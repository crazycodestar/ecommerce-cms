"use client";

import {
  formatProductFromForm,
  ProductForm,
} from "@/components/form/product-form";
import { Button } from "@/components/ui/button";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { showErrorToast } from "@/lib/handle-error";
import { type ProductSchema, productSchema } from "@/lib/validations/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditProductPage() {
  const { id, slug } = useParams<{ id: Id<"products">; slug: string }>();
  const product = useQuery(api.products.getProductById, { id });
  const store = useQuery(api.stores.getStore, { slug });

  const isLoading = product === undefined || store === undefined;
  // FIXME: Proper loading state
  if (isLoading) return <p>loading...</p>;

  const formattedProduct: ProductSchema = {
    ...product,
    images: product.images.map((i) => ({
      imageId: i,
    })),
    properties: product.properties.map((p) => ({
      property: {
        key: p.propertyId,
        type: p.property!.type,
      },
      value: p.value,
    })),
    variants: product.variants
      ? product.variants.map((v) => ({
          name: v.name,
          options: v.options.map((o) => ({
            name: o.name,
            price: o.price,
            imageId: o.imageId,
            stock: o.stock,
            isUnspecified: o.isUnspecified,
          })),
        }))
      : [],
    metadatas:
      product.metadataIds?.map((m) => ({
        _id: m,
      })) ?? [],
  };
  return (
    <>
      <div className="mx-auto max-w-2xl w-full py-10 space-y-4">
        <EditProduct
          id={id}
          storeId={store._id}
          defaultValues={formattedProduct}
        />
      </div>
    </>
  );
}

function EditProduct({
  id,
  storeId,
  defaultValues,
}: {
  id: Id<"products">;
  defaultValues: ProductSchema;
  storeId: Id<"stores">;
}) {
  const router = useRouter();
  const updateProduct = useMutation(api.products.updateProduct);
  const [isPending, startTransition] = useTransition();
  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  async function handleSubmit(values: ProductSchema) {
    startTransition(async () => {
      try {
        await updateProduct({
          productId: id,
          storeId,
          ...formatProductFromForm(values),
        });

        toast.success("Product Updated Successfully");
        return router.back();
      } catch (err) {
        showErrorToast(err);
      } finally {
        form.reset();
      }
    });
  }

  return (
    <ProductForm disabled={isPending} form={form} onSubmit={handleSubmit}>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader className="mr-2 size-4 animate-spin" />}
        Update Product
      </Button>
    </ProductForm>
  );
}
