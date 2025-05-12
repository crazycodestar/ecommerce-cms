"use client";

import { TipTapContent } from "@/components/tiptap";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { useParams } from "next/navigation";
import OrderLayout from "../_components/order-layout";
import { productsAPI } from "@/app/api";
import { useEffect, useState } from "react";
import { richProductSchema } from "@/app/api/returnTypes";
import { z } from "zod";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<z.infer<
    typeof richProductSchema
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsAPI.getProductById(slug);
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (isLoading) return null;

  // return <pre>{JSON.stringify(product, null, 2)}</pre>;

  return (
    <div className="min-h-screen bg-white">
      <div className="md:mx-4 px-4 py-4">
        {/* Product Detail Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product?.imageUrls.map((image: string, index: number) => (
                <div key={index} className="aspect-[3/4] bg-gray-100 relative">
                  <Image
                    src={
                      image ??
                      "/placeholder.svg?height=600&width=450&text=Front"
                    }
                    alt={`${product!.name}: Image ${index + 1}`}
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
                <h2 className="text-xl font-medium">{product!.name}</h2>
              </div>
              <OrderLayout
                product={{
                  // @ts-expect-error smth
                  _id: product!._id,
                  price: product!.price,
                  unit: product!.unit ?? "unit",
                  variants: product!.variants ?? [],
                  metadatas:
                    product!.metadatas?.map((m) => ({
                      name: m.metadata!.name,
                      type: m.metadata!.type,
                    })) ?? [],
                }}
              />
              <div className="mb-6">
                {product!.additionalInformation && (
                  <TipTapContent
                    content={product!.additionalInformation ?? ""}
                  />
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
