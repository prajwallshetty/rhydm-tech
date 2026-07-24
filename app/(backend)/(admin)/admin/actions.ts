"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createAdminSession, clearAdminSession, hashPassword, requireAdmin } from "@/lib/auth/admin";

function revalidateRefurbishedStorefront() {
  revalidatePath("/[locale]/refurbished", "layout");
  revalidatePath("/en/refurbished", "layout");
  revalidatePath("/de/refurbished", "layout");
}

function revalidateDisposalStorefront() {
  revalidatePath("/[locale]/disposal", "layout");
  revalidatePath("/en/disposal", "layout");
  revalidatePath("/de/disposal", "layout");
}
import {
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  bulkDeleteProducts,
  bulkUpdateProductStatus,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  createAdminBrand,
  updateAdminBrand,
  deleteAdminBrand,
  updateOrderStatus,
  updateOrderNotes,
  createAdminPost,
  updateAdminPost,
  deleteAdminPost,
  updateDisposalHero,
  upsertDisposalService,
  deleteDisposalService,
  upsertProcessStep,
  deleteProcessStep,
  upsertIndustry,
  deleteIndustry,
  upsertCertification,
  deleteCertification,
  deleteTestimonial,
  upsertFaq,
  deleteFaq,
  updateContactSubmissionStatus,
  createMediaAsset,
  deleteMediaAsset,
  upsertAdminSeoMeta,
  deleteAdminSeoMeta,
  updateAdminSiteSettings,
  setReviewVerified,
  setReviewStatus,
  deleteAdminReview,
  type ReviewStatusFilter,
  createAdminCoupon,
  updateAdminCoupon,
  setCouponActive,
  deleteAdminCoupon,
  updateProductStock,
  getStockMovements,
  upsertTestimonialFull,
  setTestimonialStatus,
  reorderTestimonials,
  type AdminCouponInput,
} from "@/lib/repositories/admin";
import { Division, OrderStatus, ProductCondition, PublishStatus, Role, SubmissionStatus } from "@/lib/generated/prisma/enums";
import type { Prisma as PrismaNS } from "@/lib/generated/prisma/client";

// ===========================================================================
// Auth Actions
// ===========================================================================

export async function loginAdminAction(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Please provide email and password." };
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== Role.ADMIN) {
    return { error: "Invalid admin credentials or insufficient permissions." };
  }

  if (!user.passwordHash) {
    return { error: "Admin password hash not set. Run database seed." };
  }

  const hashedInput = hashPassword(password);
  if (hashedInput !== user.passwordHash) {
    return { error: "Invalid email or password." };
  }

  await createAdminSession(user.id);
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  revalidatePath("/admin");
  redirect("/admin/login");
}

// ===========================================================================
// Product Actions
// ===========================================================================

export async function saveProductAction(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim() || "";
  const slug = formData.get("slug")?.toString().trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const sku = formData.get("sku")?.toString().trim() || "";
  const priceCents = Math.round(parseFloat(formData.get("price")?.toString() || "0") * 100);
  const compareAtPriceStr = formData.get("compareAtPrice")?.toString();
  const compareAtCents = compareAtPriceStr ? Math.round(parseFloat(compareAtPriceStr) * 100) : null;

  const categoryId = formData.get("categoryId")?.toString() || "";
  const brandId = formData.get("brandId")?.toString() || null;
  const condition = (formData.get("condition")?.toString() as ProductCondition) || ProductCondition.GRADE_A;
  const warrantyMonths = parseInt(formData.get("warrantyMonths")?.toString() || "12", 10);
  const stock = parseInt(formData.get("stock")?.toString() || "0", 10);
  const description = formData.get("description")?.toString() || "";
  const shortDescription = formData.get("shortDescription")?.toString() || "";
  const featured = formData.get("featured") === "true";
  const bestSeller = formData.get("bestSeller") === "true";
  const status = (formData.get("status")?.toString() as PublishStatus) || PublishStatus.PUBLISHED;

  const imagesRaw = formData.get("images")?.toString() || "";
  const images = imagesRaw.split(",").map((s) => s.trim()).filter(Boolean);

  const specsRaw = formData.get("specs")?.toString() || "";
  let specs: Array<{ group?: string; name: string; value: string }> = [];
  try {
    if (specsRaw) specs = JSON.parse(specsRaw);
  } catch {}

  if (!name || !sku || !categoryId) {
    throw new Error("Missing required product fields.");
  }

  let productId = id;
  if (id) {
    await updateAdminProduct(id, {
      name,
      slug,
      sku,
      priceCents,
      compareAtCents,
      categoryId,
      brandId,
      condition,
      warrantyMonths,
      stock,
      description,
      shortDescription,
      featured,
      bestSeller,
      status,
      images,
      specs,
    });
  } else {
    const created = await createAdminProduct({
      name,
      slug,
      sku,
      priceCents,
      compareAtCents,
      categoryId,
      brandId,
      condition,
      warrantyMonths,
      stock,
      description,
      shortDescription,
      featured,
      bestSeller,
      status,
      images,
      specs,
    });
    productId = created.id;
  }

  const variantDataRaw = formData.get("variantData")?.toString();
  if (productId && variantDataRaw) {
    try {
      const variantData = JSON.parse(variantDataRaw);
      const { saveProductVariants } = await import("@/lib/data/variants");
      await saveProductVariants(productId, variantData);
    } catch (e) {
      console.error("Failed to save product variants:", e);
    }
  }

  revalidatePath("/admin/products");
  revalidateRefurbishedStorefront();
  redirect("/admin/products");
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await deleteAdminProduct(id);
  revalidatePath("/admin/products");
}

export async function bulkDeleteProductsAction(ids: string[]) {
  await requireAdmin();
  await bulkDeleteProducts(ids);
  revalidatePath("/admin/products");
}

export async function bulkPublishProductsAction(ids: string[], status: PublishStatus) {
  await requireAdmin();
  await bulkUpdateProductStatus(ids, status);
  revalidatePath("/admin/products");
}

// ===========================================================================
// Category Actions
// ===========================================================================

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim() || "";
  const slug = formData.get("slug")?.toString().trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const description = formData.get("description")?.toString() || null;
  const imageUrl = formData.get("imageUrl")?.toString() || null;
  const bannerUrl = formData.get("bannerUrl")?.toString() || null;
  const thumbnailUrl = formData.get("thumbnailUrl")?.toString() || null;
  const iconUrl = formData.get("iconUrl")?.toString() || null;
  const parentId = formData.get("parentId")?.toString() || null;

  const payload = { name, slug, description, imageUrl, bannerUrl, thumbnailUrl, iconUrl, parentId };
  if (id) {
    await updateAdminCategory(id, payload);
  } else {
    await createAdminCategory(payload);
  }

  revalidatePath("/admin/categories");
  revalidateRefurbishedStorefront();
  redirect("/admin/categories");
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await deleteAdminCategory(id);
  revalidatePath("/admin/categories");
  revalidateRefurbishedStorefront();
}

// ===========================================================================
// Brand Actions
// ===========================================================================

export async function saveBrandAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim() || "";
  const slug = formData.get("slug")?.toString().trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const logoUrl = formData.get("logoUrl")?.toString() || null;

  if (id) {
    await updateAdminBrand(id, { name, slug, logoUrl });
  } else {
    await createAdminBrand({ name, slug, logoUrl });
  }

  revalidatePath("/admin/brands");
  revalidateRefurbishedStorefront();
  redirect("/admin/brands");
}

export async function deleteBrandAction(id: string) {
  await requireAdmin();
  await deleteAdminBrand(id);
  revalidatePath("/admin/brands");
  revalidateRefurbishedStorefront();
}

// ===========================================================================
// Order Actions
// ===========================================================================

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireAdmin();
  await updateOrderStatus(orderId, status);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function updateOrderNotesAction(orderId: string, notes: string) {
  await requireAdmin();
  await updateOrderNotes(orderId, notes);
  revalidatePath(`/admin/orders/${orderId}`);
}

// ===========================================================================
// Blog Actions
// ===========================================================================

export async function savePostAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim() || "";
  const slug = formData.get("slug")?.toString().trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const excerpt = formData.get("excerpt")?.toString() || null;
  const content = formData.get("content")?.toString() || "";
  const coverImageUrl = formData.get("coverImageUrl")?.toString() || null;
  const status = (formData.get("status")?.toString() as PublishStatus) || PublishStatus.PUBLISHED;

  if (id) {
    await updateAdminPost(id, { title, slug, excerpt, content, coverImageUrl, status });
  } else {
    await createAdminPost({ title, slug, excerpt, content, coverImageUrl, status });
  }

  revalidatePath("/admin/blogs");
  redirect("/admin/blogs");
}

export async function deletePostAction(id: string) {
  await requireAdmin();
  await deleteAdminPost(id);
  revalidatePath("/admin/blogs");
}

// ===========================================================================
// Disposal CMS Actions
// ===========================================================================

export async function saveDisposalHeroAction(formData: FormData) {
  await requireAdmin();
  const eyebrow = formData.get("eyebrow")?.toString() || "";
  const heading = formData.get("heading")?.toString() || "";
  const subheading = formData.get("subheading")?.toString() || "";

  await updateDisposalHero({ eyebrow, heading, subheading });
  revalidatePath("/admin/disposal");
  revalidateDisposalStorefront();
}

export async function saveDisposalServiceAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString() || "";
  const slug = formData.get("slug")?.toString() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const summary = formData.get("summary")?.toString() || "";
  const icon = formData.get("icon")?.toString() || "shield";

  await upsertDisposalService({ id, title, slug, summary, icon });
  revalidatePath("/admin/disposal");
  revalidateDisposalStorefront();
}

export async function deleteDisposalServiceAction(id: string) {
  await requireAdmin();
  await deleteDisposalService(id);
  revalidatePath("/admin/disposal");
  revalidateDisposalStorefront();
}

export async function saveProcessStepAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const step = parseInt(formData.get("step")?.toString() || "1", 10);
  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";

  await upsertProcessStep({ id, step, title, description });
  revalidatePath("/admin/disposal");
  revalidateDisposalStorefront();
}

export async function deleteProcessStepAction(id: string) {
  await requireAdmin();
  await deleteProcessStep(id);
  revalidatePath("/admin/disposal");
  revalidateDisposalStorefront();
}

export async function saveIndustryAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString() || "";
  const slug = formData.get("slug")?.toString() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const description = formData.get("description")?.toString() || "";

  await upsertIndustry({ id, name, slug, description });
  revalidatePath("/admin/disposal");
  revalidateDisposalStorefront();
}

export async function deleteIndustryAction(id: string) {
  await requireAdmin();
  await deleteIndustry(id);
  revalidatePath("/admin/disposal");
  revalidateDisposalStorefront();
}

export async function saveCertificationAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString() || "";
  const issuer = formData.get("issuer")?.toString() || "";
  const description = formData.get("description")?.toString() || "";

  await upsertCertification({ id, name, issuer, description });
  revalidatePath("/admin/disposal");
  revalidateDisposalStorefront();
}

export async function deleteCertificationAction(id: string) {
  await requireAdmin();
  await deleteCertification(id);
  revalidatePath("/admin/disposal");
  revalidateDisposalStorefront();
}


export async function saveFaqAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const question = formData.get("question")?.toString() || "";
  const answer = formData.get("answer")?.toString() || "";
  const category = formData.get("category")?.toString() || "";

  await upsertFaq({ id, question, answer, category });
  revalidatePath("/admin/disposal");
  revalidateDisposalStorefront();
}

export async function deleteFaqAction(id: string) {
  await requireAdmin();
  await deleteFaq(id);
  revalidatePath("/admin/disposal");
  revalidateDisposalStorefront();
}

export async function updateSubmissionStatusAction(id: string, status: SubmissionStatus) {
  await requireAdmin();
  await updateContactSubmissionStatus(id, status);
  revalidatePath("/admin/disposal");
  revalidateDisposalStorefront();
}

// ===========================================================================
// Media Library Actions
// ===========================================================================

export async function createMediaAssetAction(formData: FormData) {
  await requireAdmin();
  const url = formData.get("url")?.toString() || "";
  const filename = formData.get("filename")?.toString() || "image.jpg";
  const alt = formData.get("alt")?.toString() || "";

  if (!url) throw new Error("Image URL is required.");

  await createMediaAsset({ url, filename, alt });
  revalidatePath("/admin/media");
}

export async function deleteMediaAssetAction(id: string) {
  await requireAdmin();
  await deleteMediaAsset(id);
  revalidatePath("/admin/media");
}

// ===========================================================================
// SEO Management Actions
// ===========================================================================

export async function saveSeoMetaAction(formData: FormData) {
  await requireAdmin();
  const path = formData.get("path")?.toString() || "/";
  const title = formData.get("title")?.toString() || null;
  const description = formData.get("description")?.toString() || null;
  const ogImageUrl = formData.get("ogImageUrl")?.toString() || null;
  const canonicalUrl = formData.get("canonicalUrl")?.toString() || null;
  const noIndex = formData.get("noIndex") === "true";

  await upsertAdminSeoMeta({ path, title, description, ogImageUrl, canonicalUrl, noIndex });
  revalidatePath("/admin/seo");
}

export async function deleteSeoMetaAction(id: string) {
  await requireAdmin();
  await deleteAdminSeoMeta(id);
  revalidatePath("/admin/seo");
}

// ===========================================================================
// Settings Actions
// ===========================================================================

export async function saveSiteSettingsAction(formData: FormData) {
  await requireAdmin();
  const companyName = formData.get("companyName")?.toString() || "";
  const tagline = formData.get("tagline")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const address = formData.get("address")?.toString() || "";
  const twitterUrl = formData.get("twitterUrl")?.toString() || "";
  const linkedinUrl = formData.get("linkedinUrl")?.toString() || "";
  const githubUrl = formData.get("githubUrl")?.toString() || "";
  const logoUrl = formData.get("logoUrl")?.toString() || "";
  const faviconUrl = formData.get("faviconUrl")?.toString() || "";

  await updateAdminSiteSettings({
    companyName,
    tagline,
    email,
    phone,
    address,
    twitterUrl,
    linkedinUrl,
    githubUrl,
    logoUrl,
    faviconUrl,
  });

  revalidatePath("/admin/settings");
}

// ===========================================================================
// Deals
// ===========================================================================

/**
 * Puts a product on deal, or reprices an existing deal. The sale price must
 * sit below the compare-at price — an "original price" lower than what the
 * customer pays is a fake discount, so it is rejected rather than saved.
 */
export async function setDealAction(
  productId: string,
  priceCents: number,
  compareAtCents: number,
) {
  await requireAdmin();

  if (
    !Number.isInteger(priceCents) ||
    !Number.isInteger(compareAtCents) ||
    priceCents <= 0 ||
    compareAtCents <= priceCents
  ) {
    return {
      error: "Compare-at price must be higher than the sale price, and both must be positive.",
    };
  }

  await db.product.update({
    where: { id: productId },
    data: { priceCents, compareAtCents },
  });

  revalidatePath("/admin/deals");
  revalidatePath("/refurbished", "layout");
  return { success: true };
}

/** Takes a product off deal — clears the compare-at price, keeps the price. */
export async function endDealAction(productId: string) {
  await requireAdmin();

  await db.product.update({
    where: { id: productId },
    data: { compareAtCents: null },
  });

  revalidatePath("/admin/deals");
  revalidatePath("/refurbished", "layout");
  return { success: true };
}

// ===========================================================================
// Site Content (section registry)
// ===========================================================================

import { getSectionDef } from "@/lib/cms/registry";

/**
 * Saves one registry-defined section. The payload is filtered against the
 * section's field definitions — only registered keys survive, scalars are
 * coerced to strings, list items keep only their registered sub-keys — so a
 * tampered request cannot store arbitrary JSON in PageSection.
 */
export async function saveSiteSectionAction(
  key: string,
  content: unknown,
  locale: string = "en",
) {
  await requireAdmin();

  const def = getSectionDef(key);
  if (!def) return { error: "Unknown section." };
  if (!/^[a-z]{2}$/.test(locale)) return { error: "Invalid locale." };

  // English lives on the base key; other locales on `${key}#${locale}`.
  const storageKey = locale === "en" ? key : `${key}#${locale}`;

  const raw = (content ?? {}) as Record<string, unknown>;
  const clean: Record<string, unknown> = {};

  for (const field of def.fields) {
    const value = raw[field.key];

    if (field.type === "list") {
      if (!Array.isArray(value)) continue;
      clean[field.key] = value
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const row: Record<string, string> = {};
          for (const itemField of field.itemFields) {
            const v = (item as Record<string, unknown>)[itemField.key];
            row[itemField.key] = typeof v === "string" ? v.slice(0, 2000) : "";
          }
          return row;
        })
        // Drop rows the admin left entirely blank.
        .filter((row) => Object.values(row).some((v) => v.trim().length > 0));
    } else if (typeof value === "string") {
      clean[field.key] = value.slice(0, 5000);
    }
  }

  // Prisma's Json input type needs the explicit cast; `clean` is built above
  // from registered string fields only.
  const json = clean as PrismaNS.InputJsonValue;
  await db.pageSection.upsert({
    where: { key: storageKey },
    update: { content: json },
    create: { key: storageKey, division: def.division, content: json },
  });

  revalidatePath("/admin/content");
  // site.settings renders in both divisions' footers.
  if (key === "site.settings") {
    revalidatePath("/disposal", "layout");
    revalidatePath("/refurbished", "layout");
  } else {
    revalidatePath(def.division === "DISPOSAL" ? "/disposal" : "/refurbished", "layout");
  }

  return { success: true };
}

// ===========================================================================
// Media uploads (Cloudinary)
// ===========================================================================

import {
  destroyAsset,
  isCloudinaryConfigured,
  signUpload,
} from "@/lib/media/cloudinary";
import { isMediaFolder, MEDIA_ROOT } from "@/lib/media/folders";
import { getMediaUsage } from "@/lib/repositories/admin";
import { MediaType } from "@/lib/generated/prisma/enums";

/**
 * Step 1 of the upload flow: sign the parameters so the browser can POST the
 * file straight to Cloudinary. The secret never leaves the server; the file
 * bytes never touch it.
 */
export async function signMediaUploadAction(folder: string) {
  await requireAdmin();
  if (!isCloudinaryConfigured()) {
    return { error: "Cloudinary is not configured. Set CLOUDINARY_* env vars." };
  }
  if (!isMediaFolder(folder)) {
    return { error: "Unknown media folder." };
  }
  return { upload: signUpload(`${MEDIA_ROOT}/${folder}`) };
}

function mediaTypeFor(resourceType: string, format: string): MediaType {
  if (resourceType === "video") return MediaType.VIDEO;
  if (resourceType === "image") return MediaType.IMAGE;
  // Cloudinary calls PDFs "image" sometimes and docs "raw" — normalise.
  if (["pdf", "doc", "docx"].includes(format)) return MediaType.DOCUMENT;
  return MediaType.DOCUMENT;
}

/**
 * Step 2: persist what Cloudinary returned. Only whitelisted scalar fields
 * are stored; the secure URL must actually be a Cloudinary URL for our
 * account, so a tampered payload can't inject arbitrary hosts.
 */
export async function recordMediaUploadAction(payload: {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  originalFilename: string;
}) {
  await requireAdmin();
  if (!isCloudinaryConfigured()) return { error: "Cloudinary is not configured." };

  const { publicId, secureUrl, resourceType, format, bytes, width, height, originalFilename } = payload;

  if (
    typeof publicId !== "string" ||
    !publicId.startsWith(`${MEDIA_ROOT}/`) ||
    typeof secureUrl !== "string" ||
    !secureUrl.startsWith("https://res.cloudinary.com/")
  ) {
    return { error: "Invalid upload payload." };
  }

  const asset = await db.mediaAsset.upsert({
    where: { key: publicId },
    update: {},
    create: {
      key: publicId,
      url: secureUrl,
      type: mediaTypeFor(resourceType, format),
      filename: String(originalFilename).slice(0, 255) || publicId.split("/").pop() || publicId,
      mimeType: `${resourceType}/${format}`.slice(0, 100),
      sizeBytes: Number.isFinite(bytes) ? Math.max(0, Math.round(bytes)) : 0,
      width: width ?? null,
      height: height ?? null,
    },
  });

  revalidatePath("/admin/media");
  return { success: true, asset: { id: asset.id, url: asset.url, key: asset.key, alt: asset.alt, filename: asset.filename } };
}

/**
 * Delete with usage protection: reports where the asset is referenced and
 * refuses unless `force` — then removes it at Cloudinary AND in the DB.
 */
export async function deleteMediaWithProtectionAction(id: string, force = false) {
  await requireAdmin();

  const usage = await getMediaUsage(id);
  if (!usage) return { error: "Asset not found." };
  if (usage.total > 0 && !force) {
    return { inUse: usage };
  }

  const asset = await db.mediaAsset.findUnique({
    where: { id },
    select: { key: true, type: true },
  });
  if (!asset) return { error: "Asset not found." };

  if (isCloudinaryConfigured() && asset.key.startsWith(`${MEDIA_ROOT}/`)) {
    const resourceType =
      asset.type === MediaType.VIDEO ? "video" : asset.type === MediaType.DOCUMENT ? "raw" : "image";
    const res = await destroyAsset(asset.key, resourceType);
    if (!res.ok) return { error: `Cloudinary refused deletion (${res.result ?? "unknown"}).` };
  }

  await db.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/media");
  return { success: true };
}

/** Alt text is the one editable metadata field this pass. */
export async function updateMediaAltAction(id: string, alt: string) {
  await requireAdmin();
  await db.mediaAsset.update({
    where: { id },
    data: { alt: alt.trim().slice(0, 300) || null },
  });
  revalidatePath("/admin/media");
  return { success: true };
}

/** Image list for the media picker dialog (client fetch, admin-only). */
export async function listMediaForPickerAction() {
  await requireAdmin();
  const rows = await db.mediaAsset.findMany({
    where: { type: MediaType.IMAGE },
    orderBy: { createdAt: "desc" },
    take: 120,
    select: { id: true, url: true, key: true, alt: true, filename: true },
  });
  return { assets: rows };
}

// ===========================================================================
// Review Actions
// ===========================================================================

export async function setReviewVerifiedAction(id: string, verified: boolean) {
  await requireAdmin();
  await setReviewVerified(id, verified);
  revalidatePath("/admin/reviews");
  revalidatePath("/refurbished", "layout");
  return { success: true };
}

export async function setReviewStatusAction(id: string, status: ReviewStatusFilter) {
  await requireAdmin();
  await setReviewStatus(id, status);
  revalidatePath("/admin/reviews");
  revalidatePath("/refurbished", "layout");
  return { success: true };
}

export async function deleteReviewAction(id: string) {
  await requireAdmin();
  await deleteAdminReview(id);
  revalidatePath("/admin/reviews");
  revalidatePath("/refurbished", "layout");
  return { success: true };
}

// ===========================================================================
// Coupon Actions
// ===========================================================================

/** Parses and validates the coupon form; shared by create and update. */
function parseCouponForm(formData: FormData): AdminCouponInput | { error: string } {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "A coupon code is required." };

  const type = String(formData.get("type") ?? "PERCENT") === "FIXED" ? "FIXED" : "PERCENT";
  const rawValue = Number(formData.get("value"));
  if (!Number.isFinite(rawValue) || rawValue <= 0) {
    return { error: "Enter a discount value greater than zero." };
  }
  if (type === "PERCENT" && rawValue > 100) {
    return { error: "A percentage discount cannot exceed 100%." };
  }
  // Percent is stored as a whole number; fixed is stored in cents.
  const value = type === "FIXED" ? Math.round(rawValue * 100) : Math.round(rawValue);

  const minSpendRaw = formData.get("minSpend");
  const minSpend = minSpendRaw && String(minSpendRaw).trim() !== "" ? Number(minSpendRaw) : null;
  const minSpendCents =
    minSpend != null && Number.isFinite(minSpend) && minSpend > 0
      ? Math.round(minSpend * 100)
      : null;

  const expiresRaw = String(formData.get("expiresAt") ?? "").trim();
  const expiresAt = expiresRaw ? new Date(expiresRaw) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    return { error: "The expiry date is invalid." };
  }

  const active = formData.get("active") === "on" || formData.get("active") === "true";
  const oncePerCustomer =
    formData.get("oncePerCustomer") === "on" || formData.get("oncePerCustomer") === "true";

  const usageRaw = formData.get("usageLimit");
  const usageNum = usageRaw && String(usageRaw).trim() !== "" ? Number(usageRaw) : null;
  const usageLimit =
    usageNum != null && Number.isFinite(usageNum) && usageNum > 0 ? Math.round(usageNum) : null;

  // Category scope arrives as repeated checkbox values; product scope as a
  // comma/space/newline-separated list of slugs.
  const categoryIds = formData.getAll("categoryIds").map(String).filter(Boolean);
  const productIds = String(formData.get("productIds") ?? "")
    .split(/[\s,]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return {
    code,
    type,
    value,
    minSpendCents,
    active,
    expiresAt,
    usageLimit,
    oncePerCustomer,
    categoryIds,
    productIds,
  };
}

export async function createCouponAction(formData: FormData) {
  await requireAdmin();
  const parsed = parseCouponForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  try {
    await createAdminCoupon(parsed);
  } catch {
    return { error: "That coupon code is already in use." };
  }
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCouponAction(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = parseCouponForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  try {
    await updateAdminCoupon(id, parsed);
  } catch {
    return { error: "That coupon code is already in use." };
  }
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function setCouponActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await setCouponActive(id, active);
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCouponAction(id: string) {
  await requireAdmin();
  await deleteAdminCoupon(id);
  revalidatePath("/admin/coupons");
  return { success: true };
}

// ===========================================================================
// Inventory Actions
// ===========================================================================

export async function updateStockAction(id: string, stock: number, note?: string) {
  await requireAdmin();
  if (!Number.isFinite(stock) || stock < 0) {
    return { error: "Stock must be a non-negative number." };
  }
  await updateProductStock(id, stock, "Manual adjustment", note);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/refurbished", "layout");
  return { success: true };
}

/** Stock movement history for the inventory drawer (client fetch, admin-only). */
export async function getStockHistoryAction(productId: string) {
  await requireAdmin();
  const movements = await getStockMovements(productId, 30);
  return {
    movements: movements.map((m) => ({
      id: m.id,
      delta: m.delta,
      balance: m.balance,
      reason: m.reason,
      note: m.note,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

// ===========================================================================
// Testimonials CMS Actions
// ===========================================================================

function revalidateTestimonials(division: Division) {
  revalidatePath("/admin/testimonials");
  // Testimonials are division-scoped, so only that site needs refreshing.
  if (division === Division.DISPOSAL) {
    revalidateDisposalStorefront();
  } else {
    revalidateRefurbishedStorefront();
  }
}

export async function saveTestimonialCmsAction(formData: FormData) {
  await requireAdmin();

  const author = String(formData.get("author") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  if (!author || !quote) {
    return { error: "Author and quote are required." };
  }

  const division =
    String(formData.get("division")) === "REFURBISHED"
      ? Division.REFURBISHED
      : Division.DISPOSAL;
  const ratingRaw = Number(formData.get("rating"));
  const rating = Number.isFinite(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null;

  await upsertTestimonialFull({
    id: String(formData.get("id") ?? "") || undefined,
    division,
    author,
    role: String(formData.get("role") ?? "").trim() || null,
    company: String(formData.get("company") ?? "").trim() || null,
    quote,
    rating,
    avatarUrl: String(formData.get("avatarUrl") ?? "").trim() || null,
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    // The checkbox only submits when checked; absent means unpublished.
    status: formData.get("status") === "PUBLISHED" ? PublishStatus.PUBLISHED : PublishStatus.DRAFT,
  });

  revalidateTestimonials(division);
  return { success: true };
}

export async function toggleTestimonialStatusAction(id: string, publish: boolean, division: Division) {
  await requireAdmin();
  await setTestimonialStatus(id, publish ? PublishStatus.PUBLISHED : PublishStatus.DRAFT);
  revalidateTestimonials(division);
  return { success: true };
}

export async function deleteTestimonialCmsAction(id: string, division: Division) {
  await requireAdmin();
  await deleteTestimonial(id);
  revalidateTestimonials(division);
  return { success: true };
}

export async function reorderTestimonialsAction(orderedIds: string[], division: Division) {
  await requireAdmin();
  await reorderTestimonials(orderedIds);
  revalidateTestimonials(division);
  return { success: true };
}
