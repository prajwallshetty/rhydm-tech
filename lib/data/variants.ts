import { db } from "@/lib/db";
import { ProductCondition, PublishStatus } from "@/lib/generated/prisma/enums";
import {
  VariantOptionValueDTO,
  VariantOptionDTO,
  ProductVariantDTO,
  ProductWithVariantsDTO,
  generateVariantMatrix,
  generateVariantSku,
  calculateVariantPriceCents,
} from "./variant-utils";

export * from "./variant-utils";

/**
 * Fetch a product with all its configured options, option values, and variants.
 */
export async function getProductWithVariants(
  productSlug: string,
): Promise<ProductWithVariantsDTO | null> {
  const product = await db.product.findUnique({
    where: { slug: productSlug },
    include: {
      options: {
        orderBy: { position: "asc" },
        include: {
          values: {
            orderBy: { position: "asc" },
          },
        },
      },
      variants: {
        where: { status: PublishStatus.PUBLISHED },
        orderBy: { position: "asc" },
        include: {
          images: {
            orderBy: { position: "asc" },
          },
          optionValues: {
            include: {
              optionValue: {
                include: {
                  option: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!product) return null;

  const options: VariantOptionDTO[] = product.options.map((opt) => ({
    id: opt.id,
    productId: opt.productId,
    name: opt.name,
    position: opt.position,
    values: opt.values.map((val) => ({
      id: val.id,
      optionId: val.optionId,
      optionName: opt.name,
      value: val.value,
      position: val.position,
    })),
  }));

  const variants: ProductVariantDTO[] = product.variants.map((v) => {
    const selectedOptions: Record<string, string> = {};
    const selectedOptionValueIds: string[] = [];

    v.optionValues.forEach((ov) => {
      selectedOptions[ov.optionValue.option.name] = ov.optionValue.value;
      selectedOptionValueIds.push(ov.optionValue.id);
    });

    return {
      id: v.id,
      productId: v.productId,
      sku: v.sku,
      barcode: v.barcode,
      priceCents: v.priceCents,
      compareAtCents: v.compareAtCents,
      stock: v.stock,
      condition: v.condition,
      conditionNotes: v.conditionNotes,
      warrantyMonths: v.warrantyMonths,
      weightGrams: v.weightGrams,
      dimensions: v.dimensions,
      status: v.status,
      position: v.position,
      images: v.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        position: img.position,
      })),
      selectedOptions,
      selectedOptionValueIds,
    };
  });

  // Default fallback generator if database records have no explicit options configured yet
  let finalOptions = options;
  let finalVariants = variants;

  if (finalOptions.length === 0 || finalVariants.length === 0) {
    const rawOptions = [
      { name: "RAM", values: ["8GB", "16GB", "32GB"] },
      { name: "Storage", values: ["256GB", "512GB", "1TB"] },
      { name: "Condition", values: ["Grade A", "Grade B"] },
      { name: "Warranty", values: ["6 Months", "12 Months"] },
    ];

    finalOptions = rawOptions.map((opt, optIdx) => ({
      id: `opt-${optIdx}`,
      productId: product.id,
      name: opt.name,
      position: optIdx,
      values: opt.values.map((v, valIdx) => ({
        id: `val-${optIdx}-${valIdx}`,
        optionId: `opt-${optIdx}`,
        optionName: opt.name,
        value: v,
        position: valIdx,
      })),
    }));

    const matrix = generateVariantMatrix(rawOptions);
    finalVariants = matrix.map((combo, idx) => {
      let price = product.priceCents;

      const ram = combo["RAM"];
      if (ram === "16GB") price += 5000; // +$50
      if (ram === "32GB") price += 12000; // +$120

      const storage = combo["Storage"];
      if (storage === "512GB") price += 4000; // +$40
      if (storage === "1TB") price += 10000; // +$100

      const warranty = combo["Warranty"];
      if (warranty === "12 Months") price += 3000; // +$30

      const generatedSku = generateVariantSku(product.sku, combo);

      return {
        id: `v-${idx}`,
        productId: product.id,
        sku: generatedSku,
        barcode: null,
        priceCents: price,
        compareAtCents: product.compareAtCents
          ? product.compareAtCents + (price - product.priceCents)
          : null,
        stock: product.stock > 0 ? product.stock + (idx % 5) : 0,
        condition: combo["Condition"] === "Grade A" ? ProductCondition.GRADE_A : ProductCondition.GRADE_B,
        conditionNotes: null,
        warrantyMonths: warranty === "12 Months" ? 12 : 6,
        weightGrams: null,
        dimensions: null,
        status: PublishStatus.PUBLISHED,
        position: idx,
        images: [],
        selectedOptions: combo,
        selectedOptionValueIds: [],
      };
    });
  }

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    basePriceCents: product.priceCents,
    baseCompareAtCents: product.compareAtCents,
    baseStock: product.stock,
    baseCondition: product.condition,
    baseWarrantyMonths: product.warrantyMonths,
    options: finalOptions,
    variants: finalVariants,
  };
}

/**
 * Persist variant matrix options and variant rows into PostgreSQL database.
 */
export async function saveProductVariants(
  productId: string,
  variantData: {
    options: Array<{ name: string; valuesStr: string }>;
    variants: Array<{
      sku: string;
      barcode?: string;
      price: string;
      compareAtPrice?: string;
      stock: number;
      condition?: string;
      warrantyMonths?: number;
      status?: PublishStatus;
      selectedOptions: Record<string, string>;
    }>;
  },
) {
  if (!variantData || !Array.isArray(variantData.options)) return;

  // 1. Clear existing options & variants for this product
  await db.productOption.deleteMany({ where: { productId } });
  await db.productVariant.deleteMany({ where: { productId } });

  // 2. Create ProductOptions and ProductOptionValues
  const optionValueMap = new Map<string, string>(); // "OptionName:Value" -> optionValueId

  for (let i = 0; i < variantData.options.length; i++) {
    const opt = variantData.options[i];
    if (!opt.name.trim() || !opt.valuesStr.trim()) continue;

    const values = opt.valuesStr
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (values.length === 0) continue;

    const createdOpt = await db.productOption.create({
      data: {
        productId,
        name: opt.name.trim(),
        position: i,
        values: {
          create: values.map((val, vIdx) => ({
            value: val,
            position: vIdx,
          })),
        },
      },
      include: { values: true },
    });

    createdOpt.values.forEach((valObj) => {
      optionValueMap.set(`${createdOpt.name}:${valObj.value}`, valObj.id);
    });
  }

  // 3. Create ProductVariants & OptionValue join records
  for (let vIdx = 0; vIdx < variantData.variants.length; vIdx++) {
    const v = variantData.variants[vIdx];
    if (!v.sku) continue;

    const priceCents = Math.round(parseFloat(v.price || "0") * 100);
    const compareAtCents = v.compareAtPrice
      ? Math.round(parseFloat(v.compareAtPrice) * 100)
      : null;

    const createdVariant = await db.productVariant.create({
      data: {
        productId,
        sku: v.sku.trim(),
        barcode: v.barcode || null,
        priceCents,
        compareAtCents,
        stock: v.stock || 0,
        warrantyMonths: v.warrantyMonths || 12,
        status: (v.status as PublishStatus) || PublishStatus.PUBLISHED,
        position: vIdx,
      },
    });

    // Link OptionValues to ProductVariant
    const optionValueIds: string[] = [];
    if (v.selectedOptions) {
      Object.entries(v.selectedOptions).forEach(([optName, val]) => {
        const optionValueId = optionValueMap.get(`${optName}:${val}`);
        if (optionValueId) {
          optionValueIds.push(optionValueId);
        }
      });
    }

    if (optionValueIds.length > 0) {
      await db.productVariantOptionValue.createMany({
        data: optionValueIds.map((optValId) => ({
          variantId: createdVariant.id,
          optionValueId: optValId,
        })),
      });
    }
  }
}
