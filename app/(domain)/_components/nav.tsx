"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import useCartStore from "@/lib/hooks/use-cart-store";
import { useStoreSlug } from "@/lib/hooks/use-store-slug";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Menu, Package, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";

export function Nav() {
  const [activeId, setActiveId] = React.useState<Id<"categories"> | null>(null);
  const items = useCartStore((state) => state.items);
  const { storeSlug } = useStoreSlug();
  const categories = useQuery(
    api.collections.getCategoriesByStoreSlug,
    !storeSlug
      ? "skip"
      : {
          storeSlug,
        }
  );

  const isPending = categories === undefined;
  return (
    <header>
      <div className="mx-4 md:mx-8 py-2">
        <div className="flex items-center justify-between py-6 border-b">
          {/* Logo */}
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="md:hidden">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full md:hidden">
                <SheetHeader className="flex items-center justify-between">
                  <SheetTitle>
                    <Link href="/" className="font-medium text-xl">
                      PURPLEVENTURES
                    </Link>
                  </SheetTitle>
                  <SheetDescription>Purpleventures</SheetDescription>
                </SheetHeader>
                <div>
                  {categories?.slice(0, 8).map(({ name, _id }, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="flex items-center justify-between px-3 py-1">
                        <SheetClose key={index} asChild>
                          <Link
                            href={`/browse/${_id}`}
                            className={cn(
                              "px-3 py-1 whitespace-nowrap font-medium",
                              !index && "text-red-500"
                            )}
                          >
                            {name}
                          </Link>
                        </SheetClose>
                        <Button
                          onClick={() => setActiveId(_id)}
                          variant="ghost"
                          size="icon"
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                      {activeId === _id && (
                        <SubCategoryMenuMobile parentId={_id} />
                      )}
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="font-medium text-3xl">
              PURPLEVENTURES
            </Link>
          </div>

          {/* Search */}
          {/* <div className="hidden md:flex items-center border border-black px-4 py-3 flex-1 max-w-1/2 mx-4 mr-auto">
            <Search className="size-6 text-foreground/80" />
            <input
              type="text"
              placeholder="Search for products or brands"
              className="w-full outline-none px-2 text-sm"
            />
          </div> */}

          {/* Navigation Icons */}
          <div className="flex items-center gap-4 relative ml-4">
            <Link
              className="flex gap-1 bg-muted rounded-full sm:py-1 sm:px-3 items-center text-sm"
              href="/order"
              aria-label="Order Lookup"
            >
              <Package className="size-5 sm:size-4" />
              <span className="hidden sm:inline">Track Order</span>
            </Link>
            <Link href="/cart" aria-label="Shopping Bag">
              <ShoppingBag className="h-5 w-5" />
              {items.length === 0 ? null : (
                <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 flex justify-center items-center text-xs size-4 rounded-full bg-primary text-primary-foreground">
                  {items.length}
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center justify-around text-sm py-5 px-8">
          {/* <pre>{JSON.stringify(categories)}</pre> */}
          {isPending && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </>
          )}

          {categories?.slice(0, 8).map(({ name, _id }, index) => (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => setActiveId(_id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <Link
                href={`/browse/${_id}`}
                className={cn(
                  "px-3 py-1 whitespace-nowrap font-medium hover:underline",
                  !index && "text-red-500"
                )}
              >
                {name}
              </Link>
              {/* Subcategory Menu */}
              {activeId === _id && (
                <div className="absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-[200px] z-50">
                  <SubCategoryMenu parentId={_id} />
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}

const SubCategoryMenu = ({ parentId }: { parentId: Id<"categories"> }) => {
  const { storeSlug } = useStoreSlug();
  const subCategories = useQuery(
    api.collections.getSubCategoriesByParentIdAndStoreSlug,
    !storeSlug
      ? "skip"
      : {
          storeSlug,
          parentId,
        }
  );

  return (
    <div className="flex flex-col gap-2 px-1">
      {subCategories?.map(({ name, _id }, index) => (
        <Link
          key={index}
          href={`/browse/${_id}`}
          className="px-3 py-1 hover:bg-muted transition-colors"
        >
          {name}
        </Link>
      ))}
    </div>
  );
};

const SubCategoryMenuMobile = ({
  parentId,
}: {
  parentId: Id<"categories">;
}) => {
  const { storeSlug } = useStoreSlug();
  const subCategories = useQuery(
    api.collections.getSubCategoriesByParentIdAndStoreSlug,
    !storeSlug
      ? "skip"
      : {
          storeSlug,
          parentId,
        }
  );
  return (
    <div className="flex flex-col gap-4 pl-8">
      {subCategories?.map(({ name, _id }, index) => (
        <SheetClose key={index} asChild>
          <Link
            href={`/browse/${_id}`}
            className={cn("px-3 py-1 whitespace-nowrap font-medium")}
          >
            {name}
          </Link>
        </SheetClose>
      ))}
    </div>
  );
};
