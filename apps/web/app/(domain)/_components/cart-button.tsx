"use client";

import useCartStore from "@/lib/hooks/use-cart-store";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function CartButton() {
  const items = useCartStore((state) => state.items);
  return (
    <Link href="/cart" aria-label="Shopping Bag">
      <ShoppingBag className="h-5 w-5" />
      {items.length === 0 ? null : (
        <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 flex justify-center items-center text-xs size-4  bg-primary text-primary-foreground rounded-full">
          {items.length}
        </div>
      )}
    </Link>
  );
}
