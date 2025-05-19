import { collectionsAPI } from "@/api";
import {
  getCollectionBySlugAndStoreSlugResponseSchema,
  getProductsByCollectionSlugAndStoreSlugResponseSchema,
} from "@/api/returnTypes";
import { Filters, useFilter } from "@/components/filters";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreSlug } from "@/hooks/use-store-slug";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/$collection/")({
  component: RouteComponent,
});

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

function RouteComponent() {
  const { storeSlug } = useStoreSlug();
  const { collection: collectionSlug } = Route.useParams();

  const [properties, setProperties] = useState<PropertiesData[]>([]);
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { handleTogglePropertyFilter, isChecked, filterByPropertyId } =
    useFilter(properties);
  const filterByPropertyIdEntries = Object.entries(filterByPropertyId);

  useEffect(() => {
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

  useEffect(() => {
    const fetchProducts = async () => {
      if (!storeSlug || !collectionSlug) return;

      const getProperties = () => {
        const shouldCall = filterByPropertyIdEntries?.some(
          (p) => p[1].length > 0
        );
        if (!shouldCall) return;
        return filterByPropertyIdEntries?.reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, unknown>);
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

  return (
    <div className="container mx-4 md:mx-auto min-h-screen bg-white">
      <div className="md:mx-8 py-4">
        {/* Page Title */}
        <div className="mb-4">
          {isLoading ? (
            <Skeleton className="w-[200px] h-9" />
          ) : (
            <h1 className="text-2xl font-normal">{collection?.name}</h1>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="lg:w-64">
            <div className="sticky top-28">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4" />
                <h2 className="text-sm font-normal">Filters</h2>
              </div>
              <Filters
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
                        <Skeleton className="h-4 w-[70px] " />
                        <Skeleton className="h-4 w-[140px] " />
                      </div>
                    </div>
                  ))
                : products?.map((product) => (
                    <Link
                      key={product._id}
                      to={"/prd/$slug"}
                      params={{
                        slug: product._id,
                      }}
                      className=" h-full max-w-full flex flex-col gap-2"
                    >
                      <div className="aspect-[3/4] bg-gray-100 relative">
                        <img
                          src={
                            product.mainImage ??
                            "/placeholder.svg?height=600&width=450&text=Front"
                          }
                          alt={product.name}
                          className="object-cover h-full aspect-[3/4]"
                        />
                      </div>

                      <div>
                        <h3>{product.name}</h3>
                        <p className="font-normal">
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
