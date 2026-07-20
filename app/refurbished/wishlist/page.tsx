"use client";

import Link from "next/link";
import { Heart, Loader2, Share2, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getCartProducts, type CartProduct } from "@/app/refurbished/cart/actions";
import { ProductThumb } from "@/components/store/product-thumb";
import { ButtonLink } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { conditionShort, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store/cart";

export default function WishlistPage() {
  const wishlist = useStore((s) => s.wishlist);
  const removeFromWishlist = useStore((s) => s.removeFromWishlist);
  const moveToCart = useStore((s) => s.moveToCart);
  const push = useToast((s) => s.push);

  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCartProducts(wishlist).then((resolved) => {
      if (!cancelled) {
        setProducts(resolved);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [wishlist]);

  async function share() {
    const url = `${window.location.origin}/refurbished/wishlist`;
    // The Web Share API is unavailable on most desktop browsers.
    if (navigator.share) {
      try {
        await navigator.share({ title: "My wishlist", url });
        return;
      } catch {
        // User dismissed the share sheet — fall through to clipboard.
      }
    }
    await navigator.clipboard.writeText(url);
    push("Wishlist link copied to clipboard");
  }

  if (loading) {
    return (
      <div className="mx-auto grid max-w-7xl place-items-center px-6 py-32">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Wishlist
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {products.length} saved {products.length === 1 ? "item" : "items"}
          </p>
        </div>

        {products.length > 0 && (
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Share2 className="size-4" />
            Share wishlist
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/20 px-8 py-20 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <Heart className="size-6" strokeWidth={1.6} />
          </span>
          <h2 className="mt-6 text-xl font-medium">Your wishlist is empty</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Tap the heart on any product to save it here for later.
          </p>
          <ButtonLink href="/refurbished/shop" size="lg" className="mt-8">
            Browse products
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.slug}
              className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card"
            >
              <Link
                href={`/refurbished/products/${product.slug}`}
                className="relative aspect-[4/3] bg-muted/40 p-4"
              >
                <ProductThumb
                  slug={product.slug}
                  category={product.categorySlug}
                  name={product.name}
                  className="absolute inset-4"
                />
              </Link>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {product.brandName ?? product.categoryName}
                </p>
                <h2 className="mt-1.5 font-medium leading-snug">
                  <Link
                    href={`/refurbished/products/${product.slug}`}
                    className="transition-colors hover:text-brand"
                  >
                    {product.name}
                  </Link>
                </h2>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {conditionShort(product.condition)} · {product.warrantyMonths}-mo
                  warranty
                </p>

                <p className="mt-4 text-lg font-semibold">
                  {formatPrice(product.priceCents)}
                </p>

                <div className="mt-auto flex gap-2 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      moveToCart(product.slug);
                      push(`Moved ${product.name} to cart`);
                    }}
                    disabled={product.stock <= 0}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-3 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    <ShoppingCart className="size-4" strokeWidth={1.8} />
                    Move to cart
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeFromWishlist(product.slug);
                      push(`Removed ${product.name} from wishlist`);
                    }}
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="grid size-10 place-items-center rounded-xl border border-border transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
