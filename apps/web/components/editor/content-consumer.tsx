"use client";

import {
  BannerSchema,
  CarouselSchema,
  CategoriesSchema,
  CollectionCarouselSchema,
  Content,
  ProductCarouselSchema,
} from "@/hooks/use-editor";
import type { Size } from "@/hooks/use-view";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { BannerComponent } from "./banner-component";
import { CarouselComponent } from "./carousel";
import { CategoriesComponent } from "./categories-component";
import { CollectionCarouselComponent } from "./collection-carousel-component";
import { EmptyState } from "./empty-state";
import { ProductCarouselComponent } from "./product-carousel";

export const ContentConsumer = React.forwardRef<
  HTMLDivElement,
  {
    content: Content[];
    slug: string;
    view: Size;
    width: number | null;
    setWidth: (width: number) => void;
  }
>(({ content, slug, view, width, setWidth }, ref) => {
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    if (containerRef.current) {
      startWidthRef.current = containerRef.current.offsetWidth;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(
        320,
        Math.min(1200, startWidthRef.current + deltaX)
      );
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div ref={ref} className="h-full w-full">
      <div
        ref={containerRef}
        className={cn("relative h-full mx-auto")}
        style={{ width: `${width}px`, maxWidth: "100%" }}
      >
        <iframe
          key={content.length}
          id="editor-iframe"
          src={window.location.href}
          className={cn(
            "h-full w-full border-0",
            isResizing && "pointer-events-none"
          )}
          title={"Temp preview of the content"}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
        {/* Resize handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-gray-300 cursor-col-resize flex items-center justify-center group"
          onMouseDown={handleMouseDown}
          style={{ transform: "translateX(50%)" }}
        >
          <div className="py-1 bg-gray-300 group-hover:bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
});

export const CarouselWrapper = ({
  content,
}: {
  content: CarouselSchema["content"];
}) => {
  if (!content?.items?.length) return <EmptyState />;

  return (
    // @ts-expect-error - TODO: fix this
    <CarouselComponent {...content} />
  );
};

export const ProductCarouselWrapper = ({
  content,
  slug,
}: {
  content: ProductCarouselSchema["content"];
  slug: string;
}) => {
  const isMissing = Object.values(content).some((value) => !value);
  if (isMissing) return <EmptyState />;

  return (
    // @ts-expect-error - TODO: fix this
    <ProductCarouselComponent {...content} storeSlug={slug} />
  );
};

export const BannerWrapper = ({
  content,
}: {
  content: BannerSchema["content"];
}) => {
  const isMissing = Object.values(content).some((value) => !value);
  if (isMissing) return <EmptyState />;

  return (
    // @ts-expect-error - TODO: fix this
    <BannerComponent {...content} />
  );
};

export const CategoriesWrapper = ({
  content,
}: {
  content: CategoriesSchema["content"];
}) => {
  if (!content?.items?.length) return <EmptyState />;

  return (
    // @ts-expect-error - TODO: fix this
    <CategoriesComponent {...content} />
  );
};

export const CollectionCarouselWrapper = ({
  content,
}: {
  content: CollectionCarouselSchema["content"];
}) => {
  if (!content?.items?.length) return <EmptyState />;

  return (
    // @ts-expect-error - TODO: fix this
    <CollectionCarouselComponent {...content} />
  );
};
