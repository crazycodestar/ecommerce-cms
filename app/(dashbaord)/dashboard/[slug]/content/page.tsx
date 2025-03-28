"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { Browser } from "./_components/browser";
import { TemplateNavBar } from "./_components/template-nav-bar";
import { HeroCarousel } from "./_components/hero-carousel";
import { ProductCarousel } from "./_components/product-carousel";
import { InstagramCarousel } from "./_components/instagram-carousel";
import { ShopByCategory } from "./_components/shop-by-category";
import { CollectionsCarousel } from "./_components/collections-carousel";

export default function ContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const store = useQuery(api.stores.getStore, { slug });
  return (
    <div className="container mx-auto pt-8">
      <Browser>
        <HeroCarousel />
        <div className="h-8 w-full" />
        <ProductCarousel
          title="Trending Products"
          description="The most-viewed items by shoppers in your area"
        />
        <div className="h-8 w-full" />
        <InstagramCarousel
          title="Currently Loving"
          description="Explore favorite looks from Instagram. Tag @Nordstrom to show us your finds."
        />
        <div className="h-8 w-full" />
        <ShopByCategory title="shop by category" />
        <div className="h-8 w-full" />
        <CollectionsCarousel />
      </Browser>
    </div>
  );
}
