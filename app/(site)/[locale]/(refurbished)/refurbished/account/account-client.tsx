"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Building2,
  Check,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";

import { ProductThumb } from "@/components/store/product-thumb";
import { useToast } from "@/components/ui/toast";
import { formatPriceExact } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  addAddressAction,
  changePasswordAction,
  deleteAddressAction,
  logoutAction,
  setDefaultAddressAction,
  updateProfileAction,
} from "@/app/(backend)/(auth)/actions";

type Tab = "overview" | "orders" | "addresses" | "profile" | "security";

export interface SerializedOrder {
  id: string;
  orderNumber: string;
  createdAtStr: string;
  status: string;
  totalCents: number;
  items: Array<{
    id: string;
    name: string;
    sku: string;
    priceCents: number;
    quantity: number;
    slug: string;
    categorySlug: string;
    /** From the product; null when the product no longer exists. */
    warrantyMonths: number | null;
  }>;
}

export interface SerializedAddress {
  id: string;
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AccountClientProps {
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email: string;
    phone?: string | null;
    company?: string | null;
    role: string;
  };
  initialOrders: SerializedOrder[];
  initialAddresses: SerializedAddress[];
}

const NAV: { id: Tab; labelKey: string; icon: React.ElementType }[] = [
  { id: "overview", labelKey: "navOverview", icon: User },
  { id: "orders", labelKey: "navOrders", icon: Package },
  { id: "addresses", labelKey: "navAddresses", icon: MapPin },
  { id: "profile", labelKey: "navProfile", icon: Building2 },
  { id: "security", labelKey: "navSecurity", icon: Lock },
];

/**
 * Order status → visual tone. Every status previously rendered as a green
 * check, which told customers a PENDING order was complete.
 */
const STATUS_BADGE: Record<string, string> = {
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SHIPPED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PENDING: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#2E6F40] focus:ring-2 focus:ring-[#2E6F40]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export function AccountClient({
  user,
  initialOrders,
  initialAddresses,
}: AccountClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab");
  const parsedTab = (rawTab === "address" ? "addresses" : (rawTab as Tab)) || "overview";
  const initialTab: Tab = ["overview", "orders", "addresses", "profile", "security"].includes(parsedTab)
    ? parsedTab
    : "overview";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const pushToast = useToast((s) => s.push);
  const t = useTranslations("account");

  useEffect(() => {
    const currentRaw = searchParams.get("tab");
    if (!currentRaw) return;
    const tabParam = (currentRaw === "address" ? "addresses" : currentRaw) as Tab;
    if (["overview", "orders", "addresses", "profile", "security"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tabId);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  const [profile, setProfile] = useState({
    firstName: user.firstName || user.name?.split(" ")[0] || "",
    lastName: user.lastName || user.name?.split(" ").slice(1).join(" ") || "",
    email: user.email,
    phone: user.phone || "",
    company: user.company || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [orders] = useState<SerializedOrder[]>(initialOrders);
  const [addresses, setAddresses] =
    useState<SerializedAddress[]>(initialAddresses);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  /** Two-step delete: first click arms, second confirms. */
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName =
    `${profile.firstName} ${profile.lastName}`.trim() ||
    user.name ||
    user.email.split("@")[0];
  const displayInitials =
    ((profile.firstName[0] || "") + (profile.lastName[0] || "")).toUpperCase() ||
    user.email.slice(0, 2).toUpperCase();

  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
  const totalSpentCents = orders.reduce((sum, o) => sum + o.totalCents, 0);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);

    const formData = new FormData();
    formData.append("firstName", profile.firstName);
    formData.append("lastName", profile.lastName);
    formData.append("phone", profile.phone);
    formData.append("company", profile.company);

    const res = await updateProfileAction(formData);
    setSavingProfile(false);

    if (res?.error) pushToast(t("errorPrefix", { error: res.error }));
    else pushToast(t("profileUpdated"));
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordError(t("passwordsMismatch"));
      return;
    }
    if (passwordState.newPassword.length < 8) {
      setPasswordError(t("passwordTooShort"));
      return;
    }

    setSavingPassword(true);
    const formData = new FormData();
    formData.append("currentPassword", passwordState.currentPassword);
    formData.append("newPassword", passwordState.newPassword);
    formData.append("confirmPassword", passwordState.confirmPassword);

    const res = await changePasswordAction(formData);
    setSavingPassword(false);

    if (res?.error) {
      setPasswordError(res.error);
    } else {
      pushToast(t("passwordUpdated"));
      setPasswordState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }

  async function handleAddAddress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingAddress(true);

    const res = await addAddressAction(new FormData(e.currentTarget));
    setSavingAddress(false);

    if (res?.error) {
      pushToast(t("errorPrefix", { error: res.error }));
      return;
    }

    pushToast(t("addressSaved"));
    setShowAddressForm(false);
    if (res?.address) {
      const saved = res.address;
      setAddresses((prev) => [
        ...(saved.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev),
        ...(saved.isDefault ? [] : []),
        saved,
      ].filter((a, i, arr) => arr.findIndex((b) => b.id === a.id) === i));
    }
  }

  async function handleSetDefault(addressId: string) {
    const res = await setDefaultAddressAction(addressId);
    if (res?.success) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === addressId })),
      );
      pushToast(t("defaultUpdated"));
    }
  }

  async function handleDeleteAddress(addressId: string) {
    if (confirmingDelete !== addressId) {
      setConfirmingDelete(addressId);
      return;
    }
    setConfirmingDelete(null);
    const res = await deleteAddressAction(addressId);
    if (res?.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      pushToast(t("addressDeleted"));
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    // logoutAction returns { success, redirectUrl } rather than redirecting
    // itself, so navigation happens here.
    const res = await logoutAction();
    window.location.assign(res?.redirectUrl || "/login");
  }

  return (
    // Top clearance comes from the store layout (pt-24); adding more here
    // previously doubled the gap under the floating nav.
    <div className="bg-slate-50/60 pb-20 pt-4 text-slate-900">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          {/* ---------------------------------------------------------------- */}
          {/* Sidebar */}
          {/* ---------------------------------------------------------------- */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3.5">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#2E6F40] text-base font-extrabold text-white">
                  {displayInitials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{displayName}</p>
                  <p className="truncate text-xs text-slate-500">
                    {profile.email}
                  </p>
                </div>
              </div>

              <nav
                aria-label={t("sections")}
                className="mt-5 flex gap-1 overflow-x-auto border-t border-slate-100 pt-4 lg:flex-col lg:overflow-visible"
              >
                {NAV.map((item) => {
                  const active = activeTab === item.id;
                  const count =
                    item.id === "orders"
                      ? orders.length
                      : item.id === "addresses"
                        ? addresses.length
                        : null;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabChange(item.id)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors lg:w-full",
                        active
                          ? "bg-[#2E6F40]/10 text-[#2E6F40]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      <item.icon className="size-4" strokeWidth={2} />
                      <span className="flex-1 text-left">{t(item.labelKey)}</span>
                      {count != null && count > 0 && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold",
                            active
                              ? "bg-[#2E6F40] text-white"
                              : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  {loggingOut ? (
                    <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <LogOut className="size-4" strokeWidth={2} />
                  )}
                  {loggingOut ? t("signingOut") : t("signOut")}
                </button>
              </div>
            </div>
          </aside>

          {/* ---------------------------------------------------------------- */}
          {/* Content */}
          {/* ---------------------------------------------------------------- */}
          <AnimatePresence mode="wait">
            <motion.main
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="min-w-0"
            >
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Real stats only — no invented "Priority support" tiles. */}
                  <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-3">
                    <StatCard label={t("ordersPlaced")} value={String(orders.length)} />
                    <StatCard
                      label={t("totalSpent")}
                      value={formatPriceExact(totalSpentCents)}
                    />
                    <StatCard
                      label={t("savedAddresses")}
                      value={String(addresses.length)}
                    />
                  </div>

                  <SectionCard
                    title={t("recentOrders")}
                    action={
                      orders.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setActiveTab("orders")}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#2E6F40] hover:underline"
                        >
                          {t("viewAll")} <ArrowRight className="size-3" />
                        </button>
                      ) : null
                    }
                  >
                    {orders.length === 0 ? (
                      <EmptyState
                        icon={Package}
                        title={t("noOrdersYetTitle")}
                        body={t("noOrdersYetBody")}
                        cta={{ href: "/refurbished/shop", label: t("browseShop") }}
                      />
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {orders.slice(0, 3).map((order) => (
                          <li
                            key={order.id}
                            className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                          >
                            <div className="min-w-0">
                              <p className="font-mono text-sm font-bold">
                                {order.orderNumber}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {order.createdAtStr} ·{" "}
                                {t("itemCount", { count: order.items.length })}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <StatusBadge status={order.status} />
                              <span className="text-sm font-bold">
                                {formatPriceExact(order.totalCents)}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </SectionCard>

                  <div className="grid gap-6 md:grid-cols-2">
                    <SectionCard
                      title={t("defaultAddress")}
                      action={
                        <button
                          type="button"
                          onClick={() => setActiveTab("addresses")}
                          className="text-xs font-bold text-[#2E6F40] hover:underline"
                        >
                          {t("manage")}
                        </button>
                      }
                    >
                      {defaultAddr ? (
                        <address className="text-sm not-italic leading-relaxed text-slate-600">
                          <span className="font-semibold text-slate-900">
                            {defaultAddr.fullName}
                          </span>
                          <br />
                          {defaultAddr.line1}
                          {defaultAddr.line2 && <>, {defaultAddr.line2}</>}
                          <br />
                          {defaultAddr.city}, {defaultAddr.region}{" "}
                          {defaultAddr.postalCode}
                        </address>
                      ) : (
                        <p className="text-sm text-slate-500">
                          {t("noAddressesYet")}
                        </p>
                      )}
                    </SectionCard>

                    <div className="rounded-2xl border border-[#2E6F40]/25 bg-gradient-to-br from-[#2E6F40]/10 to-transparent p-6">
                      <h3 className="text-sm font-bold">
                        {t("retiringTitle")}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        {t("retiringBody")}
                      </p>
                      <Link
                        href="/disposal/contact"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#2E6F40] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#255833]"
                      >
                        {t("requestPickup")} <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <SectionCard title={t("ordersTitle")}>
                      <EmptyState
                        icon={Package}
                        title={t("noOrdersFoundTitle")}
                        body={t("noOrdersFoundBody")}
                        cta={{ href: "/refurbished/shop", label: t("browseCatalog") }}
                      />
                    </SectionCard>
                  ) : (
                    orders.map((order) => (
                      <article
                        key={order.id}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div>
                            <p className="font-mono text-sm font-bold">
                              {order.orderNumber}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {t("placed", { date: order.createdAtStr })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={order.status} />
                            <span className="text-sm font-extrabold">
                              {formatPriceExact(order.totalCents)}
                            </span>
                          </div>
                        </header>

                        <ul className="divide-y divide-slate-100">
                          {order.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center gap-4 py-4 last:pb-0"
                            >
                              <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2">
                                <ProductThumb
                                  slug={item.slug}
                                  category={item.categorySlug}
                                  name={item.name}
                                  className="size-full object-contain"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold">
                                  {item.name}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {t("qtyLine", {
                                    qty: item.quantity,
                                    price: formatPriceExact(item.priceCents),
                                    sku: item.sku,
                                  })}
                                </p>
                                {item.warrantyMonths != null && (
                                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-[#2E6F40]/10 px-2 py-0.5 text-[11px] font-bold text-[#2E6F40]">
                                    <ShieldCheck className="size-3" />
                                    {t("warrantyMonths", { count: item.warrantyMonths })}
                                  </span>
                                )}
                              </div>
                              {item.slug && (
                                <Link
                                  href={`/refurbished/products/${item.slug}`}
                                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold transition-colors hover:border-[#2E6F40]/40 hover:text-[#2E6F40]"
                                >
                                  <RotateCcw className="size-3" />
                                  {t("buyAgain")}
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))
                  )}
                </div>
              )}

              {activeTab === "addresses" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">{t("savedAddressesTitle")}</h2>
                    {!showAddressForm && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#2E6F40] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#255833]"
                      >
                        <Plus className="size-3.5" />
                        {t("addAddress")}
                      </button>
                    )}
                  </div>

                  {showAddressForm && (
                    <form
                      onSubmit={handleAddAddress}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="text-sm font-bold">{t("newAddress")}</h3>
                      <div className="mt-5 space-y-4">
                        <Field id="addr-fullName" label={t("fullName")} required>
                          <input
                            id="addr-fullName"
                            name="fullName"
                            required
                            autoComplete="name"
                            defaultValue={displayName}
                            className={inputClass}
                          />
                        </Field>
                        <Field id="addr-line1" label={t("line1")} required>
                          <input
                            id="addr-line1"
                            name="line1"
                            required
                            autoComplete="address-line1"
                            className={inputClass}
                          />
                        </Field>
                        <Field id="addr-line2" label={t("line2")}>
                          <input
                            id="addr-line2"
                            name="line2"
                            autoComplete="address-line2"
                            className={inputClass}
                          />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field id="addr-city" label={t("city")} required>
                            <input
                              id="addr-city"
                              name="city"
                              required
                              autoComplete="address-level2"
                              className={inputClass}
                            />
                          </Field>
                          <Field id="addr-region" label={t("region")} required>
                            <input
                              id="addr-region"
                              name="region"
                              required
                              autoComplete="address-level1"
                              className={inputClass}
                            />
                          </Field>
                          <Field id="addr-postal" label={t("postalCode")} required>
                            <input
                              id="addr-postal"
                              name="postalCode"
                              required
                              autoComplete="postal-code"
                              className={inputClass}
                            />
                          </Field>
                          <Field id="addr-country" label={t("country")}>
                            <input
                              id="addr-country"
                              name="country"
                              defaultValue="US"
                              autoComplete="country"
                              className={inputClass}
                            />
                          </Field>
                        </div>

                        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            name="isDefault"
                            className="size-4 rounded accent-[#2E6F40]"
                          />
                          {t("setAsDefaultShipping")}
                        </label>
                      </div>

                      <div className="mt-6 flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="inline-flex items-center gap-2 rounded-full bg-[#2E6F40] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#255833] disabled:opacity-50"
                        >
                          {savingAddress && (
                            <Loader2 className="size-3.5 animate-spin" />
                          )}
                          {savingAddress ? t("saving") : t("saveAddress")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="rounded-full border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          {t("cancel")}
                        </button>
                      </div>
                    </form>
                  )}

                  {addresses.length === 0 && !showAddressForm ? (
                    <SectionCard title="">
                      <EmptyState
                        icon={MapPin}
                        title={t("noAddressesTitle")}
                        body={t("noAddressesBody")}
                      />
                    </SectionCard>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={cn(
                            "relative rounded-2xl border bg-white p-5 shadow-sm transition-colors",
                            addr.isDefault
                              ? "border-[#2E6F40]/50 ring-1 ring-[#2E6F40]/20"
                              : "border-slate-200",
                          )}
                        >
                          {addr.isDefault && (
                            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#2E6F40]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2E6F40]">
                              <Check className="size-3" /> {t("default")}
                            </span>
                          )}
                          <address className="text-sm not-italic leading-relaxed text-slate-600">
                            <span className="font-bold text-slate-900">
                              {addr.fullName}
                            </span>
                            <br />
                            {addr.line1}
                            {addr.line2 && <>, {addr.line2}</>}
                            <br />
                            {addr.city}, {addr.region} {addr.postalCode}
                            <br />
                            {addr.country}
                          </address>

                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                            {!addr.isDefault ? (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(addr.id)}
                                className="text-xs font-bold text-[#2E6F40] hover:underline"
                              >
                                {t("setAsDefault")}
                              </button>
                            ) : (
                              <span />
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              onBlur={() => setConfirmingDelete(null)}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition-colors",
                                confirmingDelete === addr.id
                                  ? "bg-red-600 text-white"
                                  : "text-red-500 hover:bg-red-50",
                              )}
                            >
                              <Trash2 className="size-3.5" />
                              {confirmingDelete === addr.id
                                ? t("confirmDelete")
                                : t("delete")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "profile" && (
                <SectionCard title={t("profileTitle")}>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="pf-first" label={t("firstName")}>
                        <input
                          id="pf-first"
                          value={profile.firstName}
                          onChange={(e) =>
                            setProfile({ ...profile, firstName: e.target.value })
                          }
                          autoComplete="given-name"
                          className={inputClass}
                        />
                      </Field>
                      <Field id="pf-last" label={t("lastName")}>
                        <input
                          id="pf-last"
                          value={profile.lastName}
                          onChange={(e) =>
                            setProfile({ ...profile, lastName: e.target.value })
                          }
                          autoComplete="family-name"
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <Field
                      id="pf-email"
                      label={t("emailAddress")}
                      hint={t("emailHint")}
                    >
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id="pf-email"
                          type="email"
                          disabled
                          value={profile.email}
                          className={cn(inputClass, "pl-10")}
                        />
                      </div>
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="pf-phone" label={t("phone")}>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id="pf-phone"
                            type="tel"
                            value={profile.phone}
                            onChange={(e) =>
                              setProfile({ ...profile, phone: e.target.value })
                            }
                            autoComplete="tel"
                            placeholder="+1 (555) 000-0000"
                            className={cn(inputClass, "pl-10")}
                          />
                        </div>
                      </Field>
                      <Field id="pf-company" label={t("company")}>
                        <div className="relative">
                          <Building2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id="pf-company"
                            value={profile.company}
                            onChange={(e) =>
                              setProfile({ ...profile, company: e.target.value })
                            }
                            autoComplete="organization"
                            placeholder={t("companyPlaceholder")}
                            className={cn(inputClass, "pl-10")}
                          />
                        </div>
                      </Field>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="inline-flex items-center gap-2 rounded-full bg-[#2E6F40] px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#255833] disabled:opacity-50"
                      >
                        {savingProfile ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Save className="size-4" />
                        )}
                        {savingProfile ? t("savingChanges") : t("saveChanges")}
                      </button>
                    </div>
                  </form>
                </SectionCard>
              )}

              {activeTab === "security" && (
                <SectionCard title={t("changePassword")}>
                  <form onSubmit={handleSavePassword} className="space-y-4">
                    {passwordError && (
                      <p
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                      >
                        {passwordError}
                      </p>
                    )}

                    <Field id="pw-current" label={t("currentPassword")} required>
                      <input
                        id="pw-current"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={passwordState.currentPassword}
                        onChange={(e) =>
                          setPasswordState({
                            ...passwordState,
                            currentPassword: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        id="pw-new"
                        label={t("newPassword")}
                        hint={t("newPasswordHint")}
                        required
                      >
                        <input
                          id="pw-new"
                          type="password"
                          required
                          minLength={8}
                          autoComplete="new-password"
                          value={passwordState.newPassword}
                          onChange={(e) =>
                            setPasswordState({
                              ...passwordState,
                              newPassword: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </Field>
                      <Field id="pw-confirm" label={t("confirmPassword")} required>
                        <input
                          id="pw-confirm"
                          type="password"
                          required
                          minLength={8}
                          autoComplete="new-password"
                          value={passwordState.confirmPassword}
                          onChange={(e) =>
                            setPasswordState({
                              ...passwordState,
                              confirmPassword: e.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="inline-flex items-center gap-2 rounded-full bg-[#2E6F40] px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#255833] disabled:opacity-50"
                      >
                        {savingPassword && (
                          <Loader2 className="size-4 animate-spin" />
                        )}
                        {savingPassword ? t("updating") : t("updatePassword")}
                      </button>
                    </div>
                  </form>
                </SectionCard>
              )}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Field({
  id,
  label,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold text-slate-600">
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-[#2E6F40]">
            *
          </span>
        )}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1.5 truncate text-xl font-extrabold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("account");
  const key = `status_${status}`;
  const label = t.has(key)
    ? t(key)
    : status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
        STATUS_BADGE[status] ?? "bg-slate-100 text-slate-600 border-slate-200",
      )}
    >
      {label}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="py-8 text-center">
      <Icon className="mx-auto size-10 text-slate-300" strokeWidth={1.5} />
      <h3 className="mt-3 text-sm font-bold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
        {body}
      </p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#2E6F40] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#255833]"
        >
          {cta.label} <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  );
}
