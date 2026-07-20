"use client";

import Link from "next/link";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";

import { ProductThumb } from "@/components/store/product-thumb";
import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/store/cart";
import { conditionShort, formatPrice } from "@/lib/format";
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
  const wishlisted = useStore((s) => s.wishlist.includes(product.slug));
  const push = useToast((s) => s.push);

  const href = `/refurbished/products/${product.slug}`;
  const brandName = product.brand?.name ?? product.category?.name ?? "RHYDM";
  const conditionTag = conditionShort(product.condition) || "GRADE_A";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col justify-between overflow-hidden rounded-[32px] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 hover:shadow-2xl transition-all duration-300",
        className,
      )}
    >
      <div>
        {/* Inner Light Image Box */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-[#F2F4F7] p-5 flex items-center justify-center">
          {/* Top-Left Condition Badge */}
          <div className="absolute left-3.5 top-3.5 z-10">
            <span className="rounded-full bg-[#2E6F40] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              {conditionTag}
            </span>
          </div>

          {/* Top-Right Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
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
            className="absolute right-3.5 top-3.5 z-20 grid size-8 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                wishlisted ? "fill-[#2E6F40] text-[#2E6F40]" : "text-slate-400 hover:text-slate-700",
              )}
            />
          </button>

          {/* Center Product Image / Thumb */}
          <Link href={href} className="absolute inset-0 flex items-center justify-center p-4">
            <ProductThumb
              slug={product.slug}
              category={product.category.slug}
              name={product.name}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Content Section */}
        <div className="mt-5 space-y-1">
          {/* Brand Name */}
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
            {brandName}
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight line-clamp-1 group-hover:text-[#2E6F40] transition-colors">
            <Link href={href} className="focus:outline-none">
              {product.name}
            </Link>
          </h3>

          {/* Description */}
          {product.shortDescription && (
            <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2 mt-1">
              {product.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/* Footer Price & Add Button */}
      <div className="mt-6 border-t border-slate-100 pt-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-black text-slate-900 tracking-tight">
            {formatPrice(product.priceCents)}
          </div>
          {product.compareAtCents != null && (
            <div className="text-xs font-semibold text-slate-400 line-through mt-0.5">
              {formatPrice(product.compareAtCents)}
            </div>
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
          className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-slate-950 hover:bg-[#2E6F40] px-4.5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <ShoppingCart aria-hidden className="size-3.5" strokeWidth={2} />
          <span>Add</span>
        </button>
      </div>
    </article>
  );
}
