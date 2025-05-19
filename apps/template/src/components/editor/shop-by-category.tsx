"use client";

import { ContentImage } from "../content-image";
import { Link } from "@tanstack/react-router";

export interface GalleryProps {
  categories: {
    imageId: string;
    title: string;
    categoryId: string;
  }[];
}

export const ShopByCategory = ({ categories }: GalleryProps) => {
  return (
    <section className="pt-10 border-t-2 border-border">
      <div className="flex flex-col items-center mb-12">
        <h3 className="text-2xl font-normal text-center uppercase">
          Categories
        </h3>
        <p className="text-md text-center text-foreground/80">
          Shop from the categories we offer
        </p>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <div key={index}>
              <ContentImage
                imageId={category.imageId}
                alt={category.title}
                width={800}
                height={800}
                className="aspect-square"
              />
              <Link
                to="/browse/$category"
                params={{ category: category.categoryId }}
              >
                <h3 className="text-center text-lg font-normal mt-2">
                  {category.title}
                </h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
