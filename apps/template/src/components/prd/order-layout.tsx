"use client";

import {
  MetadataField,
  type MetadataFieldProps,
  OrderProvider,
  orderSchema,
  type OrderSchema,
  QuantityField,
  VariantField,
} from "@/components/cart/order-form";
import useCartStore from "@/hooks/use-cart-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

export default function OrderLayout({
  product: { _id, unit, variants, metadatas, price },
}: {
  product: {
    _id: string;
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
      productId: _id,
      variants: variants.map((v) => ({
        name: v.name,
      })),
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
      })) as OrderSchema["metadatas"],
      quantity: 1,
    },
  });

  const addProduct = useCartStore((state) => state.addItem);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const onSubmit = (values: OrderSchema) => {
    setSubmitting(true);
    addProduct({
      ...(values as Omit<OrderSchema, "productId"> & {
        productId: string;
      }),
      productId: _id,
    });
    setTimeout(() => setSubmitting(false), 2000);
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
    <OrderProvider value={{ form, onSubmit }}>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="font-normal text-muted-foreground">
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
        <button
          disabled={isSubmitting}
          className="w-full cursor-pointer bg-primary text-primary-foreground py-3 font-normal mb-2"
        >
          {isSubmitting ? (
            <span className="w-full flex justify-center">
              <Check className="size-6" />
            </span>
          ) : (
            <span>Add to Bag</span>
          )}
        </button>
        {/* Possible add to wishlist */}
      </div>
    </OrderProvider>
  );
}
