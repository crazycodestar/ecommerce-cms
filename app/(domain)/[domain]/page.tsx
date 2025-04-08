"use client";

import { EditorLoading } from "@/components/editor/editor-loading";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { PackageOpen } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Banner } from "@/components/editor/banner";
import { CollectionsCarousel } from "@/components/editor/collections-carousel";
import { HeroCarousel } from "@/components/editor/hero-carousel";
import { ProductCarousel } from "@/components/editor/product-carousel";
import { ShopByCategory } from "@/components/editor/shop-by-category";

export default function DomainPage() {
  // FIXME: change to GetContentByStoreSlug
  const [domain, setDomain] = React.useState<string>("");
  const subdomain = !domain || domain === "www" ? "localhost" : domain;
  const contents = useQuery(
    api.contents.getContentsByStoreSlug,
    !subdomain
      ? "skip"
      : {
          storeSlug: domain,
        }
  );

  React.useEffect(() => {
    setDomain(window.location.hostname.split(".")[0]);
  }, []);

  if (!domain || domain === "www" || domain === "localhost")
    return <EditorLoading />;

  const isPending = contents === undefined;
  if (isPending) return <EditorLoading />;
  if (contents === null) return { notFound: true };

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
          {name === "productCarousel" && (
            <div className="mx-4">
              <ProductCarousel
                title={object.title}
                description={object.description}
                collectionId={object.collectionId}
                storeSlug={domain}
              />
            </div>
          )}
          {name === "carousel" && (
            <div className="mx-4">
              <HeroCarousel imageIds={object.imageIds} />
            </div>
          )}
          {name === "collectionCarousel" && (
            <div className="mx-4">
              <CollectionsCarousel slides={object.items} />
            </div>
          )}
          {name === "categories" && (
            <div className="mx-4">
              <ShopByCategory categories={object.items} />
            </div>
          )}
          {name === "banner" && (
            <div className="mx-4">
              <Banner imageId={object.imageId} link={object.link} />
            </div>
          )}
          <div className="h-8 md:h-12 w-full" />
        </React.Fragment>
      ))}
    </div>
  );
}
