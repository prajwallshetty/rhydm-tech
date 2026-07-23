"use client";

import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

export function AddToCart({
  slug,
  name,
  stock,
  variantId,
  selectedOptions,
  variantSku,
  variantPriceCents,
}: {
  slug: string;
  name: string;
  stock: number;
  variantId?: string;
  selectedOptions?: Record<string, string>;
  variantSku?: string;
  variantPriceCents?: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlisted = useStore((s) => s.wishlist.includes(slug));
  const recordView = useStore((s) => s.recordView);
  const push = useToast((s) => s.push);
  const t = useTranslations("store.product");

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
            aria-label={t("decreaseQty")}
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
            aria-label={t("increaseQty")}
            className="grid size-11 place-items-center rounded-r-xl transition-colors hover:bg-accent disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            addToCart(slug, quantity, {
              variantId,
              selectedOptions,
              variantSku,
            });
            push(
              quantity > 1
                ? t("addedCartQty", { count: quantity, name })
                : t("addedCart", { name }),
            );
          }}
          disabled={outOfStock}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:px-8"
        >
          <ShoppingCart className="size-4" strokeWidth={1.8} />
          {outOfStock ? t("outOfStock") : t("addToCart")}
        </button>

        <button
          type="button"
          onClick={() => {
            toggleWishlist(slug);
            push(
              wishlisted
                ? t("removedWishlist", { name })
                : t("savedWishlist", { name }),
              "heart",
            );
          }}
          aria-label={
            wishlisted
              ? t("removeWishlist", { name })
              : t("saveWishlist", { name })
          }
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
          {t("onlyLeft", { count: stock })}
        </p>
      )}
    </div>
  );
}
