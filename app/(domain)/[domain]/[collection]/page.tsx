"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Filter } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";
import { useStoreSlug } from "@/lib/hooks/use-store-slug";
import { Filters, useFilter } from "../../_components/filters";
import { Id } from "@/convex/_generated/dataModel";
import { collectionsAPI } from "@/app/api";
import {
  getCollectionBySlugAndStoreSlugResponseSchema,
  getProductsByCollectionSlugAndStoreSlugResponseSchema,
} from "@/app/api/returnTypes";
import { z } from "zod";
import Link from "next/link";

type CollectionData = z.infer<
  typeof getCollectionBySlugAndStoreSlugResponseSchema
>;

type PropertiesData = {
  _id: string;
  storeId: string;
  name: string;
  type: "string" | "number" | "array";
  categoryId: string;
  options?: string[] | undefined;
};

type ProductData = z.infer<
  typeof getProductsByCollectionSlugAndStoreSlugResponseSchema
>[number];

export default function CollectionPage() {
  const { storeSlug } = useStoreSlug();
  const { collection: collectionSlug } = useParams<{
    domain: string;
    collection: string;
  }>();

  const [properties, setProperties] = React.useState<PropertiesData[]>([]);
  const [collection, setCollection] = React.useState<CollectionData | null>(
    null
  );
  const [products, setProducts] = React.useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const { handleTogglePropertyFilter, isChecked, filterByPropertyId } =
    // @ts-expect-error type Id is disregarded in the API response
    useFilter(properties);
  const filterByPropertyIdEntries = Object.entries(filterByPropertyId);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!storeSlug || !collectionSlug) return;

      setIsLoading(true);
      try {
        const [propertiesData, collectionData] = await Promise.all([
          collectionsAPI.getFilters(storeSlug),
          collectionsAPI.getCollectionBySlugAndStoreSlug(
            storeSlug,
            collectionSlug
          ),
        ]);

        setProperties(propertiesData);
        setCollection(collectionData);
      } catch (error) {
        console.error("Failed to fetch collection data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storeSlug, collectionSlug]);

  React.useEffect(() => {
    const fetchProducts = async () => {
      if (!storeSlug || !collectionSlug) return;

      const getProperties = () => {
        const shouldCall = filterByPropertyIdEntries?.some(
          (p) => p[1].length > 0
        );
        if (!shouldCall) return;
        return filterByPropertyIdEntries?.map(([key, value]) => ({
          key: key as Id<"properties">,
          value,
        }));
      };

      try {
        const data =
          await collectionsAPI.getProductsByCollectionSlugAndStoreSlug(
            storeSlug,
            collectionSlug,
            getProperties()
          );
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [storeSlug, collectionSlug, filterByPropertyId]);

  const bottomRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white">
      <div className="md:mx-8 py-4">
        {/* Page Title */}
        <div className="mb-4">
          {isLoading ? (
            <Skeleton className="w-[200px] h-9" />
          ) : (
            <h1 className="text-2xl font-medium">{collection?.name}</h1>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="lg:w-64">
            <div className="sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4" />
                <h2 className="text-sm font-medium">Filters</h2>
              </div>
              <Filters
                // @ts-expect-error type Id is disregarded in the API response
                properties={properties}
                isChecked={isChecked}
                onTogglePropertyFilter={handleTogglePropertyFilter}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isLoading
                ? Array.from({ length: 20 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-full max-w-full flex flex-col gap-2"
                    >
                      <Skeleton className="w-full aspect-[3/4]" />
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-[70px] rounded-xs" />
                        <Skeleton className="h-4 w-[140px] rounded-xs" />
                      </div>
                    </div>
                  ))
                : products?.map((product) => (
                    <Link
                      key={product._id}
                      href={`/prd/${product._id}`}
                      className="rounded-xl h-full max-w-full flex flex-col gap-2"
                    >
                      <div className="aspect-[3/4] bg-gray-100 relative">
                        <Image
                          src={
                            product.mainImage ??
                            "/placeholder.svg?height=600&width=450&text=Front"
                          }
                          alt={product.name}
                          fill
                          className="object-cover size-full"
                        />
                      </div>

                      <div>
                        <h3>{product.name}</h3>
                        <p className="font-bold">
                          {product.price.toLocaleString("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          })}
                        </p>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
