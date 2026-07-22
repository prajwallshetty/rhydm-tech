"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Cart, wishlist and comparison state.
 *
 * Only slugs and quantities are stored. Prices are deliberately **not** kept
 * client-side — they are looked up server-side from the database whenever the
 * cart is rendered or an order is placed, so a tampered localStorage value
 * cannot change what anything costs.
 */

export type CartLine = {
  slug: string;
  quantity: number;
  variantId?: string;
  selectedOptions?: Record<string, string>;
  variantSku?: string;
};

type StoreState = {
  cart: CartLine[];
  wishlist: string[];
  compare: string[];
  recentlyViewed: string[];

  addToCart: (
    slug: string,
    quantity?: number,
    options?: {
      variantId?: string;
      selectedOptions?: Record<string, string>;
      variantSku?: string;
    },
  ) => void;
  setQuantity: (slug: string, quantity: number, variantId?: string) => void;
  removeFromCart: (slug: string, variantId?: string) => void;
  clearCart: () => void;

  toggleWishlist: (slug: string) => void;
  removeFromWishlist: (slug: string) => void;
  moveToCart: (slug: string) => void;

  toggleCompare: (slug: string) => void;
  clearCompare: () => void;

  recordView: (slug: string) => void;
};

const MAX_COMPARE = 4;
const MAX_RECENT = 8;

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      compare: [],
      recentlyViewed: [],

      addToCart: (slug, quantity = 1, options) =>
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (line) =>
              line.slug === slug &&
              (line.variantId || null) === (options?.variantId || null),
          );
          if (existingIndex >= 0) {
            const updated = [...state.cart];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
            return { cart: updated };
          }
          return {
            cart: [
              ...state.cart,
              {
                slug,
                quantity,
                variantId: options?.variantId,
                selectedOptions: options?.selectedOptions,
                variantSku: options?.variantSku,
              },
            ],
          };
        }),

      setQuantity: (slug, quantity, variantId) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter(
                  (line) =>
                    !(
                      line.slug === slug &&
                      (variantId ? line.variantId === variantId : true)
                    ),
                )
              : state.cart.map((line) =>
                  line.slug === slug &&
                  (variantId ? line.variantId === variantId : true)
                    ? { ...line, quantity }
                    : line,
                ),
        })),

      removeFromCart: (slug, variantId) =>
        set((state) => ({
          cart: state.cart.filter(
            (line) =>
              !(
                line.slug === slug &&
                (variantId ? line.variantId === variantId : true)
              ),
          ),
        })),

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (slug) =>
        set((state) => ({
          wishlist: state.wishlist.includes(slug)
            ? state.wishlist.filter((s) => s !== slug)
            : [...state.wishlist, slug],
        })),

      removeFromWishlist: (slug) =>
        set((state) => ({
          wishlist: state.wishlist.filter((s) => s !== slug),
        })),

      moveToCart: (slug) =>
        set((state) => {
          const existing = state.cart.find((line) => line.slug === slug);
          return {
            wishlist: state.wishlist.filter((s) => s !== slug),
            cart: existing
              ? state.cart.map((line) =>
                  line.slug === slug
                    ? { ...line, quantity: line.quantity + 1 }
                    : line,
                )
              : [...state.cart, { slug, quantity: 1 }],
          };
        }),

      toggleCompare: (slug) =>
        set((state) => {
          if (state.compare.includes(slug)) {
            return { compare: state.compare.filter((s) => s !== slug) };
          }
          // Silently ignore additions past the limit — the UI disables the
          // control at this point, so this is just a safety net.
          if (state.compare.length >= MAX_COMPARE) return state;
          return { compare: [...state.compare, slug] };
        }),

      clearCompare: () => set({ compare: [] }),

      recordView: (slug) =>
        set((state) => ({
          recentlyViewed: [
            slug,
            ...state.recentlyViewed.filter((s) => s !== slug),
          ].slice(0, MAX_RECENT),
        })),
    }),
    {
      name: "rhydm.store",
      // Bump when the persisted shape changes incompatibly.
      version: 1,
    },
  ),
);

export { MAX_COMPARE };

/** Total item count, for the header badge. */
export function cartCount(cart: CartLine[]) {
  return cart.reduce((total, line) => total + line.quantity, 0);
}
