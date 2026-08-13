"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Heart, ShoppingCart, Loader2, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";

import { ProductThumb } from "@/components/store/product-thumb";
import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";
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
  const t = useTranslations("store.product");
  const tc = useTranslations("store.conditionShort");

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const href = `/refurbished/products/${product.slug}`;
  const brandName = product.brand?.name ?? product.category?.name ?? "RHYDM";
  const conditionTag = tc(product.condition);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col justify-between overflow-hidden rounded-[32px] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 hover:shadow-xl transition-all duration-300",
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

          {/* Top-Right Wishlist Button with Hover Reveal on Desktop */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.slug);
              push(
                wishlisted
                  ? t("removedWishlist", { name: product.name })
                  : t("savedWishlist", { name: product.name }),
                wishlisted ? "info" : "heart",
              );
            }}
            aria-label={
              wishlisted
                ? t("removeWishlist", { name: product.name })
                : t("saveWishlist", { name: product.name })
            }
            className="absolute right-2.5 top-2.5 z-20 grid size-11 sm:size-8 sm:right-3.5 sm:top-3.5 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all duration-300 md:opacity-0 md:scale-95 group-hover:opacity-100 group-hover:scale-100 hover:bg-white cursor-pointer"
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                wishlisted ? "fill-[#2E6F40] text-[#2E6F40]" : "text-slate-400 hover:text-slate-700",
              )}
            />
          </motion.button>

          {/* Center Product Image / Thumb */}
          <Link href={href} className="absolute inset-0 flex items-center justify-center p-4">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].url}
                alt={product.images[0].alt ?? product.name}
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <ProductThumb
                slug={product.slug}
                category={product.category.slug}
                name={product.name}
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              />
            )}
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
            if (adding || added) return;
            setAdding(true);
            setTimeout(() => {
              addToCart(product.slug);
              setAdding(false);
              setAdded(true);
              push(t("addedCart", { name: product.name }), "check");
              setTimeout(() => {
                setAdded(false);
              }, 1600);
            }, 650);
          }}
          disabled={product.stock <= 0 || adding}
          aria-label={t("addToCart") + ": " + product.name}
          className={cn(
            "relative z-10 inline-flex min-h-11 sm:min-h-0 items-center justify-center gap-1.5 rounded-full px-4.5 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer min-w-24 text-center",
            added
              ? "bg-emerald-600 hover:bg-emerald-600"
              : "bg-slate-950 hover:bg-[#2E6F40]"
          )}
        >
          {adding ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>{t("adding")}</span>
            </>
          ) : added ? (
            <>
              <Check className="size-3.5" />
              <span>{t("added")}</span>
            </>
          ) : (
            <>
              <ShoppingCart aria-hidden className="size-3.5" strokeWidth={2} />
              <span>{t("add")}</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
