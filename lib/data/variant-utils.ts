import { ProductCondition, PublishStatus } from "@/lib/generated/prisma/enums";

export interface VariantOptionValueDTO {
  id: string;
  optionId: string;
  optionName: string;
  value: string;
  position: number;
}

export interface VariantOptionDTO {
  id: string;
  productId: string;
  name: string;
  position: number;
  values: VariantOptionValueDTO[];
}

export interface ProductVariantDTO {
  id: string;
  productId: string;
  sku: string;
  barcode: string | null;
  priceCents: number;
  compareAtCents: number | null;
  stock: number;
  condition: ProductCondition | null;
  conditionNotes: string | null;
  warrantyMonths: number | null;
  weightGrams: number | null;
  dimensions: string | null;
  status: PublishStatus;
  position: number;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }>;
  selectedOptions: Record<string, string>;
  selectedOptionValueIds: string[];
}

export interface ProductWithVariantsDTO {
  id: string;
  slug: string;
  name: string;
  sku: string;
  basePriceCents: number;
  baseCompareAtCents: number | null;
  baseStock: number;
  baseCondition: ProductCondition;
  baseWarrantyMonths: number;
  options: VariantOptionDTO[];
  variants: ProductVariantDTO[];
}

/**
 * Generate Cartesian product matrix of option values.
 * e.g. [{ RAM: "8GB" }, { RAM: "16GB" }] x [{ SSD: "256GB" }, { SSD: "512GB" }]
 */
export function generateVariantMatrix(
  options: Array<{ name: string; values: string[] }>,
): Array<Record<string, string>> {
  if (options.length === 0) return [];

  return options.reduce<Array<Record<string, string>>>(
    (acc, option) => {
      if (acc.length === 0) {
        return option.values.map((val) => ({ [option.name]: val }));
      }
      const newAcc: Array<Record<string, string>> = [];
      acc.forEach((existingCombo) => {
        option.values.forEach((val) => {
          newAcc.push({ ...existingCombo, [option.name]: val });
        });
      });
      return newAcc;
    },
    [],
  );
}

/**
 * Generate a clean Shopify-style SKU from product base SKU and selected variant options.
 * e.g. "DL7440" + { RAM: "16GB", SSD: "512GB", Condition: "GRADE_A" } => "DL7440-16GB-512GB-GRADE_A"
 */
export function generateVariantSku(
  baseSku: string,
  selectedOptions: Record<string, string>,
): string {
  const sanitize = (str: string) =>
    str.toUpperCase().replace(/[^A-Z0-9]/g, "");

  const parts = Object.values(selectedOptions).map(sanitize).filter(Boolean);
  return `${baseSku.toUpperCase()}-${parts.join("-")}`;
}

/**
 * Calculate dynamic price modifier addition for option values.
 */
export function calculateVariantPriceCents(
  basePriceCents: number,
  selectedOptions: Record<string, string>,
  modifiers: Record<string, number>,
): number {
  let finalPrice = basePriceCents;
  Object.entries(selectedOptions).forEach(([optionName, value]) => {
    const key = `${optionName}:${value}`;
    if (modifiers[key]) {
      finalPrice += modifiers[key];
    }
  });
  return finalPrice;
}
