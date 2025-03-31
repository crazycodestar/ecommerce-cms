"use client";

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";

export interface Gallery4Item {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

export interface Gallery4Props {
  title: string;
  description: string;
  collectionId: Id<"collections">;
}

const ProductCarousel = ({
  title,
  description,
  collectionId,
}: Gallery4Props) => {
  // TODO: move pagination into a reusable hook and add support for loadmore on intersection observer
  const { results, status, loadMore } = usePaginatedQuery(
    api.collections.getProductsByCollectionId,
    { collectionId },
    { initialNumItems: 10 }
  );
  const isLoading = status === "LoadingFirstPage";

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
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

  return (
    <section>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <p className="text-md text-foreground/80">{description}</p>
      </div>

      <div className="relative w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
              },
            },
          }}
        >
          {isLoading || results.length !== 0 ? null : (
            <div className="w-full text-center py-12">
              This collection is empty
            </div>
          )}
          {isLoading && (
            <CarouselContent>
              {Array.from({ length: 20 }).map((_, index) => (
                <CarouselItem key={index} className="max-w-[210px]">
                  <a href="#" className="rounded-xl">
                    <div className="h-full max-w-full flex flex-col gap-2">
                      <div className="w-full aspect-[3/4] object-cover object-center bg-muted" />
                      <div className="flex flex-col gap-1">
                        <div className="h-4 w-[70px] rounded-xs bg-muted" />
                        <div className="h-4 w-[140px] rounded-xs bg-muted" />
                      </div>
                    </div>
                  </a>
                </CarouselItem>
              ))}
            </CarouselContent>
          )}

          {results && (
            <CarouselContent>
              {results.map((product, index) => (
                <CarouselItem key={index} className="max-w-[210px]">
                  {!product && (
                    <a href="#" className="rounded-xl">
                      <div className="h-full max-w-full flex flex-col gap-2">
                        <div className="w-full aspect-[3/4] object-cover object-center bg-muted" />
                        <div className="flex flex-col gap-1">
                          <div className="h-4 w-[70px] rounded-xs bg-muted" />
                          <div className="h-4 w-[140px] rounded-xs bg-muted" />
                        </div>
                      </div>
                    </a>
                  )}
                  {product && (
                    <a href="#" className="rounded-xl">
                      <div className="h-full max-w-full flex flex-col gap-2">
                        <Image
                          src={
                            product.mainImage ??
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
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
          )}
        </Carousel>

        {results.length === 0 ? null : (
          <>
            <Button
              type="button"
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
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                carouselApi?.scrollNext();
              }}
              disabled={!canScrollNext}
              className="disabled:pointer-events-auto md:flex absolute h-full top-0 rounded-none hover:bg-black/50 right-0"
            >
              <ChevronRight className="size-5" />
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export { ProductCarousel };
