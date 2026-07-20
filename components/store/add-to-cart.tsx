"use client";

import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

export function AddToCart({
  slug,
  name,
  stock,
}: {
  slug: string;
  name: string;
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlisted = useStore((s) => s.wishlist.includes(slug));
  const recordView = useStore((s) => s.recordView);
  const push = useToast((s) => s.push);

  // Recording the view here rather than on the server keeps the product page
  // statically renderable.
  useEffect(() => {
    recordView(slug);
  }, [slug, recordView]);

  const outOfStock = stock <= 0;
  const max = Math.max(1, stock);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || outOfStock}
            aria-label="Decrease quantity"
            className="grid size-11 place-items-center rounded-l-xl transition-colors hover:bg-accent disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span
            aria-live="polite"
            className="grid w-12 place-items-center text-sm font-medium"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(max, q + 1))}
            disabled={quantity >= max || outOfStock}
            aria-label="Increase quantity"
            className="grid size-11 place-items-center rounded-r-xl transition-colors hover:bg-accent disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            addToCart(slug, quantity);
            push(
              quantity > 1
                ? `Added ${quantity} × ${name} to cart`
                : `Added ${name} to cart`,
            );
          }}
          disabled={outOfStock}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-8"
        >
          <ShoppingCart className="size-4" strokeWidth={1.8} />
          {outOfStock ? "Out of stock" : "Add to cart"}
        </button>

        <button
          type="button"
          onClick={() => {
            toggleWishlist(slug);
            push(
              wishlisted ? `Removed ${name} from wishlist` : `Saved ${name}`,
              "heart",
            );
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wishlisted}
          className="grid size-11 place-items-center rounded-xl border border-border transition-colors hover:bg-accent"
        >
          <Heart
            className={cn("size-4.5", wishlisted && "fill-brand text-brand")}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {stock > 0 && stock <= 5 && (
        <p className="text-sm text-amber-600 dark:text-amber-500">
          Only {stock} left in stock — order soon.
        </p>
      )}
    </div>
  );
}
