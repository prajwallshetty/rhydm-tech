"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createAdminSession, clearAdminSession, hashPassword, requireAdmin } from "@/lib/auth/admin";
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
  upsertTestimonial,
  deleteTestimonial,
  upsertFaq,
  deleteFaq,
  updateContactSubmissionStatus,
  createMediaAsset,
  deleteMediaAsset,
  upsertAdminSeoMeta,
  deleteAdminSeoMeta,
  updateAdminSiteSettings,
} from "@/lib/repositories/admin";
import { OrderStatus, ProductCondition, PublishStatus, Role, SubmissionStatus } from "@/lib/generated/prisma/enums";

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
    await createAdminProduct({
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
  }

  revalidatePath("/admin/products");
  revalidatePath("/refurbished", "layout");
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
  const parentId = formData.get("parentId")?.toString() || null;

  if (id) {
    await updateAdminCategory(id, { name, slug, description, imageUrl, parentId });
  } else {
    await createAdminCategory({ name, slug, description, imageUrl, parentId });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/refurbished", "layout");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await deleteAdminCategory(id);
  revalidatePath("/admin/categories");
  revalidatePath("/refurbished", "layout");
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
  revalidatePath("/refurbished", "layout");
  redirect("/admin/brands");
}

export async function deleteBrandAction(id: string) {
  await requireAdmin();
  await deleteAdminBrand(id);
  revalidatePath("/admin/brands");
  revalidatePath("/refurbished", "layout");
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
  revalidatePath("/disposal", "layout");
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
  revalidatePath("/disposal", "layout");
}

export async function deleteDisposalServiceAction(id: string) {
  await requireAdmin();
  await deleteDisposalService(id);
  revalidatePath("/admin/disposal");
  revalidatePath("/disposal", "layout");
}

export async function saveProcessStepAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const step = parseInt(formData.get("step")?.toString() || "1", 10);
  const title = formData.get("title")?.toString() || "";
  const description = formData.get("description")?.toString() || "";

  await upsertProcessStep({ id, step, title, description });
  revalidatePath("/admin/disposal");
  revalidatePath("/disposal", "layout");
}

export async function deleteProcessStepAction(id: string) {
  await requireAdmin();
  await deleteProcessStep(id);
  revalidatePath("/admin/disposal");
  revalidatePath("/disposal", "layout");
}

export async function saveIndustryAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString() || "";
  const slug = formData.get("slug")?.toString() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const description = formData.get("description")?.toString() || "";

  await upsertIndustry({ id, name, slug, description });
  revalidatePath("/admin/disposal");
  revalidatePath("/disposal", "layout");
}

export async function deleteIndustryAction(id: string) {
  await requireAdmin();
  await deleteIndustry(id);
  revalidatePath("/admin/disposal");
  revalidatePath("/disposal", "layout");
}

export async function saveCertificationAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString() || "";
  const issuer = formData.get("issuer")?.toString() || "";
  const description = formData.get("description")?.toString() || "";

  await upsertCertification({ id, name, issuer, description });
  revalidatePath("/admin/disposal");
  revalidatePath("/disposal", "layout");
}

export async function deleteCertificationAction(id: string) {
  await requireAdmin();
  await deleteCertification(id);
  revalidatePath("/admin/disposal");
  revalidatePath("/disposal", "layout");
}

export async function saveTestimonialAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const author = formData.get("author")?.toString() || "";
  const role = formData.get("role")?.toString() || "";
  const company = formData.get("company")?.toString() || "";
  const quote = formData.get("quote")?.toString() || "";
  const rating = parseInt(formData.get("rating")?.toString() || "5", 10);

  await upsertTestimonial({ id, author, role, company, quote, rating });
  revalidatePath("/admin/disposal");
  revalidatePath("/disposal", "layout");
}

export async function deleteTestimonialAction(id: string) {
  await requireAdmin();
  await deleteTestimonial(id);
  revalidatePath("/admin/disposal");
  revalidatePath("/disposal", "layout");
}

export async function saveFaqAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const question = formData.get("question")?.toString() || "";
  const answer = formData.get("answer")?.toString() || "";
  const category = formData.get("category")?.toString() || "";

  await upsertFaq({ id, question, answer, category });
  revalidatePath("/admin/disposal");
  revalidatePath("/disposal", "layout");
}

export async function deleteFaqAction(id: string) {
  await requireAdmin();
  await deleteFaq(id);
  revalidatePath("/admin/disposal");
  revalidatePath("/disposal", "layout");
}

export async function updateSubmissionStatusAction(id: string, status: SubmissionStatus) {
  await requireAdmin();
  await updateContactSubmissionStatus(id, status);
  revalidatePath("/admin/disposal");
  revalidatePath("/disposal", "layout");
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
