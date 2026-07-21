"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Package,
  MapPin,
  Settings as SettingsIcon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  ExternalLink,
  Save,
  Lock,
  Building2,
  Mail,
  Phone,
  Plus,
  RotateCcw,
} from "lucide-react";

import { ProductThumb } from "@/components/store/product-thumb";
import { useToast } from "@/components/ui/toast";
import { formatPriceExact } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tab = "overview" | "orders" | "addresses" | "settings" | "security";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const pushToast = useToast((s) => s.push);

  // Profile Form state
  const [profile, setProfile] = useState({
    firstName: "Prajwal",
    lastName: "Shetty",
    email: "prajwal@rhydm.tech",
    phone: "+1 (555) 019-2834",
    company: "Growthbridge Inc.",
  });

  const [saving, setSaving] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      pushToast("Account profile updated successfully");
    }, 400);
  };

  const orders = [
    {
      id: "ORD-8921",
      date: "July 18, 2026",
      status: "Delivered",
      totalCents: 124900,
      trackingNumber: "TRK-982310492",
      items: [
        {
          slug: "apple-macbook-pro-14-m3",
          name: "Apple MacBook Pro 14″ M3 (16GB RAM, 512GB SSD)",
          categorySlug: "laptops",
          priceCents: 124900,
          quantity: 1,
          serial: "SN-MBP14-9921A",
          warrantyUntil: "July 18, 2027",
        },
      ],
    },
    {
      id: "ORD-8410",
      date: "June 02, 2026",
      status: "Delivered",
      totalCents: 169800,
      trackingNumber: "TRK-771239401",
      items: [
        {
          slug: "dell-latitude-7440-i7-16gb",
          name: "Dell Latitude 7440 Intel i7 (16GB RAM, 512GB SSD)",
          categorySlug: "laptops",
          priceCents: 84900,
          quantity: 2,
          serial: "SN-DELL74-118A",
          warrantyUntil: "June 02, 2027",
        },
      ],
    },
  ];

  const addresses = [
    {
      id: "addr-1",
      title: "Enterprise Headquarters (Default)",
      street: "120 Enterprise Way, Suite 400",
      city: "Austin",
      region: "TX",
      postalCode: "78701",
      country: "United States",
      isDefault: true,
    },
    {
      id: "addr-2",
      title: "Regional Operations Hub",
      street: "450 Technology Parkway",
      city: "San Jose",
      region: "CA",
      postalCode: "95110",
      country: "United States",
      isDefault: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-background text-slate-900 dark:text-foreground pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-6 space-y-8">
        {/* Account Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-border dark:bg-card"
        >
          <div aria-hidden className="pointer-events-none absolute right-0 top-0 size-96 rounded-full bg-[#2E6F40]/10 blur-3xl" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-[#2E6F40] text-white font-extrabold text-2xl shadow-lg shadow-[#2E6F40]/25">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#2E6F40]/10 border border-[#2E6F40]/20 px-2.5 py-0.5 text-[10px] font-extrabold text-[#2E6F40] uppercase">
                    <ShieldCheck className="size-3" /> Enterprise Client
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {profile.email} &middot; {profile.company}
                </p>
              </div>
            </div>

            {/* Header Quick Stats */}
            <div className="grid grid-cols-3 gap-4 border-t sm:border-t-0 sm:border-l border-border/80 pt-4 sm:pt-0 sm:pl-8 w-full sm:w-auto">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Orders</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{orders.length}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">Warranties</span>
                <p className="text-xl font-bold text-[#2E6F40] mt-0.5">Active</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">Support</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Priority</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabbed Navigation Bar */}
        <div className="flex overflow-x-auto gap-2 border-b border-border/80 pb-3 scrollbar-none">
          {[
            { id: "overview", label: "Overview", icon: User },
            { id: "orders", label: "Orders & Warranties", icon: Package },
            { id: "addresses", label: "Saved Addresses", icon: MapPin },
            { id: "settings", label: "Profile Settings", icon: SettingsIcon },
            { id: "security", label: "Security", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer",
                  active
                    ? "bg-[#2E6F40] text-white shadow-md shadow-[#2E6F40]/20"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-muted",
                )}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-6 md:grid-cols-3"
            >
              {/* Recent Orders Overview */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Orders</h2>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-[#2E6F40] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    View All <ArrowRight className="size-3" />
                  </button>
                </div>

                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 dark:border-border dark:bg-card"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{order.id}</span>
                        <span className="text-xs text-muted-foreground ml-2">&middot; {order.date}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> {order.status}
                      </span>
                    </div>

                    {order.items.map((item) => (
                      <div key={item.slug} className="flex items-center gap-4">
                        <div className="size-16 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2 shrink-0 dark:border-border dark:bg-muted">
                          <ProductThumb
                            slug={item.slug}
                            category={item.categorySlug}
                            name={item.name}
                            className="size-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                            <span>Serial: {item.serial}</span>
                            <span>&middot;</span>
                            <span className="text-[#2E6F40] font-semibold flex items-center gap-1">
                              <ShieldCheck className="size-3" /> 12-Mo Warranty Valid
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {formatPriceExact(item.priceCents * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Sidebar Cards */}
              <div className="space-y-6">
                {/* Decommission Banner */}
                <div className="rounded-2xl border border-[#2E6F40]/30 bg-linear-to-br from-[#2E6F40]/10 via-brand-muted to-transparent p-6 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Need IT Decommissioning?
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Schedule certified data wiping, hard drive destruction, and enterprise corporate pickup with Rhydm Disposal.
                  </p>
                  <Link
                    href="/disposal/contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2E6F40] hover:bg-[#255833] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-105"
                  >
                    <span>Request Pickup</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                {/* Default Shipping Address Summary */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 dark:border-border dark:bg-card">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Address</h4>
                    <button
                      onClick={() => setActiveTab("addresses")}
                      className="text-xs font-bold text-[#2E6F40] hover:underline cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{addresses[0].title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {addresses[0].street}<br />
                    {addresses[0].city}, {addresses[0].region} {addresses[0].postalCode}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Order History & Warranties</h2>
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 dark:border-border dark:bg-card"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{order.id}</span>
                      <span className="text-xs text-muted-foreground ml-3">Placed on {order.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        Tracking: <span className="font-mono text-foreground font-semibold">{order.trackingNumber}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" /> {order.status}
                      </span>
                    </div>
                  </div>

                  {order.items.map((item) => (
                    <div key={item.slug} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                      <div className="flex items-center gap-4">
                        <div className="size-20 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2 shrink-0 dark:border-border dark:bg-muted">
                          <ProductThumb
                            slug={item.slug}
                            category={item.categorySlug}
                            name={item.name}
                            className="size-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Quantity: {item.quantity} &middot; {formatPriceExact(item.priceCents)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#2E6F40]/10 px-2 py-0.5 text-[11px] font-bold text-[#2E6F40]">
                              <ShieldCheck className="size-3" /> Warranty valid until {item.warrantyUntil}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                          href={`/refurbished/products/${item.slug}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold hover:bg-accent transition-colors"
                        >
                          <span>Buy Again</span>
                          <RotateCcw className="size-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "addresses" && (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Saved Addresses</h2>
                <button
                  onClick={() => pushToast("Add address dialog opened")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#2E6F40] px-4 py-2 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={cn(
                      "rounded-2xl border p-6 space-y-3 relative bg-white dark:bg-card",
                      addr.isDefault
                        ? "border-[#2E6F40] ring-2 ring-[#2E6F40]/20 shadow-md"
                        : "border-slate-200/80 dark:border-border",
                    )}
                  >
                    {addr.isDefault && (
                      <span className="absolute top-4 right-4 rounded-full bg-[#2E6F40] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                        DEFAULT
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{addr.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {addr.street}<br />
                      {addr.city}, {addr.region} {addr.postalCode}<br />
                      {addr.country}
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => pushToast("Editing address")}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      {!addr.isDefault && (
                        <button
                          onClick={() => pushToast("Set as default address")}
                          className="text-xs font-bold text-[#2E6F40] hover:underline cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6 dark:border-border dark:bg-card"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Settings</h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">First Name</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium outline-none focus:border-[#2E6F40]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Last Name</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium outline-none focus:border-[#2E6F40]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#2E6F40]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#2E6F40]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#2E6F40]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2E6F40] hover:bg-[#255833] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#2E6F40]/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Save className="size-4" />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6 dark:border-border dark:bg-card"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Passwords</h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-[#2E6F40]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-[#2E6F40]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-[#2E6F40]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => pushToast("Password updated successfully")}
                  className="rounded-full bg-[#2E6F40] px-6 py-2.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
