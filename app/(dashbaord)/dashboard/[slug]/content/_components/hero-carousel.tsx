"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export const HeroCarousel = () => {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
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
    <div className="relative">
      <Carousel setApi={setCarouselApi}>
        <CarouselContent>
          {Array(3)
            .fill("")
            .map((_, index) => (
              <CarouselItem
                key={index}
                className="w-full aspect-[5/2] bg-muted flex justify-center items-center"
              >
                Image {index + 1}
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
