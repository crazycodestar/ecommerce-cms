"use client";

import { BannerSchema, CarouselSchema, CategoriesSchema, CollectionCarouselSchema, Content, ProductCarouselSchema } from "@/hooks/use-editor";
import { PackageOpen } from "lucide-react";
import React from "react";
import { BannerComponent } from "./banner-component";
import { CarouselComponent } from "./carousel";
import { CategoriesComponent } from "./categories-component";
import { CollectionCarouselComponent } from "./collection-carousel-component";
import { EmptyState } from "./empty-state";
import { ProductCarouselComponent } from "./product-carousel";

export const ContentConsumer = ({ content, slug }: { content: Content[], slug: string }) => {
    if (!content.length) return <div className="flex flex-col items-center justify-center h-full">
        <PackageOpen className="size-10 text-muted-foreground" />
        <h1 className="text-xl font-bold">No Content</h1>
        <p className="text-sm text-muted-foreground">Add content to the page to get started</p>
    </div>

    return (
        <>
            {content.map(({ content: { type, content } }, index) => (
                <React.Fragment key={index}>
                    {type === "carousel" && <CarouselWrapper content={content} />}
                    {type === "productCarousel" && <ProductCarouselWrapper content={content} slug={slug} />}
                    {type === "banner" && <BannerWrapper content={content} />}
                    {type === "categories" && <CategoriesWrapper content={content} />}
                    {type === "collectionCarousel" && <CollectionCarouselWrapper content={content} />}
                </React.Fragment>
            ))}
        </>
    )

}

export const CarouselWrapper = ({ content }: { content: CarouselSchema["content"] }) => {
    if (!content?.items?.length) return <EmptyState />;

    return (
        // @ts-expect-error - TODO: fix this
        <CarouselComponent {...content} />
    )
}

export const ProductCarouselWrapper = ({ content, slug }: { content: ProductCarouselSchema["content"], slug: string }) => {
    const isMissing = Object.values(content).some(value => !value)
    if (isMissing) return <EmptyState />

    return (
        // @ts-expect-error - TODO: fix this
        <ProductCarouselComponent {...content} storeSlug={slug} />
    )
}

export const BannerWrapper = ({ content }: { content: BannerSchema["content"] }) => {
    const isMissing = Object.values(content).some(value => !value)
    if (isMissing) return <EmptyState />;

    return (
        // @ts-expect-error - TODO: fix this
        <BannerComponent {...content} />
    )
}

export const CategoriesWrapper = ({ content }: { content: CategoriesSchema["content"] }) => {
    if (!content?.items?.length) return <EmptyState />;

    return (
        // @ts-expect-error - TODO: fix this
        <CategoriesComponent {...content} />
    )
}

export const CollectionCarouselWrapper = ({ content }: { content: CollectionCarouselSchema["content"] }) => {
    if (!content?.items?.length) return <EmptyState />;

    return (
        // @ts-expect-error - TODO: fix this
        <CollectionCarouselComponent {...content} />
    )
}