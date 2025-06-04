"use client";

import { ContentImage } from "./content-image"
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export const CarouselComponent = ({
    items,
}: {
    items: {
        imageId: Id<"_storage">;
        collectionId: Id<"collections">;
        title?: string;
        description?: string;
    }[];
}) => {
    const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    React.useEffect(() => {
        if (!carouselApi) {
            return;
        }
        const updateSelection = () => {
            setCanScrollPrev(carouselApi.canScrollPrev());
            setCanScrollNext(carouselApi.canScrollNext());
        };
        updateSelection();
        carouselApi.on("select", updateSelection);
        return () => {
            carouselApi.off("select", updateSelection);
        };
    }, [carouselApi]);

    const router = useRouter();
    const collectionSlugs = useQuery(api.contents.getCollectionSlugs, {
        collectionIds: items.map((c) => c.collectionId),
    });
    const collectionIdToSlug = React.useMemo(() => {
        const map: Record<string, string> = {};
        collectionSlugs
            ?.filter((i): i is NonNullable<typeof i> => !!i)
            .forEach((collection) => {
                map[collection._id] = collection.slug;
            });
        return map;
    }, [collectionSlugs]);

    const handleNavigate = (collectionId: string) => {
        const slug = collectionIdToSlug[collectionId];
        if (!slug) return;
        router.push(`/${slug}`);
    };

    return (
        <div className="relative">
            <Carousel setApi={setCarouselApi}>
                <CarouselContent>
                    {items.map(({ imageId, collectionId, title, description }, index) => (
                        <CarouselItem
                            key={index}
                            className="relative w-full aspect-[5/2] bg-muted flex justify-center items-center cursor-pointer"
                            onClick={() => handleNavigate(collectionId)}
                        >
                            <ContentImage
                                skeletonClassName="w-full aspect-[5/2]"
                                className="w-full aspect-[5/2] object-cover"
                                imageId={imageId}
                                width={500}
                                height={200}
                                alt="Hero Image"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black/50 via-black/30 to-transparent text-white">
                                <h3 className="text-3xl font-bold">{title}</h3>
                                <p>{description}</p>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                    carouselApi?.scrollPrev();
                }}
                disabled={!canScrollPrev}
                className="disabled:pointer-events-auto md:flex absolute h-full top-0 rounded-none hover:bg-black/50"
            >
                <ChevronLeft className="size-5" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                    carouselApi?.scrollNext();
                }}
                disabled={!canScrollNext}
                className="disabled:pointer-events-auto md:flex absolute h-full top-0 rounded-none right-0 hover:bg-black/50"
            >
                <ChevronRight className="size-5" />
            </Button>
        </div>
    );
};