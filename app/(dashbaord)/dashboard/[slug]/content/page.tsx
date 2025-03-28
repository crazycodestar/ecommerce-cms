"use client";

import { Browser } from "./_components/browser";
import { CollectionsCarousel } from "./_components/collections-carousel";
import { EditTrigger } from "./_components/edit-trigger";
import { HeroCarousel } from "./_components/hero-carousel";
import { InstagramCarousel } from "./_components/instagram-carousel";
import { ProductCarousel } from "./_components/product-carousel";
import { ShopByCategory } from "./_components/shop-by-category";

export default function ContentPage() {
  return (
    <div className="container mx-auto pt-8">
      <Browser>
        <div className="mx-4">
          <EditTrigger name="Hero">
            <HeroCarousel />
          </EditTrigger>
        </div>
        <div className="h-8 w-full" />
        <div className="mx-4">
          <ProductCarousel
            title="Trending Products"
            description="The most-viewed items by shoppers in your area"
          />
        </div>
        <div className="h-8 w-full" />

        <div className="mx-4">
          <EditTrigger name="Instagram">
            <InstagramCarousel
              title="Currently Loving"
              description="Explore favorite looks from Instagram. Tag @Nordstrom to show us your finds."
            />
          </EditTrigger>
        </div>
        <div className="h-8 w-full" />
        <div className="mx-4">
          <EditTrigger name="Category">
            <ShopByCategory title="shop by category" />
          </EditTrigger>
        </div>
        <div className="h-8 w-full" />
        <div className="mx-4">
          <EditTrigger name="Category">
            <CollectionsCarousel />
          </EditTrigger>
        </div>
        <div className="h-8 w-full" />
      </Browser>
    </div>
  );
}
