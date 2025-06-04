import { BannerSchema, CarouselSchema, CategoriesSchema, CollectionCarouselSchema, ProductCarouselSchema, useEditor } from "@/hooks/use-editor";
import { PackageOpen } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import { BannerComponent } from "./_components/banner-component";
import { CarouselComponent } from "./_components/carousel";
import { CategoriesComponent } from "./_components/categories-component";
import { CollectionCarouselComponent } from "./_components/collection-carousel-component";
import { EmptyState } from "./_components/empty-state";
import { ProductCarouselComponent } from "./_components/product-carousel";

export const ContentConsumer = () => {
    const { content } = useEditor()

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
                    {type === "productCarousel" && <ProductCarouselWrapper content={content} />}
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
        <CarouselComponent {...content} />
    )
}

export const ProductCarouselWrapper = ({ content }: { content: ProductCarouselSchema["content"] }) => {
    const { slug } = useParams<{ slug: string }>()
    const isMissing = Object.values(content).some(value => !value)
    if (isMissing) return <EmptyState />

    return (
        <ProductCarouselComponent {...content} storeSlug={slug} />
    )
}

export const BannerWrapper = ({ content }: { content: BannerSchema["content"] }) => {
    const isMissing = Object.values(content).some(value => !value)
    if (isMissing) return <EmptyState />;

    return (
        <BannerComponent {...content} />
    )
}

export const CategoriesWrapper = ({ content }: { content: CategoriesSchema["content"] }) => {
    if (!content?.items?.length) return <EmptyState />;

    return (
        <CategoriesComponent {...content} />
    )
}

export const CollectionCarouselWrapper = ({ content }: { content: CollectionCarouselSchema["content"] }) => {
    if (!content?.items?.length) return <EmptyState />;

    return (
        <CollectionCarouselComponent {...content} />
    )
}