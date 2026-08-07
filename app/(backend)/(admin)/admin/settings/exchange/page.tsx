import Link from "next/link";
import { ArrowLeft, Save, Sliders, DollarSign, Tag, RefreshCw, Landmark } from "lucide-react";
import { getExchangeRules } from "@/lib/repositories/exchange";
import { saveExchangeRulesAction } from "@/app/(backend)/(admin)/admin/actions";

export default async function AdminExchangeSettingsPage() {
  const rules = await getExchangeRules();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/admin/settings" className="hover:text-primary flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Site Settings</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl flex items-center gap-2">
            <Landmark className="h-8 w-8 text-primary" />
            <span>Exchange & Trade-In Rules</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure whitelists, age depreciation, and spec modifiers used by the valuation engine.
          </p>
        </div>
      </div>

      <form action={saveExchangeRulesAction} className="space-y-6">
        {/* Global Controls */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <span>Core Parameters</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Annual Depreciation (%)</label>
              <input
                type="number"
                name="depreciationPercent"
                defaultValue={rules.depreciationPercent}
                min={0}
                max={100}
                required
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Max Exchange Value (€)</label>
              <input
                type="number"
                name="maxExchangeValue"
                defaultValue={rules.maxExchangeValueCents / 100}
                min={0}
                required
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Pickup Courier Fee (€)</label>
              <input
                type="number"
                name="pickupCharges"
                defaultValue={rules.pickupChargesCents / 100}
                min={0}
                required
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Whitelists */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <Tag className="h-5 w-5 text-emerald-500" />
            <span>Eligible Whitelists</span>
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Accepted Brands (Comma-separated)</label>
              <input
                type="text"
                name="acceptedBrands"
                defaultValue={rules.acceptedBrands.join(", ")}
                required
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Accepted Categories (Comma-separated)</label>
              <input
                type="text"
                name="acceptedCategories"
                defaultValue={rules.acceptedCategories.join(", ")}
                required
                className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Category Base Prices */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <span>Category Base Values (€)</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {rules.acceptedCategories.map((category) => (
              <div key={category} className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">{category}</label>
                <input
                  type="number"
                  name={`price_${category}`}
                  defaultValue={(rules.baseCategoryPricesCents[category] || 0) / 100}
                  min={0}
                  required
                  className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Condition Multipliers */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-violet-500" />
            <span>Condition Value Multipliers (0.0 to 1.0)</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {Object.entries(rules.conditionMultipliers).map(([condition, mult]) => (
              <div key={condition} className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">{condition}</label>
                <input
                  type="number"
                  name={`mult_${condition.replace(" ", "")}`}
                  defaultValue={mult}
                  step={0.05}
                  min={0}
                  max={1.5}
                  required
                  className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Save className="h-4.5 w-4.5" />
            <span>Save Rules</span>
          </button>
        </div>
      </form>
    </div>
  );
}
