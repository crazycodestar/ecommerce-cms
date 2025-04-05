"use client";

import useCartStore from "@/hooks/use-cart-store";
import { cn } from "@/lib/utils";
import { Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

export function Nav() {
  const items = useCartStore((state) => state.items);
  return (
    <header>
      <div className="mx-4 py-2">
        <div className="flex items-center justify-between py-6 border-b">
          {/* Logo */}
          <Link href="/" className="font-medium text-3xl">
            PURPLEVENTURES
          </Link>

          {/* Search */}
          <div className="hidden md:flex items-center border border-black px-4 py-3 flex-1 max-w-1/2 mx-4 mr-auto">
            <Search className="size-6 text-foreground/80" />
            <input
              type="text"
              placeholder="Search for products or brands"
              className="w-full outline-none px-2 text-sm"
            />
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-4 relative">
            <Link href="/cart" aria-label="Shopping Bag">
              <ShoppingBag className="h-5 w-5" />
              {items.length === 0 ? null : (
                <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 flex justify-center items-center text-xs size-4 rounded-full bg-primary text-primary-foreground">
                  {items.length}
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center justify-around text-sm py-5 px-8 overflow-x-auto">
          {[
            { title: "Sale", link: "/sale" },
            { title: "Women", link: "/women" },
            { title: "Men", link: "/men" },
            { title: "Designer", link: "/designer" },
            { title: "Beauty", link: "/beauty" },
            { title: "Kids", link: "/kids" },
            { title: "Home", link: "/home" },
            { title: "Activewear", link: "/activewear" },
            { title: "Gifts", link: "/gifts" },
            { title: "Luxury", link: "/luxury" },
          ].map((item, index) => (
            <Link
              key={item.link}
              href={item.link}
              className={cn(
                "px-3 py-1 whitespace-nowrap font-medium",
                !index && "text-red-500"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
