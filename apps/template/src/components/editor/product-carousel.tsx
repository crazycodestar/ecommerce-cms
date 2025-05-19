"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { collectionsAPI } from "@/api";
import type { GetProductsByCollectionSlugAndStoreSlugResponse } from "@/api/returnTypes";

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
  collectionSlug: string;
  storeSlug: string;
}

const ProductCarousel = ({
  title,
  description,
  collectionSlug,
  storeSlug,
}: Gallery4Props) => {
  const [results, setResults] =
    useState<GetProductsByCollectionSlugAndStoreSlugResponse>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data =
          await collectionsAPI.getProductsByCollectionSlugAndStoreSlug(
            storeSlug,
            collectionSlug
          );
        setResults(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [collectionSlug, storeSlug]);

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
        <h3 className="text-2xl font-normal">{title}</h3>
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
                  <a href="#" className="">
                    <div className="h-full max-w-full flex flex-col gap-2">
                      <div className="w-full aspect-[3/4] object-cover object-center bg-muted" />
                      <div className="flex flex-col gap-1">
                        <div className="h-4 w-[70px]  bg-muted" />
                        <div className="h-4 w-[140px]  bg-muted" />
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
                    <a href="#" className="">
                      <div className="h-full max-w-full flex flex-col gap-2">
                        <div className="w-full aspect-[3/4] object-cover object-center bg-muted" />
                        <div className="flex flex-col gap-1">
                          <div className="h-4 w-[70px]  bg-muted" />
                          <div className="h-4 w-[140px]  bg-muted" />
                        </div>
                      </div>
                    </a>
                  )}
                  {product && (
                    <a href={`/prd/${product._id}`} className="">
                      <div className="h-full max-w-full flex flex-col gap-2">
                        <img
                          src={product.mainImage ?? "/placeholder.svg"}
                          alt={product.name}
                          className="w-full aspect-[3/4] object-cover object-center bg-muted"
                        />
                        <div>
                          <h3>{product.name}</h3>
                          <p className="font-normal">
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
              className="disabled:pointer-events-auto md:flex absolute h-full top-0 rounded-none hover:bg-accent/50"
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
              className="disabled:pointer-events-auto md:flex absolute h-full top-0 rounded-none hover:bg-accent/50 right-0"
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
