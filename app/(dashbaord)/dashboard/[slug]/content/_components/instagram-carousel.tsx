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

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

export interface GalleryProps {
  title?: string;
  description?: string;
}

export const InstagramCarousel = ({
  title = "Case Studies",
  description = "Discover how leading companies and developers are leveraging.",
}: GalleryProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

  return (
    <section className="pt-10 border-t-2 border-black">
      <div className="flex flex-col items-center mb-12">
        <h3 className="text-2xl font-bold text-center uppercase">{title}</h3>
        <p className="text-md text-center text-foreground/80">{description}</p>
      </div>
      <div className="w-full relative">
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
                <CarouselItem key={index} className="max-w-1/4">
                  <a href={"/#"} className="rounded-xl">
                    <div className="w-full aspect-square object-cover object-center bg-muted" />
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
