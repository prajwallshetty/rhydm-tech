"use client";

import { Link } from "@/i18n/navigation";
import { Check, CreditCard, Loader2, Truck, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { getCartProducts, type CartProduct } from "@/app/(site)/[locale]/(refurbished)/refurbished/cart/actions";
import { placeOrder, getCheckoutUserDataAction } from "@/app/(site)/[locale]/(refurbished)/refurbished/checkout/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatPriceExact } from "@/lib/format";
import { useStore } from "@/lib/store/cart";
import {
  EXPRESS_SHIPPING_CENTS,
  calculateTotals,
  type DeliveryMethod,
} from "@/lib/store/totals";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/checkout";
import { cn } from "@/lib/utils";

const STEP_KEYS = ["stepDetails", "stepShipping", "stepDelivery", "stepReview"] as const;

const EMPTY_FORM = {
  email: "",
  phone: "",
  company: "",
  shipping: {
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "Germany",
  },
  delivery: "standard" as DeliveryMethod,
  notes: "",
};

export default function CheckoutPage() {
  const cart = useStore((s) => s.cart);
  const clearCart = useStore((s) => s.clearCart);
  const t = useTranslations("store.checkout");
  const tv = useTranslations("store.checkout.validation");

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    orderNumber: string;
    totalCents: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Load pre-filled user details if authenticated
    getCheckoutUserDataAction().then((userData) => {
      if (!cancelled && userData) {
        setForm((prev) => ({
          ...prev,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
          company: userData.company || prev.company,
          shipping: userData.shipping.fullName ? userData.shipping : prev.shipping,
        }));
      }
    });

    getCartProducts(cart.map((l) => l.slug)).then((resolved) => {
      if (!cancelled) {
        setProducts(resolved);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cart]);


  const lines = cart
    .map((line) => {
      const product = products.find((p) => p.slug === line.slug);
      return product ? { ...line, product } : null;
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const subtotalCents = lines.reduce(
    (total, line) => total + line.product.priceCents * line.quantity,
    0,
  );
  const totals = calculateTotals({ subtotalCents, delivery: form.delivery });

  function validateStep(current: number) {
    const next: Record<string, string> = {};

    if (current === 0) {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
        next.email = t("emailInvalid");
      }
    }

    if (current === 1) {
      const result = checkoutSchema.shape.shipping.safeParse(form.shipping);
      if (!result.success) {
        for (const issue of result.error.issues) {
          // Zod paths can contain symbols; coerce for the error key. The
          // English zod message is a fallback; the localized copy is keyed by
          // field name so it switches with the active locale.
          const field = String(issue.path[0]);
          const key = `validation.${field}`;
          next[`shipping.${field}`] = tv.has(field) ? t(key) : t("validation.generic");
        }
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    setSubmitting(true);
    setFormError(null);

    const payload: CheckoutInput = {
      ...form,
      lines: cart.map((line) => ({ slug: line.slug, quantity: line.quantity })),
    };

    const result = await placeOrder(payload);
    setSubmitting(false);

    if (result.ok) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setConfirmation({
        orderNumber: result.orderNumber,
        totalCents: result.totalCents,
      });
      clearCart();
      return;
    }

    setFormError(result.error);
  }

  // --- Confirmation -------------------------------------------------------
  if (confirmation) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-36 pb-24 text-center">
        {/* Animated Pop-in Checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-100 shadow-sm"
        >
          <Check className="size-8" strokeWidth={3} />
        </motion.div>

        {/* Animated Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-3xl font-extrabold tracking-tight text-[#0F172A]"
        >
          {t("orderPlaced")}
        </motion.h1>

        {/* Animated Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md mx-auto"
        >
          {t.rich("confirmationBody", {
            email: form.email,
            strong: (chunks) => (
              <span className="font-semibold text-slate-900">{chunks}</span>
            ),
          })}
        </motion.p>

        {/* Animated Order Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm text-left max-w-md mx-auto"
        >
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">{t("orderNumber")}</span>
            <span className="font-mono font-bold text-slate-900">
              {confirmation.orderNumber}
            </span>
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-slate-500 font-medium">{t("total")}</span>
            <span className="font-extrabold text-[#16A34A]">
              {formatPriceExact(confirmation.totalCents)}
            </span>
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-500">
            {t("paymentContact")}
          </div>
        </motion.div>

        {/* Animated Button Links */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <ButtonLink href="/refurbished/shop" size="lg" className="rounded-xl">
            {t("continueShopping")}
          </ButtonLink>
          <ButtonLink href="/refurbished/account?tab=orders" variant="outline" size="lg" className="rounded-xl">
            {t("viewOrders")}
          </ButtonLink>
        </motion.div>
      </div>
    );
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
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("nothingTitle")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("nothingBody")}
        </p>
        <ButtonLink href="/refurbished/shop" className="mt-8">
          {t("browseProducts")}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>

      {/* Stepper */}
      <ol className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
        {STEP_KEYS.map((stepKey, index) => (
          <li key={stepKey} className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full text-xs font-semibold transition-colors",
                index < step && "bg-brand text-brand-foreground",
                index === step && "bg-brand text-brand-foreground",
                index > step && "bg-muted text-muted-foreground",
              )}
            >
              {index < step ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <span
              className={cn(
                "text-sm",
                index === step ? "font-medium" : "text-muted-foreground",
              )}
            >
              {t(stepKey)}
            </span>
            {index < STEP_KEYS.length - 1 && (
              <span aria-hidden className="mx-2 h-px w-6 bg-border sm:w-10" />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
          {step === 0 && (
            <Fieldset title={t("customerDetails")}>
              <Input
                label={t("email")}
                id="email"
                type="email"
                value={form.email}
                error={errors.email}
                onChange={(v) => setForm({ ...form, email: v })}
                required
              />
              <Input
                label={t("phone")}
                id="phone"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
              <Input
                label={t("company")}
                id="company"
                value={form.company}
                onChange={(v) => setForm({ ...form, company: v })}
              />
            </Fieldset>
          )}

          {step === 1 && (
            <Fieldset title={t("shippingAddress")}>
              <Input
                label={t("fullName")}
                id="fullName"
                value={form.shipping.fullName}
                error={errors["shipping.fullName"]}
                onChange={(v) =>
                  setForm({ ...form, shipping: { ...form.shipping, fullName: v } })
                }
                required
              />
              <Input
                label={t("line1")}
                id="line1"
                value={form.shipping.line1}
                error={errors["shipping.line1"]}
                onChange={(v) =>
                  setForm({ ...form, shipping: { ...form.shipping, line1: v } })
                }
                required
              />
              <Input
                label={t("line2")}
                id="line2"
                value={form.shipping.line2}
                onChange={(v) =>
                  setForm({ ...form, shipping: { ...form.shipping, line2: v } })
                }
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label={t("city")}
                  id="city"
                  value={form.shipping.city}
                  error={errors["shipping.city"]}
                  onChange={(v) =>
                    setForm({ ...form, shipping: { ...form.shipping, city: v } })
                  }
                  required
                />
                <Input
                  label={t("region")}
                  id="region"
                  value={form.shipping.region}
                  error={errors["shipping.region"]}
                  onChange={(v) =>
                    setForm({ ...form, shipping: { ...form.shipping, region: v } })
                  }
                  required
                />
                <Input
                  label={t("postalCode")}
                  id="postalCode"
                  value={form.shipping.postalCode}
                  error={errors["shipping.postalCode"]}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      shipping: { ...form.shipping, postalCode: v },
                    })
                  }
                  required
                />
                <Input
                  label={t("country")}
                  id="country"
                  value={form.shipping.country}
                  onChange={(v) =>
                    setForm({ ...form, shipping: { ...form.shipping, country: v } })
                  }
                />
              </div>
            </Fieldset>
          )}

          {step === 2 && (
            <Fieldset title={t("deliveryMethod")}>
              <DeliveryOption
                icon={Truck}
                title={t("standard")}
                detail={t("standardTime")}
                price={
                  subtotalCents >= 50_000 ? t("free") : formatPriceExact(1_900)
                }
                selected={form.delivery === "standard"}
                onSelect={() => setForm({ ...form, delivery: "standard" })}
              />
              <DeliveryOption
                icon={Zap}
                title={t("express")}
                detail={t("expressTime")}
                price={formatPriceExact(EXPRESS_SHIPPING_CENTS)}
                selected={form.delivery === "express"}
                onSelect={() => setForm({ ...form, delivery: "express" })}
              />

              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium">
                  {t("notes")}
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={t("notesPlaceholder")}
                  className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:border-brand"
                />
              </div>
            </Fieldset>
          )}

          {step === 3 && (
            <div className="space-y-7">
              <h2 className="text-lg font-medium">{t("review")}</h2>

              <ReviewBlock title={t("contact")}>
                {form.email}
                {form.phone && <> · {form.phone}</>}
                {form.company && <> · {form.company}</>}
              </ReviewBlock>

              <ReviewBlock title={t("shippingTo")}>
                {form.shipping.fullName}
                <br />
                {form.shipping.line1}
                {form.shipping.line2 && (
                  <>
                    <br />
                    {form.shipping.line2}
                  </>
                )}
                <br />
                {form.shipping.city}, {form.shipping.region}{" "}
                {form.shipping.postalCode}
                <br />
                {form.shipping.country}
              </ReviewBlock>

              <ReviewBlock title={t("delivery")}>
                {form.delivery === "express"
                  ? `${t("express")} — ${t("expressTime")}`
                  : `${t("standard")} — ${t("standardTime")}`}
              </ReviewBlock>

              <div>
                <h3 className="text-sm font-medium">{t("items")}</h3>
                <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                  {lines.map((line) => (
                    <li
                      key={line.slug}
                      className="flex justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <span>
                        {line.product.name}
                        <span className="text-muted-foreground">
                          {" "}
                          × {line.quantity}
                        </span>
                      </span>
                      <span className="font-medium">
                        {formatPriceExact(
                          line.product.priceCents * line.quantity,
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment placeholder, per the brief. */}
              <div className="flex gap-3 rounded-xl border border-border bg-muted/50 p-5">
                <CreditCard
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  strokeWidth={1.6}
                />
                <div>
                  <p className="text-sm font-medium">
                    {t("paymentSoonTitle")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("paymentSoonBody")}
                  </p>
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}
            </div>
          )}

          {/* Step controls */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submitting}
            >
              {t("back")}
            </Button>

            {step < STEP_KEYS.length - 1 ? (
              <Button
                onClick={() => {
                  if (validateStep(step)) setStep((s) => s + 1);
                }}
              >
                {t("continue")}
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting} size="lg">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting ? t("placing") : t("placeOrder")}
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-border/80 bg-card p-6">
            <h2 className="text-lg font-medium">{t("summary")}</h2>
            <div className="mt-5 space-y-3 text-sm">
              <SummaryRow
                label={t("subtotalCount", { count: lines.length })}
                value={formatPriceExact(totals.subtotalCents)}
              />
              <SummaryRow
                label={t("shipping")}
                value={
                  totals.shippingCents === 0
                    ? t("free")
                    : formatPriceExact(totals.shippingCents)
                }
              />
              <SummaryRow
                label={t("tax")}
                value={formatPriceExact(totals.taxCents)}
              />
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">{t("total")}</span>
                  <span className="text-base font-semibold">
                    {formatPriceExact(totals.totalCents)}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/refurbished/cart"
              className="mt-5 block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("editCart")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Fieldset({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-medium">{title}</h2>
      {children}
    </div>
  );
}

function Input({
  label,
  id,
  value,
  onChange,
  error,
  type = "text",
  required,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-brand">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus-visible:border-brand"
      />
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function DeliveryOption({
  icon: Icon,
  title,
  detail,
  price,
  selected,
  onSelect,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
  price: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border p-5 text-left transition-colors",
        selected ? "border-brand bg-brand-muted/40" : "border-border hover:bg-accent",
      )}
    >
      <Icon aria-hidden className="size-5 shrink-0 text-brand" strokeWidth={1.6} />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <span className="text-sm font-medium">{price}</span>
    </button>
  );
}

function ReviewBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
