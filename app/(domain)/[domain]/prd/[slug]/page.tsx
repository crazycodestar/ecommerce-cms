"use client";

import { OrderForm, QuantityField } from "@/components/cart/order-form";
import { FormInput } from "@/components/form/form-input";
import { TipTapContent } from "@/components/tiptap";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Products } from "@/convex/schema";
import { useQuery } from "convex/react";
import { Star } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import OrderLayout from "../_components/order-layout";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = useQuery(api.products.getProductById, {
    id: slug as Id<"products">,
  });

  if (product === undefined) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-4 px-4 py-4">
        {/* Product Detail Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product?.imageUrls.map((image, index) => (
                <div key={index} className="aspect-[3/4] bg-gray-100 relative">
                  {/* FIXME: */}
                  <Image
                    // src="/placeholder.svg?height=200&width=150&text=Clutch"
                    src={
                      image ??
                      "/placeholder.svg?height=600&width=450&text=Front"
                    }
                    alt={`${product.name}: Image ${index + 1}`}
                    fill
                    className="object-cover size-full"
                    priority={!index}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/3">
            <div className="sticky top-4">
              <div>
                {/* <h1 className="text-sm text-gray-500 mb-1">KOMAROV</h1> */}
                <h2 className="text-xl font-medium">{product.name}</h2>
              </div>
              {/* <OrderLayout
                product={{
                  price: product.price,
                  unit: product.unit ?? "unit",
                  variants: product.variants ?? [],
                  metadatas:
                    product.metadatas?.map((m) => ({
                      name: m.metadata!.name,
                      type: m.metadata!.type,
                    })) ?? [],
                }}
              /> */}
              <div className="mb-6">
                {product.additionalInformation && (
                  <TipTapContent content={product.additionalInformation} />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-64" />
      </div>
    </div>
  );
}
