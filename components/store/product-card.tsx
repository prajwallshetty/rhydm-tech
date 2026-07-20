"use client";

import Link from "next/link";
import { BarChart3, Check, Heart, ShoppingCart } from "lucide-react";

import { ProductThumb } from "@/components/store/product-thumb";
import { RatingStars } from "@/components/store/rating-stars";
import { useToast } from "@/components/ui/toast";
import { MAX_COMPARE, useStore } from "@/lib/store/cart";
import {
  conditionShort,
  discountPercent,
  formatPrice,
  stockLabel,
} from "@/lib/format";
import type { ProductCardData } from "@/lib/repositories/store";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  className,
}: {
  product: ProductCardData;
  className?: string;
}) {
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const toggleCompare = useStore((s) => s.toggleCompare);
  const wishlisted = useStore((s) => s.wishlist.includes(product.slug));
  const comparing = useStore((s) => s.compare.includes(product.slug));
  const compareFull = useStore(
    (s) => s.compare.length >= MAX_COMPARE && !s.compare.includes(product.slug),
  );
  const push = useToast((s) => s.push);

  const discount = discountPercent(product.priceCents, product.compareAtCents);
  const stock = stockLabel(product.stock);
  const href = `/refurbished/products/${product.slug}`;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-300 hover:border-brand/35 hover:shadow-[0_18px_48px_-20px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/40 p-4">
        {/* Two thumbs cross-fade to suggest a second product angle. */}
        <ProductThumb
          slug={product.slug}
          category={product.category.slug}
          name={product.name}
          className="absolute inset-4 transition-opacity duration-500 group-hover:opacity-0"
        />
        <ProductThumb
          slug={product.slug}
          category={product.category.slug}
          name={`${product.name}, alternate view`}
          variant="hover"
          className="absolute inset-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount != null && (
            <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-medium text-destructive-foreground">
              −{discount}%
            </span>
          )}
          <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
            {conditionShort(product.condition)}
          </span>
        </div>

        {/* Secondary actions, revealed on hover but always keyboard-reachable. */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-0 transition-opacity duration-300 focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => {
              toggleWishlist(product.slug);
              push(
                wishlisted
                  ? `Removed ${product.name} from wishlist`
                  : `Saved ${product.name} to wishlist`,
                "heart",
              );
            }}
            aria-label={
              wishlisted
                ? `Remove ${product.name} from wishlist`
                : `Save ${product.name} to wishlist`
            }
            aria-pressed={wishlisted}
            className="grid size-8 place-items-center rounded-lg bg-background/90 backdrop-blur transition-colors hover:text-brand"
          >
            <Heart
              className={cn("size-4", wishlisted && "fill-brand text-brand")}
              strokeWidth={1.8}
            />
          </button>

          <button
            type="button"
            onClick={() => {
              if (compareFull) {
                push(`Compare list is full (max ${MAX_COMPARE})`);
                return;
              }
              toggleCompare(product.slug);
              push(
                comparing
                  ? `Removed ${product.name} from compare`
                  : `Added ${product.name} to compare`,
              );
            }}
            aria-label={`Compare ${product.name}`}
            aria-pressed={comparing}
            disabled={compareFull}
            className={cn(
              "grid size-8 place-items-center rounded-lg bg-background/90 backdrop-blur transition-colors hover:text-brand disabled:opacity-40",
              comparing && "text-brand",
            )}
          >
            {comparing ? (
              <Check className="size-4" strokeWidth={2.4} />
            ) : (
              <BarChart3 className="size-4" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {product.brand?.name ?? product.category.name}
        </p>

        <h3 className="mt-1.5 text-[15px] font-medium leading-snug">
          {/* Stretched link keeps the whole card clickable without nesting
              interactive elements inside an anchor. */}
          <Link href={href} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>

        {product.shortDescription && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        )}

        {product.ratingCount > 0 && (
          <div className="mt-3">
            <RatingStars rating={product.ratingAvg} count={product.ratingCount} />
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-md bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand">
            {product.warrantyMonths}-mo warranty
          </span>
          <span
            className={cn(
              "text-xs",
              stock.tone === "out" && "text-destructive",
              stock.tone === "low" && "text-amber-600 dark:text-amber-500",
              stock.tone === "in" && "text-muted-foreground",
            )}
          >
            {stock.label}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-xl font-semibold tracking-tight">
              {formatPrice(product.priceCents)}
            </p>
            {product.compareAtCents != null && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtCents)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              addToCart(product.slug);
              push(`Added ${product.name} to cart`);
            }}
            disabled={product.stock <= 0}
            aria-label={`Add ${product.name} to cart`}
            // relative + z-10 lifts this above the stretched link overlay.
            className="relative z-10 inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart aria-hidden className="size-4" strokeWidth={1.8} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}
