"use client";

import { Link } from "@/i18n/navigation";
import { Check, CreditCard, Loader2, Truck, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

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

const STEPS = ["Details", "Shipping", "Delivery", "Review"] as const;

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
    country: "US",
  },
  delivery: "standard" as DeliveryMethod,
  notes: "",
};

export default function CheckoutPage() {
  const cart = useStore((s) => s.cart);
  const clearCart = useStore((s) => s.clearCart);

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
        next.email = "Please enter a valid email address.";
      }
    }

    if (current === 1) {
      const result = checkoutSchema.shape.shipping.safeParse(form.shipping);
      if (!result.success) {
        for (const issue of result.error.issues) {
          // Zod paths can contain symbols; coerce for the error key.
          next[`shipping.${String(issue.path[0])}`] = issue.message;
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
          Order placed
        </motion.h1>

        {/* Animated Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md mx-auto"
        >
          Thanks — we&rsquo;ve recorded your order and emailed a copy to{" "}
          <span className="font-semibold text-slate-900">{form.email}</span>.
        </motion.p>

        {/* Animated Order Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm text-left max-w-md mx-auto"
        >
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Order number</span>
            <span className="font-mono font-bold text-slate-900">
              {confirmation.orderNumber}
            </span>
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Total</span>
            <span className="font-extrabold text-[#16A34A]">
              {formatPriceExact(confirmation.totalCents)}
            </span>
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-500">
            Online payment integration is coming soon. Our team will contact you
            to arrange payment before dispatch.
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
            Continue shopping
          </ButtonLink>
          <ButtonLink href="/refurbished/account?tab=orders" variant="outline" size="lg" className="rounded-xl">
            View orders
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
          Nothing to check out
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your cart is empty — add something first.
        </p>
        <ButtonLink href="/refurbished/shop" className="mt-8">
          Browse products
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Checkout
      </h1>

      {/* Stepper */}
      <ol className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
        {STEPS.map((label, index) => (
          <li key={label} className="flex items-center gap-2">
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
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <span aria-hidden className="mx-2 h-px w-6 bg-border sm:w-10" />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
          {step === 0 && (
            <Fieldset title="Customer details">
              <Input
                label="Email"
                id="email"
                type="email"
                value={form.email}
                error={errors.email}
                onChange={(v) => setForm({ ...form, email: v })}
                required
              />
              <Input
                label="Phone"
                id="phone"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
              <Input
                label="Company"
                id="company"
                value={form.company}
                onChange={(v) => setForm({ ...form, company: v })}
              />
            </Fieldset>
          )}

          {step === 1 && (
            <Fieldset title="Shipping address">
              <Input
                label="Full name"
                id="fullName"
                value={form.shipping.fullName}
                error={errors["shipping.fullName"]}
                onChange={(v) =>
                  setForm({ ...form, shipping: { ...form.shipping, fullName: v } })
                }
                required
              />
              <Input
                label="Address line 1"
                id="line1"
                value={form.shipping.line1}
                error={errors["shipping.line1"]}
                onChange={(v) =>
                  setForm({ ...form, shipping: { ...form.shipping, line1: v } })
                }
                required
              />
              <Input
                label="Address line 2"
                id="line2"
                value={form.shipping.line2}
                onChange={(v) =>
                  setForm({ ...form, shipping: { ...form.shipping, line2: v } })
                }
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="City"
                  id="city"
                  value={form.shipping.city}
                  error={errors["shipping.city"]}
                  onChange={(v) =>
                    setForm({ ...form, shipping: { ...form.shipping, city: v } })
                  }
                  required
                />
                <Input
                  label="State / Region"
                  id="region"
                  value={form.shipping.region}
                  error={errors["shipping.region"]}
                  onChange={(v) =>
                    setForm({ ...form, shipping: { ...form.shipping, region: v } })
                  }
                  required
                />
                <Input
                  label="Postal code"
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
                  label="Country"
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
            <Fieldset title="Delivery method">
              <DeliveryOption
                icon={Truck}
                title="Standard delivery"
                detail="3–5 business days"
                price={
                  subtotalCents >= 50_000 ? "Free" : formatPriceExact(1_900)
                }
                selected={form.delivery === "standard"}
                onSelect={() => setForm({ ...form, delivery: "standard" })}
              />
              <DeliveryOption
                icon={Zap}
                title="Express delivery"
                detail="1–2 business days"
                price={formatPriceExact(EXPRESS_SHIPPING_CENTS)}
                selected={form.delivery === "express"}
                onSelect={() => setForm({ ...form, delivery: "express" })}
              />

              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium">
                  Delivery notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Loading dock access, delivery window, site contact…"
                  className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:border-brand"
                />
              </div>
            </Fieldset>
          )}

          {step === 3 && (
            <div className="space-y-7">
              <h2 className="text-lg font-medium">Review your order</h2>

              <ReviewBlock title="Contact">
                {form.email}
                {form.phone && <> · {form.phone}</>}
                {form.company && <> · {form.company}</>}
              </ReviewBlock>

              <ReviewBlock title="Shipping to">
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

              <ReviewBlock title="Delivery">
                {form.delivery === "express"
                  ? "Express — 1–2 business days"
                  : "Standard — 3–5 business days"}
              </ReviewBlock>

              <div>
                <h3 className="text-sm font-medium">Items</h3>
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
                    Online payment integration coming soon
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Placing this order records it for our team, who will contact
                    you to arrange payment before dispatch. No card details are
                    collected.
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
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => {
                  if (validateStep(step)) setStep((s) => s + 1);
                }}
              >
                Continue
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting} size="lg">
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting ? "Placing order…" : "Place order"}
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-border/80 bg-card p-6">
            <h2 className="text-lg font-medium">Summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              <SummaryRow
                label={`Subtotal (${lines.length})`}
                value={formatPriceExact(totals.subtotalCents)}
              />
              <SummaryRow
                label="Shipping"
                value={
                  totals.shippingCents === 0
                    ? "Free"
                    : formatPriceExact(totals.shippingCents)
                }
              />
              <SummaryRow
                label="Estimated tax"
                value={formatPriceExact(totals.taxCents)}
              />
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
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
              Edit cart
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
