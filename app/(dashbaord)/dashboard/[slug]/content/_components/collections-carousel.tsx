"use client";

import { Button } from "@/components/ui/button";
import type React from "react";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollectionsCarousel() {
  // Sample slides for the carousel
  const slides: CarouselSlide[] = [
    {
      image: {
        src: "/placeholder.svg?height=600&width=800",
        alt: "Fashion styling service",
        width: 800,
        height: 600,
      },
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Free Style Help</h2>
          <p className="text-lg">
            Whether you're looking for fashion advice, one perfect item or a
            whole wardrobe, our experts are here to help you look great—and feel
            amazing.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-2">
            <Button variant="default">Explore Styling Services</Button>
            <Button variant="outline">Book an Appointment</Button>
          </div>
        </div>
      ),
    },
    {
      image: {
        src: "/placeholder.svg?height=600&width=800",
        alt: "Seasonal collection",
        width: 800,
        height: 600,
      },
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Spring Collection 2025</h2>
          <p className="text-lg">
            Discover our latest arrivals featuring vibrant colors and
            lightweight fabrics perfect for the warmer days ahead. Refresh your
            wardrobe with our curated selection.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-2">
            <Button variant="default">Shop Collection</Button>
            <Button variant="outline">View Lookbook</Button>
          </div>
        </div>
      ),
    },
    {
      image: {
        src: "/placeholder.svg?height=600&width=800",
        alt: "Personal shopping experience",
        width: 800,
        height: 600,
      },
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Personal Shopping</h2>
          <p className="text-lg">
            Enjoy a tailored shopping experience with our personal stylists.
            They'll help you find pieces that match your style, fit perfectly,
            and complement your existing wardrobe.
          </p>
          <div className="pt-2">
            <Button variant="default">Schedule a Session</Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-4">
      <SplitCarousel
        slides={slides}
        className="bg-muted"
        imageClassName="h-full object-cover"
        imageContainerClassName="aspect-video"
      />
    </div>
  );
}

export interface CarouselSlide {
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  content: ReactNode;
}

interface SplitCarouselProps {
  slides: CarouselSlide[];
  autoSlideInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  transitionDuration?: number;
  transitionTimingFunction?: string;
  className?: string;
  imageContainerClassName?: string;
  imageClassName?: string;
  contentContainerClassName?: string;
  arrowClassName?: string;
  dotClassName?: string;
  activeDotClassName?: string;
}

function SplitCarousel({
  slides,
  autoSlideInterval = 5000,
  showArrows = true,
  showDots = true,
  transitionDuration = 500,
  transitionTimingFunction = "ease-in-out",
  className = "",
  imageContainerClassName = "",
  imageClassName = "",
  contentContainerClassName = "",
  arrowClassName = "",
  dotClassName = "",
  activeDotClassName = "",
}: SplitCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const resetAutoPlayTimer = useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }

    if (isAutoPlaying && autoSlideInterval > 0) {
      autoPlayTimeoutRef.current = setTimeout(goToNext, autoSlideInterval);
    }
  }, [isAutoPlaying, autoSlideInterval, goToNext]);

  // Handle auto-sliding
  useEffect(() => {
    resetAutoPlayTimer();

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, resetAutoPlayTimer]);

  // Pause auto-sliding when user interacts with the carousel
  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    pauseAutoPlay();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      // Minimum swipe distance
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = null;
    resumeAutoPlay();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goToNext, goToPrevious]);

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      <div
        className="flex transition-transform"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transitionDuration: `${transitionDuration}ms`,
          transitionTimingFunction,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0 flex flex-col md:flex-row"
            aria-hidden={index !== currentIndex}
          >
            {/* Image container (left side) */}
            <div className={cn("w-full md:w-1/2", imageContainerClassName)}>
              <Image
                src={slide.image.src || "/placeholder.svg"}
                alt={slide.image.alt}
                width={slide.image.width}
                height={slide.image.height}
                className={cn("w-full h-auto object-cover", imageClassName)}
                priority={index === 0}
              />
            </div>

            {/* Content container (right side) */}
            <div
              className={cn(
                "w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center",
                contentContainerClassName
              )}
            >
              {slide.content}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="disabled:pointer-events-auto md:flex absolute h-full top-0 rounded-none hover:bg-black/50"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="disabled:pointer-events-auto md:flex absolute h-full top-0 rounded-none hover:bg-black/50 right-0"
          >
            <ChevronRight className="size-5" />
          </Button>
        </>
      )}
    </div>
  );
}
