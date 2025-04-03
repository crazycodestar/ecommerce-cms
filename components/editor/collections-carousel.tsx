"use client";

import { Button } from "@/components/ui/button";
import type React from "react";

import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ContentImage } from "../../app/(main)/(dashboard)/dashboard/[slug]/editor/_components/content-image";

export function CollectionsCarousel({ slides }: { slides: CarouselSlide[] }) {
  // Sample slides for the carousel

  return (
    <div>
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
  imageId: Id<"_storage">;
  title: string;
  description: string;
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
  transitionDuration = 500,
  transitionTimingFunction = "ease-in-out",
  className = "",
  imageContainerClassName = "",
  imageClassName = "",
  contentContainerClassName = "",
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
              <ContentImage
                imageId={slide.imageId}
                alt="image"
                className={cn(
                  "w-full aspect-square object-cover",
                  imageClassName
                )}
                height={800}
                width={800}
                priority={index === 0}
              />
            </div>

            {/* Content container (right side) */}
            <div
              className={cn(
                "w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center space-y-4",
                contentContainerClassName
              )}
            >
              <h2 className="text-3xl font-bold">{slide.title}</h2>
              <p className="text-lg">{slide.description}</p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-2">
                <Button asChild variant="link" className="px-0">
                  <Link href="#">Explore</Link>
                </Button>
              </div>
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
