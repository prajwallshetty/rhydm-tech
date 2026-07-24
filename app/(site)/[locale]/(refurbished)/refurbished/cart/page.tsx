"use client";

import { Link } from "@/i18n/navigation";
import { Heart, Loader2, Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { getCartProducts, validateCoupon, type CartProduct } from "@/app/(site)/[locale]/(refurbished)/refurbished/cart/actions";
import { ProductThumb } from "@/components/store/product-thumb";
import { ButtonLink } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatPriceExact } from "@/lib/format";
import { useStore } from "@/lib/store/cart";
import {
  amountToFreeShipping,
  calculateTotals,
  FREE_SHIPPING_THRESHOLD_CENTS,
} from "@/lib/store/totals";

export default function CartPage() {
  const cart = useStore((s) => s.cart);
  const setQuantity = useStore((s) => s.setQuantity);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const push = useToast((s) => s.push);
  const t = useTranslations("store.cart");
  const tp = useTranslations("store.product");
  const tc = useTranslations("store.conditionShort");

  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [applied, setApplied] = useState<{ code: string; discountCents: number } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  // Prices are resolved server-side on every render of this page.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const slugs = cart.map((line) => line.slug);
      const resolved = await getCartProducts(slugs);
      if (!cancelled) {
        setProducts(resolved);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [cart]);

  const lines = cart
    .map((line) => {
      const product = products.find((p) => p.slug === line.slug);
      return product ? { ...line, product } : null;
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const subtotalCents = lines.reduce(
    (total, line) => total + line.product.priceCents * line.quantity,
    0,
  );
  // A previously-applied coupon is re-clamped whenever the cart changes, so an
  // edited cart can never carry a stale over-discount.
  const discountCents = applied ? Math.min(applied.discountCents, subtotalCents) : 0;
  const totals = calculateTotals({ subtotalCents, discountCents });
  const remaining = amountToFreeShipping(subtotalCents);

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const code = coupon.trim();
    if (!code) {
      setApplied(null);
      setCouponMessage(null);
      return;
    }
    setCouponBusy(true);
    const res = await validateCoupon(code, subtotalCents);
    setCouponBusy(false);

    if (res.ok) {
      setApplied({ code: res.code, discountCents: res.discountCents });
      setCouponMessage(null);
      push(t("couponApplied", { code: res.code }), "check");
    } else {
      setApplied(null);
      setCouponMessage(
        res.reason === "minspend"
          ? t("couponMinSpend", {
              amount: formatPriceExact(res.minSpendCents ?? 0),
            })
          : t(`coupon_${res.reason}` as "coupon_invalid"),
      );
    }
  }

  if (loading) {
    return (
      <div className="mx-auto grid max-w-7xl place-items-center px-6 py-32">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-8 py-20 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <ShoppingBag className="size-6" strokeWidth={1.6} />
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            {t("emptyTitle")}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t("emptyBody")}
          </p>
          <ButtonLink href="/refurbished/shop" size="lg" className="mt-8">
            {t("startShopping")}
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("itemCount", { count: lines.length })}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Lines */}
        <div className="space-y-4">
          {remaining > 0 && (
            <div className="rounded-xl border border-brand/25 bg-brand-muted px-5 py-4 text-sm">
              {t.rich("freeShippingRemaining", {
                amount: formatPriceExact(remaining),
                strong: (chunks) => (
                  <span className="font-semibold text-brand">{chunks}</span>
                ),
              })}
            </div>
          )}

          {lines.map((line) => (
            <article
              key={line.slug}
              className="flex gap-5 rounded-2xl border border-border/80 bg-card p-5"
            >
              <Link
                href={`/refurbished/products/${line.slug}`}
                className="shrink-0"
              >
                <ProductThumb
                  slug={line.slug}
                  category={line.product.categorySlug}
                  name={line.product.name}
                  className="size-24 sm:size-28"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {line.product.brandName ?? line.product.categoryName}
                    </p>
                    <h2 className="mt-1 font-medium leading-snug">
                      <Link
                        href={`/refurbished/products/${line.slug}`}
                        className="transition-colors hover:text-brand"
                      >
                        {line.product.name}
                      </Link>
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tc(line.product.condition)} ·{" "}
                      {tp("warrantyBadge", { count: line.product.warrantyMonths })}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold">
                    {formatPriceExact(line.product.priceCents * line.quantity)}
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-4 pt-4">
                  <div className="inline-flex items-center rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.slug, line.quantity - 1)}
                      aria-label={t("decreaseOf", { name: line.product.name })}
                      className="grid size-9 place-items-center rounded-l-lg transition-colors hover:bg-accent"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="grid w-10 place-items-center text-sm font-medium">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(line.slug, line.quantity + 1)}
                      disabled={line.quantity >= line.product.stock}
                      aria-label={t("increaseOf", { name: line.product.name })}
                      className="grid size-9 place-items-center rounded-r-lg transition-colors hover:bg-accent disabled:opacity-40"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      toggleWishlist(line.slug);
                      removeFromCart(line.slug);
                      push(t("movedToWishlist", { name: line.product.name }), "heart");
                    }}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Heart className="size-3.5" />
                    {t("moveToWishlist")}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      removeFromCart(line.slug);
                      push(t("removed", { name: line.product.name }));
                    }}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    {t("remove")}
                  </button>
                </div>
              </div>
            </article>
          ))}

          <ButtonLink href="/refurbished/shop" variant="outline">
            {t("continueShopping")}
          </ButtonLink>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-border/80 bg-card p-6">
            <h2 className="text-lg font-medium">{t("summary")}</h2>

            <div className="mt-5 space-y-3 text-sm">
              <Row label={t("subtotal")} value={formatPriceExact(totals.subtotalCents)} />
              {totals.discountCents > 0 && applied && (
                <Row
                  label={`${t("discount")} · ${applied.code}`}
                  value={`−${formatPriceExact(totals.discountCents)}`}
                />
              )}
              <Row
                label={t("shipping")}
                value={
                  totals.shippingCents === 0
                    ? t("free")
                    : formatPriceExact(totals.shippingCents)
                }
              />
              <Row
                label={t("tax")}
                value={formatPriceExact(totals.taxCents)}
              />
              <div className="border-t border-border pt-3">
                <Row
                  label={t("total")}
                  value={formatPriceExact(totals.totalCents)}
                  emphasis
                />
              </div>
            </div>

            {/* Coupon codes are validated server-side (see cart/actions). */}
            <form className="mt-6" onSubmit={applyCoupon}>
              <label htmlFor="coupon" className="text-sm font-medium">
                {t("coupon")}
              </label>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <Tag
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="coupon"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder={t("couponPlaceholder")}
                    className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-brand"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponBusy}
                  className="h-10 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
                >
                  {couponBusy ? "…" : applied ? t("applied") : t("apply")}
                </button>
              </div>
              {applied && (
                <p className="mt-2 text-xs font-medium text-brand">
                  {t("couponApplied", { code: applied.code })}
                </p>
              )}
              {couponMessage && (
                <p className="mt-2 text-xs text-destructive">
                  {couponMessage}
                </p>
              )}
            </form>

            <ButtonLink
              href="/refurbished/checkout"
              size="lg"
              className="mt-6 w-full"
            >
              {t("checkout")}
            </ButtonLink>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t("freeOver", {
                amount: formatPriceExact(FREE_SHIPPING_THRESHOLD_CENTS),
              })}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={emphasis ? "font-medium" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={emphasis ? "text-base font-semibold" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
