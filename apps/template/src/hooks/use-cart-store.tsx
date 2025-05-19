"use client";

import { productsAPI } from "@/api";
import type { GetProductsByIdsResponse } from "@/api/returnTypes";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// import { api } from "@/convex/_generated/api";
// import { useQuery } from "convex/react";

// Type for a cart item
export interface CartItem {
  productId: string;
  quantity: number;
  variants:
    | {
        name: string;
        value: string;
      }[]
    | undefined;
  metadatas:
    | {
        name: string;
        value: string | number;
      }[]
    | undefined;
}

// Type for the entire cart store
interface CartStore {
  items: CartItem[];
  // Cart actions
  addItem: (args: CartItem) => void;
  removeItem: (index: number) => void;
  incrementQuantity: (index: number) => void;
  decrementQuantity: (index: number) => void;
  clearCart: () => void;
  // Utility functions
  getItemQuantity: (productId: string) => number;
  getTotalItems: () => number;
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (args) =>
        set((state) => {
          return {
            items: [...state.items, { ...args }],
          };
        }),

      removeItem: (index: number) =>
        set((state) => ({
          items: state.items.filter((_, pos) => pos !== index),
        })),

      incrementQuantity: (index: number) =>
        set((state) => ({
          items: state.items.map((item, pos) =>
            pos === index ? { ...item, quantity: item.quantity + 1 } : item
          ),
        })),

      decrementQuantity: (index: number) =>
        set((state) => {
          const existingItem = state.items.find((_, pos) => pos === index);

          if (existingItem && existingItem.quantity === 1) {
            return {
              items: state.items.filter((_, pos) => pos !== index),
            };
          }

          return {
            items: state.items.map((item, pos) =>
              pos === index ? { ...item, quantity: item.quantity - 1 } : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getItemQuantity: (productId: string) => {
        const item = get().items.find((item) => item.productId === productId);
        return item?.quantity || 0;
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      // Optional: you might want to add storage version for future migrations
      version: 1,
    }
  )
);

export const useCart = () => {
  const items = useCartStore((state) => state.items);

  const [products, setProducts] = useState<GetProductsByIdsResponse>([]);

  useEffect(() => {
    if (!items.length) return;

    productsAPI
      .getProductsByIds(items.map((i) => i.productId))
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, [items]);

  const formattedProducts = items
    .map((i) => {
      const product = products?.find((p) => p._id === i.productId);
      if (!product) return;

      const price =
        product.price +
        (i.variants?.reduce((acc, variant) => {
          const variantSet = product.variants?.find(
            (variantSet) => variantSet.name === variant.name
          );
          const selectedOption = variantSet?.options.find(
            (option) => option.name === variant.value
          );
          return acc + (selectedOption ? selectedOption.price : 0);
        }, 0) ?? 0);
      return {
        ...product,
        price,
        ...i,
      };
    })
    .filter((i): i is NonNullable<typeof i> => !!i);

  const isEmpty = !formattedProducts.length;
  const isPending = products === undefined && !isEmpty;

  const subTotal = formattedProducts.reduce(
    (acc, product) => acc + (product?.price ?? 0) * (product?.quantity ?? 0),
    0
  );

  return { formattedProducts, isPending, isEmpty, subTotal };
};

export default useCartStore;
