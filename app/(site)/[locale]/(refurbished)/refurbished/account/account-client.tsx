"use client";

import { useState, useEffect } from "react";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Building2,
  Check,
  FileText,
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
  Calendar,
  Truck,
  Info,
  AlertTriangle,
  Upload,
  Camera,
} from "lucide-react";

import { ProductThumb } from "@/components/store/product-thumb";
import { useToast } from "@/components/ui/toast";
import { formatPriceExact } from "@/lib/format";
import {
  EXCHANGE_TONE_CLASSES,
  exchangeStatusLabel,
  exchangeStatusTone,
  isOfferVisibleToCustomer,
} from "@/lib/data/exchange-status";
import { cn } from "@/lib/utils";
import {
  addAddressAction,
  changePasswordAction,
  deleteAddressAction,
  logoutAction,
  setDefaultAddressAction,
  updateProfileAction,
} from "@/app/(backend)/(auth)/actions";
import {
  customerRespondToCounterAction,
  customerAddImagesAction,
  customerSchedulePickupAction,
  signExchangeUploadAction,
} from "@/app/actions/exchange";

type Tab = "overview" | "orders" | "exchanges" | "addresses" | "profile" | "security";

export interface SerializedOrder {
  id: string;
  orderNumber: string;
  createdAtStr: string;
  status: string;
  totalCents: number;
  paymentStatus?: string | null;
  paypalTransactionId?: string | null;
  paymentMethod?: string | null;
  currency?: string | null;
  paidAt?: string | null;
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
    imageUrl: string | null;
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
  initialExchanges?: any[];
}

const NAV: { id: Tab; labelKey: string; icon: React.ElementType }[] = [
  { id: "overview", labelKey: "navOverview", icon: User },
  { id: "orders", labelKey: "navOrders", icon: Package },
  { id: "exchanges", labelKey: "navExchanges", icon: RotateCcw },
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
  initialExchanges = [],
}: AccountClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rawTab = searchParams.get("tab");
  const parsedTab = (rawTab === "address" ? "addresses" : (rawTab as Tab)) || "overview";
  const initialTab: Tab = ["overview", "orders", "exchanges", "addresses", "profile", "security"].includes(parsedTab)
    ? parsedTab
    : "overview";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const pushToast = useToast((s) => s.push);
  const t = useTranslations("account");

  useEffect(() => {
    const currentRaw = searchParams.get("tab");
    if (!currentRaw) return;
    const tabParam = (currentRaw === "address" ? "addresses" : currentRaw) as Tab;
    if (["overview", "orders", "exchanges", "addresses", "profile", "security"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`);
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
  const [exchanges, setExchanges] = useState<any[]>(initialExchanges);
  const [addresses, setAddresses] =
    useState<SerializedAddress[]>(initialAddresses);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  /** Two-step delete: first click arms, second confirms. */
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Exchanges-specific state
  const [expandedExchangeId, setExpandedExchangeId] = useState<string | null>(null);
  const [pickupOptionState, setPickupOptionState] = useState<string>("courier");
  const [pickupDateState, setPickupDateState] = useState<string>("");
  const [pickupTimeState, setPickupTimeState] = useState<string>("09:00 - 12:00");
  const [pickupAddressState, setPickupAddressState] = useState<string>("");
  const [pickupInstructionsState, setPickupInstructionsState] = useState<string>("");
  const [uploadingExtraState, setUploadingExtraState] = useState<boolean>(false);
  const [actionBusyState, setActionBusyState] = useState<string | null>(null);

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

  async function handleCounterResponse(id: string, accept: boolean) {
    setActionBusyState(accept ? `accept-${id}` : `reject-${id}`);
    try {
      const res = await customerRespondToCounterAction(id, accept);
      if (res.success) {
        pushToast(accept ? "Counter offer accepted!" : "Counter offer rejected.");
        setExchanges((prev) =>
          prev.map((ex) => (ex.id === id ? { ...ex, ...res.updated } : ex))
        );
      }
    } catch (err: any) {
      console.error(err);
      pushToast("An error occurred. Please try again.");
    } finally {
      setActionBusyState(null);
    }
  }

  async function handleConfirmPickup(id: string) {
    setActionBusyState(`pickup-${id}`);
    try {
      const schedule = {
        address: pickupOptionState === "courier" ? pickupAddressState : undefined,
        date: pickupOptionState === "courier" ? pickupDateState : undefined,
        timeSlot: pickupOptionState === "courier" ? pickupTimeState : undefined,
        instructions: pickupOptionState === "courier" ? pickupInstructionsState : undefined,
      };

      const res = await customerSchedulePickupAction(id, pickupOptionState, schedule);
      if (res.success) {
        pushToast("Delivery pickup scheduled successfully!");
        setExchanges((prev) =>
          prev.map((ex) => (ex.id === id ? { ...ex, ...res.updated } : ex))
        );
      }
    } catch (err: any) {
      console.error(err);
      pushToast("An error occurred. Please try again.");
    } finally {
      setActionBusyState(null);
    }
  }

  const handleUploadExtraPhotos = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingExtraState(true);

    try {
      const signRes = await signExchangeUploadAction();
      if ("error" in signRes) throw new Error(signRes.error);

      const uploadInfo = signRes.upload;
      if (!uploadInfo) throw new Error("Signature failed.");

      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Canvas compression
        const reader = new FileReader();
        const compressedBlob = await new Promise<Blob>((resolve) => {
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;
              if (width > 1200) {
                height = Math.round((1200 / width) * height);
                width = 1200;
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);
              canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", 0.75);
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        });

        const formData = new FormData();
        formData.append("file", compressedBlob, file.name);
        formData.append("api_key", uploadInfo.apiKey);
        formData.append("timestamp", String(uploadInfo.timestamp));
        formData.append("folder", uploadInfo.folder);
        formData.append("signature", uploadInfo.signature);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${uploadInfo.cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!res.ok) throw new Error("Upload request failed.");

        const json = await res.json();
        newUrls.push(json.secure_url);
      }

      const dbRes = await customerAddImagesAction(id, newUrls);
      if (dbRes.success) {
        pushToast("Additional photos uploaded successfully!");
        setExchanges((prev) =>
          prev.map((ex) => (ex.id === id ? { ...ex, ...dbRes.updated } : ex))
        );
      }
    } catch (err: any) {
      console.error(err);
      pushToast(err.message || "Failed to upload photo.");
    } finally {
      setUploadingExtraState(false);
    }
  };

  function handlePrintQuote(exch: any) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const checklistLabels = Object.entries(exch.checklist || {})
      .filter(([_, v]) => v)
      .map(([k]) => k.replace(/([A-Z])/g, " $1").trim())
      .join(", ");

    printWindow.document.write(`
      <html>
        <head>
          <title>Trade-In Quotation - ${exch.referenceNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { border-bottom: 2px solid #2E6F40; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 24px; font-weight: bold; color: #2E6F40; }
            .meta { text-align: right; font-size: 14px; color: #666; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #111; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; text-transform: uppercase; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; font-size: 14px; }
            .label { color: #888; }
            .value { font-weight: bold; }
            .total-box { margin-top: 40px; padding: 20px; background: #f4fbf6; border: 1px solid #d1eed8; border-radius: 8px; text-align: center; }
            .total-value { font-size: 28px; font-weight: black; color: #2E6F40; margin-top: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">RHYDM TECH</div>
              <div style="font-size: 12px; color: #666;">Refurbished Hardware Exchange Division</div>
            </div>
            <div class="meta">
              <div>Reference: <strong>${exch.referenceNumber}</strong></div>
              <div>Date: ${exch.createdAtStr}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="grid">
              <div><span class="label">Email Address:</span> <span class="value">${user.email}</span></div>
              <div><span class="label">Recipient Name:</span> <span class="value">${user.firstName || ""} ${user.lastName || ""}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Device Specifications</div>
            <div class="grid">
              <div><span class="label">Device:</span> <span class="value">${exch.brand} ${exch.model}</span></div>
              <div><span class="label">Type:</span> <span class="value">${exch.deviceType}</span></div>
              <div><span class="label">Condition:</span> <span class="value">${exch.condition}</span></div>
              <div><span class="label">Purchase Year:</span> <span class="value">${exch.purchaseYear || "N/A"}</span></div>
              <div><span class="label">Serial Number:</span> <span class="value font-mono">${exch.serialNumber || "N/A"}</span></div>
              <div><span class="label">Service Tag:</span> <span class="value font-mono">${exch.serviceTag || "N/A"}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Technician Checklist</div>
            <div style="font-size: 14px; font-weight: 550; color: #555;">
              ${checklistLabels || "No special components verified."}
            </div>
          </div>

          <div class="total-box">
            <div style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #666;">Offer From Rhydm Technologies</div>
            <div class="total-value">${exch.finalValueCents != null ? formatPriceExact(exch.finalValueCents) : "Pending review"}</div>
            <div style="font-size: 11px; color: #888; margin-top: 10px;">Offers are made by our review team and remain subject to physical inspection at our depot. Valid for 14 days from the date sent.</div>
          </div>

          <div class="no-print" style="margin-top: 40px; text-align: center;">
            <button onclick="window.print();" style="background: #2E6F40; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer;">Print This Quotation</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
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
                      : item.id === "exchanges"
                        ? exchanges.length
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
                      <span className="flex-1 text-left">
                        {item.id === "exchanges" ? "My Exchanges" : t(item.labelKey)}
                      </span>
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
                                  imageUrl={item.imageUrl}
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

                        {/* Payment Details & Invoice */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            {order.paymentStatus && (
                              <p className="text-slate-600">
                                <span className="font-semibold text-slate-700">Payment:</span>{" "}
                                <span className={order.paymentStatus === "COMPLETED" ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                                  {order.paymentStatus}
                                </span>
                                {order.paymentMethod && <span className="text-slate-500 font-normal"> via {order.paymentMethod}</span>}
                              </p>
                            )}
                            {order.paypalTransactionId && (
                              <p className="text-slate-500 font-mono">
                                <span className="font-semibold font-sans text-slate-600">Transaction ID:</span> {order.paypalTransactionId}
                              </p>
                            )}
                          </div>
                          
                          <a
                            href={`/api/orders/${order.orderNumber}/invoice`}
                            download
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:border-slate-300"
                          >
                            <FileText className="size-3.5 text-slate-500" />
                            Download Invoice
                          </a>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              )}

              {activeTab === "exchanges" && (
                <div className="space-y-4">
                  {exchanges.length === 0 ? (
                    <SectionCard title="My Exchanges">
                      <EmptyState
                        icon={RotateCcw}
                        title="No Exchanges Yet"
                        body="You haven't submitted any hardware exchange or trade-in requests yet."
                        cta={{ href: "/refurbished/shop", label: "Browse Shop & Exchange" }}
                      />
                    </SectionCard>
                  ) : (
                    exchanges.map((exch) => {
                      const isExpanded = expandedExchangeId === exch.id;
                      const offerVisible = isOfferVisibleToCustomer(exch.status, exch.finalValueCents);
                      const awaitingResponse = exch.status === "OFFER_SENT" && exch.finalValueCents != null;
                      const canSchedule = exch.status === "APPROVED" && !exch.pickupOption;
                      const hasScheduled = !!exch.pickupOption;

                      return (
                        <article
                          key={exch.id}
                          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
                        >
                          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                              <p className="font-mono text-sm font-bold flex items-center gap-1.5">
                                <span className="text-slate-500">Ref:</span>
                                <span>{exch.referenceNumber}</span>
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                Submitted on {exch.createdAtStr} · {exch.brand} {exch.model}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className={cn(
                                "rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                                EXCHANGE_TONE_CLASSES[exchangeStatusTone(exch.status)],
                              )}>
                                {exchangeStatusLabel(exch.status)}
                              </span>
                              {/* A figure appears only once our team has made an
                                  offer — never an automatic estimate. */}
                              {offerVisible ? (
                                <span className="text-sm font-black text-slate-900">
                                  {formatPriceExact(exch.finalValueCents)}
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-slate-500">
                                  Awaiting our offer
                                </span>
                              )}
                            </div>
                          </header>

                          {/* Quick Specs Overview */}
                          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                            <div className="flex flex-wrap gap-4 text-slate-600 font-medium">
                              <div>Type: <span className="font-bold text-slate-800">{exch.deviceType}</span></div>
                              <div>Condition: <span className="font-bold text-slate-800">{exch.condition}</span></div>
                              {exch.linkedProduct && (
                                <div className="text-emerald-700 font-bold">
                                  Linked to: <Link href={`/refurbished/products/${exch.linkedProduct.slug}`} className="hover:underline">{exch.linkedProduct.name}</Link>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedExchangeId(isExpanded ? null : exch.id)}
                              className="text-[#2E6F40] font-bold hover:underline cursor-pointer"
                            >
                              {isExpanded ? "Show Less" : "Show Details & Tracking"}
                            </button>
                          </div>

                          {/* Expanded Details Section */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 pt-5 space-y-6">
                              {/* Specs & Images Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Device Specifications</h4>
                                  <div className="grid grid-cols-2 gap-2 text-xs rounded-xl bg-slate-50 p-4 border border-slate-100">
                                    <div><span className="text-slate-400">RAM:</span> <span className="font-semibold text-slate-800">{exch.checklist?.configRam || "Standard"}</span></div>
                                    <div><span className="text-slate-400">Storage:</span> <span className="font-semibold text-slate-800">{exch.checklist?.configStorage || "Standard"}</span></div>
                                    <div><span className="text-slate-400">CPU:</span> <span className="font-semibold text-slate-800">{exch.checklist?.configCpu || "Standard"}</span></div>
                                    <div><span className="text-slate-400">Purchase Year:</span> <span className="font-semibold text-slate-800">{exch.purchaseYear || "N/A"}</span></div>
                                    <div className="col-span-2"><span className="text-slate-400">Serial Num:</span> <span className="font-mono text-slate-800">{exch.serialNumber || "N/A"}</span></div>
                                  </div>
                                </div>

                                {/* Images gallery */}
                                <div className="space-y-3">
                                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Uploaded Photos</h4>
                                  <div className="flex gap-2.5 overflow-x-auto pb-1 max-w-full">
                                    {exch.images.map((url: string, index: number) => (
                                      <a key={index} href={url} target="_blank" rel="noreferrer" className="shrink-0 aspect-square size-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 relative group">
                                        <img src={url} alt="Device Photo" className="h-full w-full object-cover" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              {exch.description && (
                                <div className="space-y-1.5">
                                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Customer Description</h4>
                                  <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100 leading-relaxed font-medium">
                                    {exch.description}
                                  </p>
                                </div>
                              )}

                              {/* Print Quote Invoice block */}
                              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-slate-50/55 p-4">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-slate-900">
                                    {offerVisible ? "Official offer summary" : "Request summary"}
                                  </h4>
                                  <p className="text-xs text-slate-500">
                                    {offerVisible
                                      ? "Print or save the trade-in offer sheet."
                                      : "Print the details you submitted. The value appears once our team sends your offer."}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handlePrintQuote(exch)}
                                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>Print Quote</span>
                                </button>
                              </div>

                              {/* Customer Counter Offer Decision panel */}
                              {awaitingResponse && (
                                <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/30 p-5">
                                  <div className="flex gap-3">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                    <div>
                                      <h4 className="text-sm font-bold text-slate-900">Our offer for your device</h4>
                                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                        After reviewing your device details and photos, our team is offering{" "}
                                        <span className="font-extrabold text-[#16A34A]">{formatPriceExact(exch.finalValueCents ?? 0)}</span>
                                        {exch.offerSentAt ? ` (sent ${exch.offerSentAt})` : ""}. Accept to arrange
                                        collection, or decline and we will close the request — no obligation either way.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      disabled={actionBusyState !== null}
                                      onClick={() => handleCounterResponse(exch.id, true)}
                                      className="px-5 py-2.5 bg-[#16A34A] hover:bg-[#159342] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#16A34A]/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                      {actionBusyState === `accept-${exch.id}` && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                                      <span>Accept Counter Offer</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={actionBusyState !== null}
                                      onClick={() => handleCounterResponse(exch.id, false)}
                                      className="px-5 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                      {actionBusyState === `reject-${exch.id}` && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                                      <span>Reject Counter Offer</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Courier Scheduling Form */}
                              {canSchedule && (
                                <div className="p-5 border border-blue-200 bg-blue-50/20 rounded-2xl space-y-4">
                                  <div className="flex gap-3">
                                    <Truck className="h-5 w-5 text-blue-650 shrink-0 mt-0.5" />
                                    <div>
                                      <h4 className="text-sm font-bold text-slate-900">Schedule Hardware Pickup</h4>
                                      <p className="text-xs text-slate-500 mt-0.5">Your request is approved! Choose how to deliver the device to our inspection warehouse.</p>
                                    </div>
                                  </div>

                                  {/* Segmented Option Selector */}
                                  <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                                    {["courier", "dropoff", "selfship"].map((opt) => (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setPickupOptionState(opt)}
                                        className={cn(
                                          "px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                                          pickupOptionState === opt ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
                                        )}
                                      >
                                        {opt === "courier" ? "Courier Pickup" : opt === "dropoff" ? "Drop-off Box" : "Self-Ship"}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Options Fields */}
                                  {pickupOptionState === "courier" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                      <div className="space-y-1.5 col-span-2">
                                        <label className="font-bold text-slate-700">Pickup Address</label>
                                        <input
                                          type="text"
                                          placeholder="Address for courier pickup..."
                                          value={pickupAddressState}
                                          onChange={(e) => setPickupAddressState(e.target.value)}
                                          className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs outline-none focus:border-[#2E6F40]"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className="font-bold text-slate-700">Pickup Date</label>
                                        <input
                                          type="date"
                                          value={pickupDateState}
                                          min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                                          onChange={(e) => setPickupDateState(e.target.value)}
                                          className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs outline-none focus:border-[#2E6F40]"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className="font-bold text-slate-700">Preferred Hours Window</label>
                                        <select
                                          value={pickupTimeState}
                                          onChange={(e) => setPickupTimeState(e.target.value)}
                                          className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs outline-none focus:border-[#2E6F40]"
                                        >
                                          <option value="09:00 - 12:00">Morning (09:00 - 12:00)</option>
                                          <option value="12:00 - 15:00">Midday (12:00 - 15:00)</option>
                                          <option value="15:00 - 18:00">Afternoon (15:00 - 18:00)</option>
                                        </select>
                                      </div>
                                    </div>
                                  )}

                                  {pickupOptionState === "dropoff" && (
                                    <div className="text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/50 leading-relaxed font-medium text-slate-600">
                                      <p className="font-bold text-slate-800 text-sm mb-1.5">Drop-off Instructions</p>
                                      Pack your device securely in its original box (or standard bubblewrap box). Drop it off at any local DHL Parcel point using our prepaid shipping label (which will be emailed to you shortly).
                                    </div>
                                  )}

                                  {pickupOptionState === "selfship" && (
                                    <div className="text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/50 leading-relaxed font-medium text-slate-600">
                                      <p className="font-bold text-slate-800 text-sm mb-1.5">Self-Ship Address</p>
                                      Please ship your device to the following address:
                                      <br />
                                      <span className="font-bold text-slate-900 font-sans">Rhydm Tech Refurbished Division, Gutenbergstraße 12, 50823 Köln, Germany</span>.
                                      Make sure to write your Exchange Reference <span className="font-bold font-mono text-slate-900">{exch.referenceNumber}</span> clearly on the outer package.
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    disabled={actionBusyState !== null || (pickupOptionState === "courier" && (!pickupAddressState || !pickupDateState))}
                                    onClick={() => handleConfirmPickup(exch.id)}
                                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                  >
                                    {actionBusyState === `pickup-${exch.id}` && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                                    <span>Confirm Pickup Delivery</span>
                                  </button>
                                </div>
                              )}

                              {/* Scheduled Pickup Display */}
                              {hasScheduled && (
                                <div className="p-4 border border-blue-100 bg-blue-50/10 rounded-2xl flex gap-3.5 text-xs text-slate-600 leading-relaxed">
                                  <Truck className="h-5 w-5 text-blue-650 shrink-0 mt-0.5" />
                                  <div>
                                    <h4 className="font-bold text-slate-900">Delivery / Pickup Scheduled</h4>
                                    <p className="mt-1 font-medium">
                                      Delivery Option: <span className="font-bold text-slate-800 uppercase">{exch.pickupOption}</span>
                                    </p>
                                    {exch.pickupSchedule?.date && (
                                      <p className="font-medium">
                                        Date & Time: <span className="font-bold text-slate-805">{exch.pickupSchedule.date} ({exch.pickupSchedule.timeSlot})</span>
                                      </p>
                                    )}
                                    {exch.pickupSchedule?.address && (
                                      <p className="font-medium mt-0.5">
                                        Address: <span className="font-mono text-slate-705">{exch.pickupSchedule.address}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Upload additional images dropzone (if requested or for extra inspection) */}
                              <div className="space-y-3 p-4 border border-slate-100 bg-slate-50/20 rounded-2xl">
                                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                  <Camera className="h-3.5 w-3.5 text-slate-400 animate-pulse" />
                                  <span>Need to upload more photos?</span>
                                </h4>
                                <div className="flex items-center gap-3">
                                  <label className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50">
                                    {uploadingExtraState ? (
                                      <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>Uploading...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-3.5 w-3.5 text-slate-500" />
                                        <span>Add More Photos</span>
                                      </>
                                    )}
                                    <input
                                      type="file"
                                      multiple
                                      accept="image/*"
                                      disabled={uploadingExtraState}
                                      onChange={(e) => handleUploadExtraPhotos(exch.id, e)}
                                      className="hidden"
                                    />
                                  </label>
                                  <span className="text-[10px] text-slate-400 font-medium">PNG, JPG or WEBP formats.</span>
                                </div>
                              </div>

                              {/* Activity Timeline Audit Log */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                  <Info className="h-4 w-4" />
                                  <span>Activity Timeline & Audit Trail</span>
                                </h4>
                                <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-4 text-xs">
                                  {exch.activities.map((act: any, aIdx: number) => (
                                    <div key={act.id || aIdx} className="relative">
                                      <div className="absolute -left-[21px] top-1 bg-white border border-[#2E6F40] size-2.5 rounded-full" />
                                      <div className="flex flex-col gap-0.5">
                                        <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                                          <span>{act.action.replace("_", " ")}</span>
                                          {act.toStatus && (
                                            <span className="bg-slate-100 text-slate-550 px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider">
                                              → {act.toStatus.replace("_", " ")}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-slate-500 text-[10px] font-medium">{act.createdAtStr}</div>
                                        <div className="text-slate-650 mt-1 font-medium leading-relaxed">{act.details}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          )}
                        </article>
                      );
                    })
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
