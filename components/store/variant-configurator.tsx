"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Check, ShieldCheck, Award, Truck, RotateCcw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

import { ProductGallery } from "@/components/store/product-gallery";
import { AddToCart } from "@/components/store/add-to-cart";
import { RatingStars } from "@/components/store/rating-stars";
import { formatPrice, discountPercent, stockLabel } from "@/lib/format";
import { ProductWithVariantsDTO, ProductVariantDTO } from "@/lib/data/variant-utils";
import { cn } from "@/lib/utils";
import { ExchangeWizard } from "@/components/store/exchange-wizard";

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
  const [purchaseMode, setPurchaseMode] = useState<"buy" | "exchange">("buy");
  const [activeExchange, setActiveExchange] = useState<any | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

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

          {/* Exchange badge */}
          <div className="mt-4 flex items-center gap-1.5">
            <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              Exchange Available
            </span>
            <span className="text-xs font-medium text-slate-500">Trade in old tech for instant store credit</span>
          </div>

          {/* Price Header with Discount */}
          <div className="mt-6 flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {formatPrice(purchaseMode === "exchange" && activeExchange
                  ? Math.max(priceCents - activeExchange.estimatedValueCents, 0)
                  : priceCents
                )}
              </span>
              {compareAtCents != null && purchaseMode === "buy" && (
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

            {purchaseMode === "exchange" && activeExchange && (
              <div className="text-xs font-medium text-slate-500 flex flex-col gap-0.5 border-l-2 border-emerald-500 pl-3.5 py-0.5 mt-1">
                <div className="flex justify-between w-64">
                  <span>Product price:</span>
                  <span className="font-semibold text-slate-700">{formatPrice(priceCents)}</span>
                </div>
                <div className="flex justify-between w-64 text-[#16A34A]">
                  <span>Exchange credit:</span>
                  <span className="font-semibold">-{formatPrice(activeExchange.estimatedValueCents)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Premium Segmented Buttons */}
          <div className="mt-6 p-1 bg-slate-100 rounded-xl flex gap-1 border border-slate-200/40">
            <button
              type="button"
              onClick={() => setPurchaseMode("buy")}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg text-xs font-extrabold transition-all cursor-pointer",
                purchaseMode === "buy"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Buy Now
            </button>
            <button
              type="button"
              onClick={() => {
                setPurchaseMode("exchange");
                if (!activeExchange) {
                  setWizardOpen(true);
                }
              }}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                purchaseMode === "exchange"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <span>Exchange Device</span>
              <span className="bg-[#16A34A] text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                Save €
              </span>
            </button>
          </div>

          {/* Active Exchange Details summary */}
          {purchaseMode === "exchange" && activeExchange && (
            <div className="mt-4 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800">Selected Trade-in</h4>
                  <p className="text-sm font-bold text-slate-950 mt-1">
                    {activeExchange.brand} {activeExchange.model} ({activeExchange.condition})
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Estimated Credit: <span className="font-extrabold text-[#16A34A]">{formatPrice(activeExchange.estimatedValueCents)}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWizardOpen(true)}
                    className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveExchange(null);
                      setPurchaseMode("buy");
                    }}
                    className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}

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
              tradeIn={purchaseMode === "exchange" ? activeExchange : null}
            />
          </div>

          {/* Render Exchange Wizard Modal */}
          {wizardOpen && (
            <ExchangeWizard
              productId={product.id}
              productName={product.name}
              productPriceCents={priceCents}
              onClose={() => {
                setWizardOpen(false);
                if (!activeExchange) setPurchaseMode("buy");
              }}
              onComplete={(data) => {
                setActiveExchange(data);
                setPurchaseMode("exchange");
                setWizardOpen(false);
              }}
            />
          )}

          {/* Mobile Fixed Sticky Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-card/95 border-t border-slate-200/90 dark:border-border p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl flex items-center justify-between gap-2 lg:hidden">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</span>
              <span className="text-base font-black text-slate-900 dark:text-white truncate">
                {formatPrice(purchaseMode === "exchange" && activeExchange
                  ? Math.max(priceCents - activeExchange.estimatedValueCents, 0)
                  : priceCents
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPurchaseMode("exchange");
                  setWizardOpen(true);
                }}
                className="flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 px-3 py-2.5 text-xs font-extrabold text-[#16A34A] cursor-pointer"
              >
                <span>Exchange</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  // Direct Buy Trigger / Add to Cart
                  const btn = document.querySelector("#add-to-cart-trigger") as HTMLButtonElement;
                  if (btn) btn.click();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#2E6F40] px-4 py-2.5 text-xs font-extrabold text-white shadow-md cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>
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
