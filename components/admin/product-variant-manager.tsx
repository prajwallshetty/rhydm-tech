"use client";

import { useState } from "react";
import { Plus, Trash2, Sparkles, RefreshCw, Check, Layers, Package, DollarSign } from "lucide-react";
import { generateVariantMatrix, generateVariantSku } from "@/lib/data/variant-utils";

export interface ConfiguredOption {
  name: string;
  valuesStr: string; // Comma separated string e.g. "8GB, 16GB, 32GB"
}

export interface ManagedVariant {
  id?: string;
  sku: string;
  barcode?: string;
  price: string;
  compareAtPrice?: string;
  stock: number;
  condition: string;
  warrantyMonths: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  selectedOptions: Record<string, string>;
}

interface ProductVariantManagerProps {
  baseSku: string;
  basePrice: string;
  baseCompareAtPrice: string;
  baseStock: number;
  initialOptions?: ConfiguredOption[];
  initialVariants?: ManagedVariant[];
  onChange?: (options: ConfiguredOption[], variants: ManagedVariant[]) => void;
}

export function ProductVariantManager({
  baseSku,
  basePrice,
  baseCompareAtPrice,
  baseStock,
  initialOptions = [
    { name: "RAM", valuesStr: "8GB, 16GB, 32GB" },
    { name: "SSD", valuesStr: "256GB, 512GB, 1TB" },
    { name: "Condition", valuesStr: "Grade A, Grade B" },
    { name: "Warranty", valuesStr: "6 Months, 12 Months" },
  ],
  initialVariants = [],
  onChange,
}: ProductVariantManagerProps) {
  const [options, setOptions] = useState<ConfiguredOption[]>(initialOptions);
  const [variants, setVariants] = useState<ManagedVariant[]>(initialVariants);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const notifyChange = (nextOpts: ConfiguredOption[], nextVars: ManagedVariant[]) => {
    setOptions(nextOpts);
    setVariants(nextVars);
    if (onChange) onChange(nextOpts, nextVars);
  };

  const addOptionRow = () => {
    const updated = [...options, { name: "", valuesStr: "" }];
    notifyChange(updated, variants);
  };

  const removeOptionRow = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    notifyChange(updated, variants);
  };

  const updateOptionRow = (index: number, field: "name" | "valuesStr", value: string) => {
    const updated = [...options];
    updated[index][field] = value;
    notifyChange(updated, variants);
  };

  // Generate Cartesian Product Matrix for Variants
  const handleGenerateMatrix = () => {
    const validOptions = options
      .map((opt) => ({
        name: opt.name.trim(),
        values: opt.valuesStr
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      }))
      .filter((opt) => opt.name && opt.values.length > 0);

    if (validOptions.length === 0) return;

    const matrix = generateVariantMatrix(validOptions);

    const generated: ManagedVariant[] = matrix.map((combo, idx) => {
      const generatedSku = generateVariantSku(baseSku || "PROD", combo);

      // Simple heuristic modifier: if option value mentions higher RAM/SSD, add price bump
      let calculatedPriceNum = parseFloat(basePrice) || 299;

      Object.entries(combo).forEach(([key, val]) => {
        const valUpper = val.toUpperCase();
        if (valUpper.includes("16GB")) calculatedPriceNum += 50;
        if (valUpper.includes("32GB")) calculatedPriceNum += 120;
        if (valUpper.includes("512GB")) calculatedPriceNum += 40;
        if (valUpper.includes("1TB")) calculatedPriceNum += 100;
        if (valUpper.includes("12") || valUpper.includes("1 YEAR")) calculatedPriceNum += 30;
      });

      return {
        sku: generatedSku,
        barcode: "",
        price: calculatedPriceNum.toFixed(2),
        compareAtPrice: baseCompareAtPrice || "",
        stock: baseStock || 10,
        condition: combo["Condition"] || "GRADE_A",
        warrantyMonths: combo["Warranty"]?.includes("12") ? 12 : 6,
        status: "PUBLISHED",
        selectedOptions: combo,
      };
    });

    notifyChange(options, generated);
  };

  const updateVariantRow = (index: number, field: keyof ManagedVariant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    notifyChange(options, updated);
  };

  const removeVariantRow = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    notifyChange(options, updated);
  };

  const applyBulkEdit = () => {
    if (!bulkPrice && !bulkStock) return;
    const updated = variants.map((v) => ({
      ...v,
      price: bulkPrice ? bulkPrice : v.price,
      stock: bulkStock ? parseInt(bulkStock, 10) || v.stock : v.stock,
    }));
    notifyChange(options, updated);
  };

  return (
    <div className="space-y-6 rounded-xl border border-border/80 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Layers className="size-4 text-emerald-600" />
            <span>Shopify-Style Variant Engine</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define attributes (RAM, SSD, Condition, Warranty) and generate individual sellable SKUs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateMatrix}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
        >
          <Sparkles className="size-3.5" />
          <span>Generate {options.length > 0 ? "Variant Matrix" : "Variants"}</span>
        </button>
      </div>

      {/* Option Definitions */}
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Variant Option Attributes
        </label>

        <div className="space-y-3">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Option Name (e.g. RAM)"
                value={opt.name}
                onChange={(e) => updateOptionRow(idx, "name", e.target.value)}
                className="w-1/3 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <input
                type="text"
                placeholder="Option Values (comma separated: 8GB, 16GB, 32GB)"
                value={opt.valuesStr}
                onChange={(e) => updateOptionRow(idx, "valuesStr", e.target.value)}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => removeOptionRow(idx)}
                className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer"
                title="Remove option"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addOptionRow}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <Plus className="size-3.5" />
          <span>Add Option (e.g. Color, Storage)</span>
        </button>
      </div>

      {/* Generated Matrix Table */}
      {variants.length > 0 && (
        <div className="space-y-4 border-t border-border/60 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {variants.length} Variants Generated
              </span>
            </div>

            {/* Bulk Edits */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Bulk Price ($)"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                className="w-28 rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <input
                type="number"
                placeholder="Bulk Stock"
                value={bulkStock}
                onChange={(e) => setBulkStock(e.target.value)}
                className="w-24 rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={applyBulkEdit}
                className="rounded-lg bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Apply Bulk
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-xl border border-border/80 bg-background">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="border-b border-border/80 bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Variant Combination</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price ($)</th>
                  <th className="px-4 py-3">Compare ($)</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {variants.map((variant, vIdx) => (
                  <tr key={vIdx} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(variant.selectedOptions).map(([k, v]) => (
                          <span
                            key={k}
                            className="rounded border border-emerald-200 bg-emerald-50/50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariantRow(vIdx, "sku", e.target.value)}
                        className="w-32 font-mono rounded border border-input bg-card px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => updateVariantRow(vIdx, "price", e.target.value)}
                        className="w-20 font-medium rounded border border-input bg-card px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={variant.compareAtPrice || ""}
                        onChange={(e) =>
                          updateVariantRow(vIdx, "compareAtPrice", e.target.value)
                        }
                        className="w-20 rounded border border-input bg-card px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariantRow(
                            vIdx,
                            "stock",
                            parseInt(e.target.value, 10) || 0,
                          )
                        }
                        className="w-16 font-medium rounded border border-input bg-card px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={variant.status}
                        onChange={(e) => updateVariantRow(vIdx, "status", e.target.value)}
                        className="rounded border border-input bg-card px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeVariantRow(vIdx)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        title="Delete variant"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
