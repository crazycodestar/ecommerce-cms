"use client";

import { Id } from "@packages/backend/convex/_generated/dataModel";
import { ContentImage } from "./content-image";
import Link from "next/link";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";

export interface GalleryProps {
    items: {
        imageId: Id<"_storage">;
        title: string;
        collectionId: Id<"collections">;
    }[];
}

export const CategoriesComponent = ({ items }: GalleryProps) => {
    return (
        <section className="pt-10 container mx-auto px-2 my-12">
            <div className="flex flex-col items-center mb-12">
                <h3 className="text-2xl font-bold text-center uppercase">Categories</h3>
                <p className="text-md text-center text-foreground/80">
                    Shop from the categories we offer
                </p>
            </div>
            <div className="w-full">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {items.map((item) => (
                        <CategoryItem key={item.collectionId} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const CategoryItem = ({ item }: { item: { imageId: Id<"_storage">, title: string, collectionId: Id<"collections"> } }) => {
    console.log(item);
    const content = useQuery(api.products.getContentById, {
        id: item.collectionId,
    });


    return (
        <div>
            <ContentImage
                imageId={item.imageId}
                alt={item.title}
                width={800}
                height={800}
                className="aspect-square"
            />
            <Link href={`/${content?.slug}`}>
                <h3 className="text-center text-lg font-semibold mt-2">
                    {item.title}
                </h3>
            </Link>
        </div>

    )
}