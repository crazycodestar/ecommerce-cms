"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, UseFormProps, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  MetadataField,
  MetadataFieldProps,
  OrderProvider,
  orderSchema,
  OrderSchema,
  QuantityField,
  VariantField,
  VariantFieldProps,
} from "@/components/cart/order-form";

export default function OrderLayout({
  product: { unit, variants, metadatas, price },
}: {
  product: {
    unit: string;
    variants: {
      name: string;
      options: {
        image?: string | null;
        name: string;
        price: number;
      }[];
    }[];
    metadatas: MetadataFieldProps["metadatas"];
    price: number;
  };
}) {
  const form = useForm<OrderSchema>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      productId: "",
      variants: variants.map((v) => ({
        name: v.name,
      })),
      // @ts-expect-error smth
      metadatas: metadatas.map((m) => ({
        name: m.name,
        ...(m.type === "string" && {
          type: "string",
          value: "",
        }),
        ...(m.type === "number" && {
          type: "number",
          value: 0,
        }),
        ...(m.type === "image" && {
          type: "image",
          value: "",
        }),
        ...(m.type === "array" && {
          type: "array",
          value: "",
        }),
      })),
      quantity: 1,
    },
  });

  const [isPending, startTransition] = React.useTransition();
  const onSubmit = (values: OrderSchema) => {
    console.log(values);
  };

  const total =
    price +
    form.watch("variants").reduce((acc, variant) => {
      const variantSet = variants.find(
        (variantSet) => variantSet.name === variant.name
      );
      const selectedOption = variantSet?.options.find(
        (option) => option.name === variant.value
      );
      return acc + (selectedOption ? selectedOption.price : 0);
    }, 0);

  return (
    <OrderProvider value={{ form, onSubmit, isPending }}>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary-50">
            {total.toLocaleString("en-NG", {
              style: "currency",
              currency: "NGN",
            })}
          </span>
        </div>
      </div>
      <VariantField variants={variants} />
      <MetadataField metadatas={metadatas} />
      <QuantityField unit={unit} />
      <div className="mb-6 mt-4">
        <button className="w-full cursor-pointer bg-black text-white py-3 font-medium mb-2">
          Add to Bag
        </button>
        {/* Possible add to wishlist */}
      </div>
    </OrderProvider>
  );
}
