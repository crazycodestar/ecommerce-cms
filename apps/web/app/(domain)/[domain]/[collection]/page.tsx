import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@packages/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Filter } from "lucide-react";
import Image from "next/image";
import { Filters } from "../../_components/filters-v2";

export default async function CollectionPage({ params }: { params: Promise<{ domain: string, collection: string }> }) {
  const { domain: storeSlug, collection: collectionSlug } = await params;

  const collection = await fetchQuery(
    api.collections.getCollectionOrCategoryBySlugAndStoreSlug,
    {
      storeSlug,
      slug: collectionSlug,
    }
  );

  const { page: products } = await fetchQuery(api.products.getProductsBySlug, {
    storeSlug,
    slug: collectionSlug,
    paginationOpts: {
      cursor: null,
      numItems: 10,
    },
  });

  const isPending = products === undefined;

  return (
    <div className="min-h-screen bg-white">
      <div className="container md:mx-auto mx-8 py-4">
        {/* Page Title */}
        <div className="mb-4">
          {collection === undefined ? (
            <Skeleton className="w-[200px] h-9" />
          ) : (
            <h1 className="text-2xl font-medium">{collection?.name}</h1>
          )}
          {/* TODO: add collection size */}
          {/* <p className="text-sm text-gray-600">{dresses.length} items</p> */}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-4">
              <div className="hidden md:block">
                <Filters storeSlug={storeSlug} slug={collectionSlug} />
              </div>
              {/* Mobile Filter Button */}
              <div className="md:hidden">
                <button className="w-full flex items-center justify-center gap-2 border rounded-full py-2 px-4">
                  <Filter className="h-4 w-4" />
                  <span>Filter & Sort</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isPending && (
                <>
                  {Array.from({ length: 20 }).map((_, index) => (
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
                  ))}
                </>
              )}
              {products?.map(
                (product) =>
                  product && (
                    <a
                      key={product._id}
                      href={`/prd/${product._id}`}
                      className="rounded-xl"
                    >
                      <div className="h-full max-w-full flex flex-col gap-2">
                        <Image
                          src={
                            product.imageUrls[0] ??
                            "/placeholder.svg?height=400&width=300"
                          }
                          width={300}
                          height={400}
                          alt={product.name}
                          className="w-full aspect-[3/4] object-cover object-center bg-muted"
                        />
                        <div>
                          <h3>{product.name}</h3>
                          <p className="font-bold">
                            {product.price.toLocaleString("en-NG", {
                              style: "currency",
                              currency: "NGN",
                            })}
                          </p>
                        </div>
                      </div>
                    </a>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
