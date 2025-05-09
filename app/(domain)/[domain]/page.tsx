"use client";

import { EditorLoading } from "@/components/editor/editor-loading";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { Button } from "@/components/ui/button";
import { PackageOpen } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Banner } from "@/components/editor/banner";
import { CollectionsCarousel } from "@/components/editor/collections-carousel";
import { HeroCarousel } from "@/components/editor/hero-carousel";
import { ProductCarousel } from "@/components/editor/product-carousel";
import { ShopByCategory } from "@/components/editor/shop-by-category";
import { useStoreSlug } from "@/lib/hooks/use-store-slug";
import { contentsAPI } from "@/app/api";
import { Id } from "@/convex/_generated/dataModel";
import { ContentSchema } from "@/app/api/returnTypes";

export default function DomainPage() {
  const { storeSlug } = useStoreSlug();
  const [contents, setContents] = React.useState<ContentSchema[]>([]);

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchContents = async () => {
      if (!storeSlug) return;

      try {
        const data = await contentsAPI.getContentsByStoreSlug(storeSlug);
        setContents(data);
      } catch (error) {
        console.error("Failed to fetch contents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContents();
  }, [storeSlug]);

  if (!storeSlug) return <EditorLoading />;

  if (isLoading) return <EditorLoading />;
  if (contents === null) return { notFound: true };

  // return <pre>{JSON.stringify(contents, null, 2)}</pre>;

  return (
    <div className="min-h-svh flex-1 flex flex-col md:mx-4">
      {contents.length !== 0 ? null : (
        <div className="flex flex-col items-center justify-center px-4 flex-1 w-full">
          <AnimatedGroup preset="blur-slide" className="text-center">
            <div className="p-4 mb-3 w-fit rounded-md bg-muted text-muted-foreground mx-auto">
              <PackageOpen className="size-6" />
            </div>
            <h3 className="text-xl font-bold">No content available.</h3>
            <p className="text-gray-500 mb-4">
              Start Building your page by adding new content.
            </p>
            <Button type="button" asChild>
              <Link href="/dashboard/editor">Add content</Link>
            </Button>
          </AnimatedGroup>
        </div>
      )}
      {contents.map(({ name, object }, index) => (
        <React.Fragment key={index}>
          {name === "productCarousel" &&
            object.title &&
            object.description &&
            object.collectionId && (
              <div className="mx-4">
                <ProductCarousel
                  title={object.title}
                  description={object.description}
                  // @ts-expect-error type Id is disregarded in the API response
                  collectionId={object.collectionId}
                  storeSlug={storeSlug}
                />
              </div>
            )}
          {name === "carousel" && object.content && (
            <div className="mx-4">
              {/* @ts-expect-error type Id is disregarded in the API response */}
              <HeroCarousel content={object.content} />
            </div>
          )}
          {name === "collectionCarousel" && object.items && (
            <div className="mx-4">
              {/* @ts-expect-error type Id is disregarded in the API response */}
              <CollectionsCarousel slides={object.items} />
            </div>
          )}
          {name === "categories" && object.items && (
            <div className="mx-4">
              <ShopByCategory
                // @ts-expect-error type Id is disregarded in the API response
                categories={object.items.map((item) => ({
                  imageId: item.imageId,
                  title: item.title,
                  categoryId: item.categoryId as Id<"categories">,
                }))}
              />
            </div>
          )}
          {name === "banner" && object.imageId && object.link && (
            <div className="mx-4">
              <Banner
                // @ts-expect-error type Id is disregarded in the API response
                imageId={object.imageId}
                link={object.link}
              />
            </div>
          )}
          <div className="h-8 md:h-12 w-full" />
        </React.Fragment>
      ))}
    </div>
  );
}
