"use client";

import useCartStore from "@/hooks/use-cart-store";
import { api } from "@packages/backend/convex/_generated/api";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Package, ShoppingBag } from "lucide-react";

export function Nav() {
  const store = useQuery(api.stores.getStoreBySlugPublic, {
    storeSlug: import.meta.env.VITE_STORE_SLUG,
  });

  const items = useCartStore((state) => state.items);

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-colors duration-200 bg-background text-foreground`}
    >
      <nav className="container mx-auto px-4 md:px-8 py-2">
        <div className="flex items-center justify-between py-6">
          {/* Logo */}
          <div className="flex gap-2">
            <Link
              to="/"
              className="font-light text-xl uppercase tracking-wider"
            >
              {store?.name}
            </Link>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-4 relative ml-4">
            <Link
              className="flex gap-1 sm:py-1 sm:px-3 items-center text-sm"
              to="/order"
              aria-label="Order Lookup"
            >
              <Package className="size-5 sm:size-4" />
              <span className="hidden sm:inline">Track Order</span>
            </Link>
            <Link to="/cart" aria-label="Shopping Bag">
              <ShoppingBag className="h-5 w-5" />
              {items.length === 0 ? null : (
                <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 flex justify-center items-center text-xs size-4  bg-primary text-primary-foreground rounded-full">
                  {items.length}
                </div>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
