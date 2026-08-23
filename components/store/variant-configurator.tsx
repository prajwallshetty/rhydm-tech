"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Check, ShieldCheck, Award, Truck, RotateCcw, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { ProductGallery } from "@/components/store/product-gallery";
import { AddToCart } from "@/components/store/add-to-cart";
import { RatingStars } from "@/components/store/rating-stars";
import { BRAND, WHATSAPP } from "@/lib/business";
import { formatPrice, discountPercent, stockLabel } from "@/lib/format";
import { ProductWithVariantsDTO, ProductVariantDTO } from "@/lib/data/variant-utils";
import { cn } from "@/lib/utils";
import { ExchangeWizard } from "@/components/store/exchange-wizard";
import {
  submitExchangeRequestAction,
  type SubmitExchangeInput,
} from "@/app/actions/exchange";
import { useToast } from "@/components/ui/toast";

interface VariantConfiguratorProps {
  product: ProductWithVariantsDTO;
  baseImages?: string[];
  ratingAvg?: number;
  ratingCount?: number;
  brandName?: string;
  categoryName?: string;
  categorySlug?: string;
  specGroups?: Record<string, Array<{ name: string; value: string; group?: string | null }>>;
  conditionNotes?: string | null;
  description?: string | null;
}

export function VariantConfigurator({
  product,
  baseImages = [],
  ratingAvg = 0,
  ratingCount = 0,
  brandName,
  categoryName,
  categorySlug = "laptops",
  specGroups = {},
  conditionNotes,
  description,
}: VariantConfiguratorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("store.detail");
  const ts = useTranslations("store.stock");
  const tcond = useTranslations("store.condition");
  const pushToast = useToast((s) => s.push);

  // 1. Initialize option state from URL parameters or default to first available variant
  const initialSelected = useMemo(() => {
    const defaults: Record<string, string> = {};

    // Check URL parameters first (e.g. ?ram=16gb&ssd=512gb)
    product.options.forEach((opt) => {
      const urlValue = searchParams.get(opt.name.toLowerCase());
      if (urlValue) {
        const match = opt.values.find(
          (v) => v.value.toLowerCase() === urlValue.toLowerCase(),
        );
        if (match) {
          defaults[opt.name] = match.value;
        }
      }
    });

    // Fallback to first published variant options
    if (Object.keys(defaults).length < product.options.length && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      product.options.forEach((opt) => {
        if (!defaults[opt.name] && firstVariant.selectedOptions[opt.name]) {
          defaults[opt.name] = firstVariant.selectedOptions[opt.name];
        }
      });
    }

    // Default to first option value if still missing
    product.options.forEach((opt) => {
      if (!defaults[opt.name] && opt.values.length > 0) {
        defaults[opt.name] = opt.values[0].value;
      }
    });

    return defaults;
  }, [product, searchParams]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initialSelected);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [submittingTradeIn, setSubmittingTradeIn] = useState(false);
  const [tradeInRef, setTradeInRef] = useState<string | null>(null);

  const handleTradeInSubmit = async (data: SubmitExchangeInput) => {
    if (submittingTradeIn) return;
    setSubmittingTradeIn(true);
    try {
      const res = await submitExchangeRequestAction(data);
      if (res.success) {
        setTradeInRef(res.referenceNumber);
        setWizardOpen(false);
        pushToast("Trade-in request submitted — we'll be in touch with an offer.", "check");
      } else {
        pushToast(res.error, "error");
      }
    } catch {
      pushToast("We couldn't submit your request. Please try again.", "error");
    } finally {
      setSubmittingTradeIn(false);
    }
  };

  // 2. Resolve matching variant based on selectedOptions
  const activeVariant = useMemo<ProductVariantDTO | null>(() => {
    if (product.variants.length === 0) return null;

    return (
      product.variants.find((v) => {
        return Object.entries(selectedOptions).every(
          ([optName, optVal]) => v.selectedOptions[optName] === optVal,
        );
      }) || null
    );
  }, [product.variants, selectedOptions]);

  // 3. Update URL deep links dynamically without page refresh
  const handleOptionSelect = (optionName: string, value: string) => {
    const updated = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(updated);

    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updated).forEach(([k, v]) => {
      params.set(k.toLowerCase(), v.toLowerCase());
    });

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // 4. Compute active display metrics (Price, Stock, SKU, Warranty, Condition)
  const priceCents = activeVariant ? activeVariant.priceCents : product.basePriceCents;
  const compareAtCents = activeVariant
    ? activeVariant.compareAtCents
    : product.baseCompareAtCents;
  const discount = discountPercent(priceCents, compareAtCents);
  const stockCount = activeVariant ? activeVariant.stock : product.baseStock;
  const stock = stockLabel(stockCount);
  const sku = activeVariant ? activeVariant.sku : product.sku;
  const warrantyMonths = activeVariant?.warrantyMonths ?? product.baseWarrantyMonths;
  const condition = activeVariant?.condition ?? product.baseCondition;

  // Active Images
  const galleryImages =
    activeVariant && activeVariant.images.length > 0
      ? activeVariant.images.map((img) => img.url)
      : baseImages.length > 0
        ? baseImages
        : undefined;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Left Column: Product Gallery */}
        <div>
          <ProductGallery
            slug={product.slug}
            category={categorySlug}
            name={product.name}
            overrideImages={galleryImages}
          />
        </div>

        {/* Right Column: Shopify-Style Variant Selector */}
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-[#16A34A]">
            {brandName ?? categoryName}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {product.name}
          </h1>

          {/* Rating */}
          {ratingCount > 0 && (
            <div className="mt-3">
              <RatingStars rating={ratingAvg} count={ratingCount} size="md" />
            </div>
          )}

          {/* Price Header with Discount */}
          <div className="mt-6 flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {formatPrice(priceCents)}
              </span>
              {compareAtCents != null && (
                <>
                  <span className="text-lg text-slate-400 line-through">
                    {formatPrice(compareAtCents)}
                  </span>
                  {discount != null && (
                    <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      {t("save", { discount })}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stock & SKU Info */}
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-semibold",
                stock.tone === "out" ? "text-red-600" : "text-[#16A34A]",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  stock.tone === "out" ? "bg-red-500" : "bg-[#16A34A] animate-pulse",
                )}
              />
              {ts(stock.tone, { count: stock.count })}
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-xs text-slate-500">{t("sku", { sku })}</span>
          </div>

          {/* Shopify-Style Option Selectors */}
          {product.options.length > 0 && (
            <div className="mt-8 space-y-6 border-t border-slate-100 pt-6">
              {product.options.map((option) => (
                <div key={option.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {option.name}:{" "}
                      <span className="font-semibold text-[#16A34A]">
                        {selectedOptions[option.name]}
                      </span>
                    </label>
                  </div>

                  {/* Pills / Buttons Selector */}
                  <div className="flex flex-wrap gap-2.5">
                    {option.values.map((val) => {
                      const isSelected = selectedOptions[option.name] === val.value;

                      // Check if this option value is in stock for the current combination
                      const isCombinationAvailable = product.variants.some((v) => {
                        const matchesValue = v.selectedOptions[option.name] === val.value;
                        const matchesOther = Object.entries(selectedOptions).every(
                          ([k, vVal]) => k === option.name || v.selectedOptions[k] === vVal,
                        );
                        return matchesValue && matchesOther && v.stock > 0;
                      });

                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => handleOptionSelect(option.name, val.value)}
                          className={cn(
                            "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer border",
                            isSelected
                              ? "border-[#16A34A] bg-emerald-50/70 text-[#16A34A] shadow-sm shadow-[#16A34A]/10 ring-2 ring-[#16A34A]/20"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                            !isCombinationAvailable &&
                              !isSelected &&
                              "opacity-50 line-through bg-slate-50 text-slate-400 border-slate-200",
                          )}
                        >
                          {isSelected && <Check className="size-3.5 stroke-[3]" />}
                          <span>{val.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add to Cart Section */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <AddToCart
              slug={product.slug}
              name={product.name}
              stock={stockCount}
              variantId={activeVariant?.id}
              selectedOptions={selectedOptions}
              variantSku={sku}
              variantPriceCents={priceCents}
            />
          </div>

          {/* Trade-in — a separate, manually priced request rather than an
              instant discount on this product. */}
          <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4">
            {tradeInRef ? (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-[#16A34A]">
                  <Check className="size-4 stroke-[3]" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-900">Trade-in request submitted</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">
                    Reference <span className="font-mono font-bold text-slate-900">{tradeInRef}</span>. Our
                    team will review your device and contact you with an offer.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-900">Have an old device?</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-600">
                    Send us the details and our team will come back with an offer.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWizardOpen(true)}
                    className="min-h-11 shrink-0 rounded-xl border border-[#16A34A]/40 bg-white px-4 py-2.5 text-xs font-extrabold text-[#16A34A] transition-colors hover:bg-emerald-50 cursor-pointer"
                  >
                    Start a trade-in
                  </button>
                  <a
                    href={WHATSAPP.getUrl(`Hello ${BRAND}, I have a question about ${product.name} (SKU: ${sku}).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-white px-4 py-2.5 text-xs font-extrabold text-emerald-700 transition-colors hover:bg-emerald-50"
                  >
                    <MessageCircle className="size-4 text-[#25D366]" />
                    <span>Ask on WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Render Exchange Wizard Modal */}
          {wizardOpen && (
            <ExchangeWizard
              productId={product.id}
              productName={product.name}
              submitting={submittingTradeIn}
              onClose={() => setWizardOpen(false)}
              onComplete={handleTradeInSubmit}
            />
          )}

          {/* Mobile Fixed Sticky Action Bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-slate-200/90 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden dark:border-border dark:bg-card/95">
            <div className="flex min-w-0 flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {ts(stock.tone, { count: stock.count })}
              </span>
              <span className="truncate text-base font-black text-slate-900 dark:text-white">
                {formatPrice(priceCents)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                document.querySelector<HTMLButtonElement>("#add-to-cart-trigger")?.click();
              }}
              disabled={stockCount <= 0}
              className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-[#2E6F40] px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition-opacity disabled:opacity-50 cursor-pointer"
            >
              <span>{stockCount > 0 ? "Add to cart" : "Out of stock"}</span>
            </button>
          </div>

          {/* Guarantee Badges */}
          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
            <Assurance
              icon={ShieldCheck}
              title={t("warrantyMonths", { count: warrantyMonths })}
              detail={t("warrantyCoverage")}
            />
            <Assurance
              icon={Award}
              title={tcond(condition)}
              detail={t("certifiedDetail")}
            />
            <Assurance
              icon={Truck}
              title={t("expressTitle")}
              detail={t("expressDetail")}
            />
            <Assurance
              icon={RotateCcw}
              title={t("returnsTitle")}
              detail={t("returnsDetail")}
            />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Assurance({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#16A34A]">
        <Icon className="size-4" strokeWidth={2.2} />
      </span>
      <div>
        <dt className="text-xs font-bold text-slate-900">{title}</dt>
        <dd className="mt-0.5 text-[11px] text-slate-500">{detail}</dd>
      </div>
    </div>
  );
}
