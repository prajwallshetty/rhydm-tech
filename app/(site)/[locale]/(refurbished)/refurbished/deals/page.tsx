import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Flame, ShieldCheck, Timer, TrendingDown } from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import { ProductThumb } from "@/components/store/product-thumb";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FadeIn } from "@/components/motion/fade-in";
import { discountPercent, formatPrice } from "@/lib/format";
import { getDeals } from "@/lib/repositories/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "store.deals" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function DealsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("store.deals");
  const tc = await getTranslations("store.conditionShort");

  const deals = await getDeals(24);

  const [top, ...rest] = deals;
  const topDiscount = top
    ? discountPercent(top.priceCents, top.compareAtCents)
    : null;
  const maxDiscount = deals.reduce(
    (max, deal) =>
      Math.max(max, discountPercent(deal.priceCents, deal.compareAtCents) ?? 0),
    0,
  );
  const totalSavingsCents = deals.reduce(
    (sum, deal) =>
      sum + Math.max(0, (deal.compareAtCents ?? deal.priceCents) - deal.priceCents),
    0,
  );

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
          <Breadcrumbs
            items={[
              { label: t("crumbStore"), href: "/refurbished" },
              { label: t("crumbDeals") },
            ]}
          />

          <FadeIn className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-1.5 rounded-full bg-[#2E6F40]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2E6F40]">
                  <Flame className="size-3.5" />
                  {t("clearanceEvent")}
                </p>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                  {t("title")}
                </h1>
                <p className="mt-3 text-base leading-relaxed text-slate-500">
                  {t("subtitle")}
                </p>
              </div>

              {/* Honest, computed stats */}
              <dl className="flex gap-8">
                <div>
                  <dd className="text-3xl font-black tracking-tight text-slate-900">
                    {deals.length}
                  </dd>
                  <dt className="mt-0.5 text-xs font-semibold text-slate-500">
                    {t("liveDeals")}
                  </dt>
                </div>
                <div>
                  <dd className="text-3xl font-black tracking-tight text-[#2E6F40]">
                    {maxDiscount}%
                  </dd>
                  <dt className="mt-0.5 text-xs font-semibold text-slate-500">
                    {t("biggestSaving")}
                  </dt>
                </div>
                <div>
                  <dd className="text-3xl font-black tracking-tight text-slate-900">
                    {formatPrice(totalSavingsCents)}
                  </dd>
                  <dt className="mt-0.5 text-xs font-semibold text-slate-500">
                    {t("totalSavings")}
                  </dt>
                </div>
              </dl>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured top deal */}
      {top && (
        <section className="mx-auto max-w-7xl px-6 pt-10">
          <FadeIn>
            <Link
              href={`/refurbished/products/${top.slug}`}
              className="group relative grid overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 transition-all duration-300 hover:border-[#2E6F40]/40 hover:shadow-2xl md:grid-cols-2"
            >
              <div className="relative min-h-[260px] p-8">
                <span className="absolute left-6 top-6 z-10 rounded-full bg-[#2E6F40] px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md">
                  {t("dealOfDay")}
                </span>
                <ProductThumb
                  slug={top.slug}
                  category={top.category.slug}
                  name={top.name}
                  imageUrl={top.images?.[0]?.url}
                  className="absolute inset-8 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col justify-center p-8 sm:p-10">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                  {top.brand?.name ?? top.category.name} ·{" "}
                  {tc(top.condition)}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 transition-colors group-hover:text-[#2E6F40] sm:text-3xl">
                  {top.name}
                </h2>
                {top.shortDescription && (
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                    {top.shortDescription}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-baseline gap-3">
                  <span className="text-4xl font-black tracking-tight text-slate-900">
                    {formatPrice(top.priceCents)}
                  </span>
                  {top.compareAtCents != null && (
                    <span className="text-lg font-semibold text-slate-400 line-through">
                      {formatPrice(top.compareAtCents)}
                    </span>
                  )}
                  {topDiscount != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#2E6F40] px-3 py-1 text-sm font-black text-white">
                      <TrendingDown className="size-3.5" />
                      {t("percentOff", { percent: topDiscount })}
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-[#2E6F40]" />
                    {t("warrantyMonths", { count: top.warrantyMonths })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Timer className="size-4 text-[#2E6F40]" />
                    {top.stock <= 5
                      ? t("onlyLeft", { count: top.stock })
                      : t("inStock", { count: top.stock })}
                  </span>
                </div>

                <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-colors group-hover:bg-[#2E6F40]">
                  {t("viewDeal")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </FadeIn>
        </section>
      )}

      {/* Remaining deals grid */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        {rest.length > 0 && (
          <>
            <FadeIn>
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  {t("allReductions")}
                </h2>
                <p className="text-sm font-semibold text-slate-500">
                  {t("moreDeals", { count: rest.length })}
                </p>
              </div>
            </FadeIn>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rest.map((product, i) => (
                <FadeIn key={product.id} onScroll delay={(i % 4) * 0.05}>
                  <ProductCard product={product} />
                </FadeIn>
              ))}
            </div>
          </>
        )}

        {deals.length === 0 && (
          <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 px-8 py-20 text-center">
            <Flame className="mx-auto size-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-black text-slate-900">
              {t("emptyTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              {t("emptyBody")}
            </p>
            <Link
              href="/refurbished/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2E6F40] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#255833]"
            >
              {t("browseCatalog")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
