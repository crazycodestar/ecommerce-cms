import { Id } from "@/convex/_generated/dataModel";
// import { isSameVariant } from "@/lib/utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Type for a cart item
export interface CartItem {
  productId: Id<"products">;
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
  removeItem: (productId: Id<"products">) => void;
  incrementQuantity: (productId: Id<"products">) => void;
  decrementQuantity: (productId: Id<"products">) => void;
  clearCart: () => void;
  // Utility functions
  getItemQuantity: (productId: Id<"products">) => number;
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

      removeItem: (productId: Id<"products">) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      incrementQuantity: (productId: Id<"products">) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        })),

      decrementQuantity: (productId: Id<"products">) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === productId
          );

          if (existingItem && existingItem.quantity === 1) {
            return {
              items: state.items.filter((item) => item.productId !== productId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getItemQuantity: (productId: Id<"products">) => {
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

export default useCartStore;
