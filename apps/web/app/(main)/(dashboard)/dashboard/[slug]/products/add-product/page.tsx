"use client";

import {
  formatProductFromForm,
  ProductForm,
} from "@/components/form/product-form";
import { type ProductSchema, productSchema } from "@/lib/validations/product";
import { Button } from "@/components/ui/button";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { showErrorToast } from "@/lib/handle-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

export default function ProductsPage() {
  const { slug } = useParams<{ slug: Id<"stores"> }>();
  const store = useQuery(api.stores.getStore, { slug });
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const createProduct = useMutation(api.products.createProduct);
  const defaultUnitType = useQuery(api.products.getDefaultUnitType);

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 10,
      isUnspecified: false,
    },
  });

  useEffect(() => {
    if (defaultUnitType) {
      form.setValue("unitType", defaultUnitType._id);
    }
  }, [defaultUnitType, form]);

  function handleSubmit(values: z.infer<typeof productSchema>) {
    startTransition(async () => {
      try {
        if (!store) throw new Error("No store");
        console.log("this store executes");
        await createProduct({
          storeId: store._id,
          ...formatProductFromForm(values),
        });

        toast.success("Product Created Successfully");
        router.push(`/dashboard/${slug}/products`);
      } catch (err) {
        showErrorToast(err);
      } finally {
        form.reset();
      }
    });
  }

  return (
    <>
      <div className="mx-auto max-w-2xl w-full py-6">
        <ProductForm disabled={isPending} form={form} onSubmit={handleSubmit}>
          <Button disabled={isPending}>
            {isPending && <Loader className="mr-2 size-4 animate-spin" />}
            Create Product
          </Button>
        </ProductForm>
      </div>
    </>
  );
}
