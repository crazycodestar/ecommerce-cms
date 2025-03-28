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

export interface Gallery4Item {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

export interface Gallery4Props {
  title?: string;
  description?: string;
}

const ProductCarousel = ({
  title = "Case Studies",
  description = "Discover how leading companies and developers are leveraging.",
}: Gallery4Props) => {
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
      <div className="flex flex-col gap-2 mb-6">
        <div className="h-6 w-[200px] bg-muted rounded-xs" />
        <div className="h-6 w-[400px] bg-muted rounded-xs" />
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
          <CarouselContent>
            {Array(20)
              .fill("")
              .map((_, index) => (
                <CarouselItem key={index} className="max-w-[210px]">
                  <a href={"/#"} className="rounded-xl">
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
          className="disabled:pointer-events-auto md:flex absolute h-full top-0 rounded-none hover:bg-black/50 right-0"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </section>
  );
};

export { ProductCarousel };
