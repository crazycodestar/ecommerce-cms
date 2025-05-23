import { api } from "@packages/backend/convex/_generated/api";
import Link from "next/link";
import { Package } from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { CartButton } from "./cart-button";

export async function Nav({ storeSlug }: { storeSlug: string }) {
  const store = await fetchQuery(api.stores.getStoreBySlugPublic, {
    storeSlug,
  });

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-colors duration-200 bg-background text-foreground`}
    >
      <nav className="container mx-auto px-4 md:px-8 py-2">
        <div className="flex items-center justify-between py-6">
          {/* Logo */}
          <div className="flex gap-2">
            <Link
              href="/"
              className="font-light text-xl uppercase tracking-wider"
            >
              {store?.name}
            </Link>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center gap-4 relative ml-4">
            <Link
              className="flex gap-1 sm:py-1 sm:px-3 items-center text-sm"
              href="/order"
              aria-label="Order Lookup"
            >
              <Package className="size-5 sm:size-4" />
              <span className="hidden sm:inline">Track Order</span>
            </Link>
            <CartButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
