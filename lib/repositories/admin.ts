import "server-only";

import { db } from "@/lib/db";
import { Division, OrderStatus, ProductCondition, PublishStatus, Role, SubmissionStatus } from "@/lib/generated/prisma/enums";
import type { Prisma } from "@/lib/generated/prisma/client";

// ===========================================================================
// Dashboard
// ===========================================================================

export async function getDashboardStats() {
  const [totalProducts, totalOrders, totalCustomers, totalCategories, lowStockCount, revenueResult] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count({ where: { role: Role.CUSTOMER } }),
    db.category.count(),
    db.product.count({ where: { stock: { lte: 10 } } }),
    db.order.aggregate({
      _sum: { totalCents: true },
    }),
  ]);

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    totalCategories,
    lowStockCount,
    totalRevenueCents: revenueResult._sum.totalCents ?? 0,
  };
}

export async function getRecentOrders(limit = 5) {
  return db.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
  });
}

export async function getLowStockProducts(limit = 5) {
  return db.product.findMany({
    take: limit,
    where: { stock: { lte: 10 } },
    orderBy: { stock: "asc" },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      priceCents: true,
      category: { select: { name: true } },
    },
  });
}

export async function getRecentCustomers(limit = 5) {
  return db.user.findMany({
    take: limit,
    where: { role: Role.CUSTOMER },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
}

/**
 * Revenue per day for the last `days` days, zero-filled so the chart has a
 * point for every day even when nothing sold.
 */
export async function getSalesByDay(days = 7) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const orders = await db.order.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, totalCents: true },
  });

  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + order.totalCents);
  }

  return Array.from(byDay.entries()).map(([date, totalCents]) => ({
    date,
    totalCents,
  }));
}

/**
 * Best sellers by actual order volume. Revenue must be sum(price × qty) per
 * row, which groupBy cannot express, so rows are aggregated in memory —
 * fine at this catalog's scale.
 */
export async function getTopProducts(limit = 5) {
  const items = await db.orderItem.findMany({
    where: { productId: { not: null } },
    select: {
      productId: true,
      quantity: true,
      priceCents: true,
      product: { select: { name: true, slug: true } },
    },
  });

  const byProduct = new Map<
    string,
    { name: string; slug: string; unitsSold: number; revenueCents: number }
  >();

  for (const item of items) {
    if (!item.productId || !item.product) continue;
    const entry = byProduct.get(item.productId) ?? {
      name: item.product.name,
      slug: item.product.slug,
      unitsSold: 0,
      revenueCents: 0,
    };
    entry.unitsSold += item.quantity;
    entry.revenueCents += item.priceCents * item.quantity;
    byProduct.set(item.productId, entry);
  }

  return Array.from(byProduct.entries())
    .map(([id, entry]) => ({ id, ...entry }))
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit);
}

/** Revenue share per category, from snapshotted order items. */
export async function getSalesByCategory() {
  const items = await db.orderItem.findMany({
    select: {
      priceCents: true,
      quantity: true,
      product: { select: { category: { select: { name: true } } } },
    },
  });

  const byCategory = new Map<string, number>();
  let total = 0;
  for (const item of items) {
    const name = item.product?.category.name ?? "Other";
    const value = item.priceCents * item.quantity;
    byCategory.set(name, (byCategory.get(name) ?? 0) + value);
    total += value;
  }

  return Array.from(byCategory.entries())
    .map(([name, totalCents]) => ({
      name,
      totalCents,
      percent: total > 0 ? (totalCents / total) * 100 : 0,
    }))
    .sort((a, b) => b.totalCents - a.totalCents);
}

// ===========================================================================
// Products Module
// ===========================================================================

export type AdminProductFilters = {
  search?: string;
  categoryId?: string;
  brandId?: string;
  condition?: ProductCondition;
  status?: PublishStatus;
  page?: number;
  limit?: number;
};

export async function getAdminProducts(filters: AdminProductFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 10);
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};

  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.brandId) where.brandId = filters.brandId;
  if (filters.condition) where.condition = filters.condition;
  if (filters.status) where.status = filters.status;

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: { take: 1, select: { url: true } },
      },
    }),
    db.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { position: "asc" } },
      specs: { orderBy: { position: "asc" } },
    },
  });
}

export async function createAdminProduct(data: {
  name: string;
  slug: string;
  sku: string;
  priceCents: number;
  compareAtCents?: number | null;
  categoryId: string;
  brandId?: string | null;
  condition: ProductCondition;
  warrantyMonths: number;
  stock: number;
  description?: string | null;
  shortDescription?: string | null;
  featured?: boolean;
  bestSeller?: boolean;
  status: PublishStatus;
  images?: string[];
  specs?: Array<{ group?: string; name: string; value: string }>;
}) {
  return db.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      priceCents: data.priceCents,
      compareAtCents: data.compareAtCents,
      categoryId: data.categoryId,
      brandId: data.brandId || null,
      condition: data.condition,
      warrantyMonths: data.warrantyMonths,
      stock: data.stock,
      description: data.description,
      shortDescription: data.shortDescription,
      featured: data.featured ?? false,
      bestSeller: data.bestSeller ?? false,
      status: data.status,
      images: data.images && data.images.length > 0 ? {
        create: data.images.map((url, index) => ({ url, position: index })),
      } : undefined,
      specs: data.specs && data.specs.length > 0 ? {
        create: data.specs.map((s, index) => ({
          group: s.group || null,
          name: s.name,
          value: s.value,
          position: index,
        })),
      } : undefined,
    },
  });
}

export async function updateAdminProduct(
  id: string,
  data: {
    name?: string;
    slug?: string;
    sku?: string;
    priceCents?: number;
    compareAtCents?: number | null;
    categoryId?: string;
    brandId?: string | null;
    condition?: ProductCondition;
    warrantyMonths?: number;
    stock?: number;
    description?: string | null;
    shortDescription?: string | null;
    featured?: boolean;
    bestSeller?: boolean;
    status?: PublishStatus;
    images?: string[];
    specs?: Array<{ group?: string; name: string; value: string }>;
  }
) {
  // Update product fields first
  const updated = await db.product.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      priceCents: data.priceCents,
      compareAtCents: data.compareAtCents,
      categoryId: data.categoryId,
      brandId: data.brandId,
      condition: data.condition,
      warrantyMonths: data.warrantyMonths,
      stock: data.stock,
      description: data.description,
      shortDescription: data.shortDescription,
      featured: data.featured,
      bestSeller: data.bestSeller,
      status: data.status,
    },
  });

  if (data.images) {
    await db.productImage.deleteMany({ where: { productId: id } });
    if (data.images.length > 0) {
      await db.productImage.createMany({
        data: data.images.map((url, position) => ({
          productId: id,
          url,
          position,
        })),
      });
    }
  }

  if (data.specs) {
    await db.productSpec.deleteMany({ where: { productId: id } });
    if (data.specs.length > 0) {
      await db.productSpec.createMany({
        data: data.specs.map((s, position) => ({
          productId: id,
          group: s.group || null,
          name: s.name,
          value: s.value,
          position,
        })),
      });
    }
  }

  return updated;
}

export async function deleteAdminProduct(id: string) {
  return db.product.delete({ where: { id } });
}

export async function bulkDeleteProducts(ids: string[]) {
  return db.product.deleteMany({ where: { id: { in: ids } } });
}

export async function bulkUpdateProductStatus(ids: string[], status: PublishStatus) {
  return db.product.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });
}

// ===========================================================================
// Categories Module
// ===========================================================================

export async function getAdminCategories() {
  return db.category.findMany({
    orderBy: { position: "asc" },
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true, children: true } },
    },
  });
}

export async function getAdminCategoryById(id: string) {
  return db.category.findUnique({
    where: { id },
    include: { parent: true },
  });
}

export async function createAdminCategory(data: {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  position?: number;
}) {
  return db.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      parentId: data.parentId || null,
      position: data.position ?? 0,
    },
  });
}

export async function updateAdminCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    imageUrl?: string | null;
    parentId?: string | null;
    position?: number;
  }
) {
  return db.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl,
      parentId: data.parentId || null,
      position: data.position,
    },
  });
}

export async function deleteAdminCategory(id: string) {
  return db.category.delete({ where: { id } });
}

// ===========================================================================
// Brands Module
// ===========================================================================

export async function getAdminBrands() {
  return db.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function getAdminBrandById(id: string) {
  return db.brand.findUnique({ where: { id } });
}

export async function createAdminBrand(data: {
  name: string;
  slug: string;
  logoUrl?: string | null;
  position?: number;
}) {
  return db.brand.create({
    data: {
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl || null,
      position: data.position ?? 0,
    },
  });
}

export async function updateAdminBrand(
  id: string,
  data: {
    name?: string;
    slug?: string;
    logoUrl?: string | null;
    position?: number;
  }
) {
  return db.brand.update({
    where: { id },
    data,
  });
}

export async function deleteAdminBrand(id: string) {
  return db.brand.delete({ where: { id } });
}

// ===========================================================================
// Orders Module
// ===========================================================================

export async function getAdminOrders(filters: { search?: string; status?: OrderStatus; page?: number; limit?: number } = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 10);
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};

  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.status) where.status = filters.status;

  const [items, total] = await Promise.all([
    db.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
    }),
    db.order.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              images: { take: 1, select: { url: true } },
            },
          },
        },
      },
    },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return db.order.update({
    where: { id },
    data: { status },
  });
}

export async function updateOrderNotes(id: string, notes: string | null) {
  return db.order.update({
    where: { id },
    data: { notes },
  });
}

// ===========================================================================
// Customers Module
// ===========================================================================

export async function getAdminCustomers(filters: { search?: string; page?: number; limit?: number } = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 10);
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = { role: Role.CUSTOMER };

  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        createdAt: true,
        orders: {
          select: { totalCents: true },
        },
        _count: { select: { orders: true, wishlistItems: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  return {
    items: items.map((user) => ({
      ...user,
      totalSpentCents: user.orders.reduce((sum, o) => sum + o.totalCents, 0),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminCustomerById(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
      wishlistItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              priceCents: true,
              images: { take: 1, select: { url: true } },
            },
          },
        },
      },
    },
  });
}

// ===========================================================================
// Blog CMS Module
// ===========================================================================

export async function getAdminPosts(filters: { search?: string; status?: PublishStatus; page?: number; limit?: number } = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 10);
  const skip = (page - 1) * limit;

  const where: Prisma.PostWhereInput = {};

  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.status) where.status = filters.status;

  const [items, total] = await Promise.all([
    db.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { name: true, email: true } },
        coverImage: { select: { url: true } },
      },
    }),
    db.post.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminPostById(id: string) {
  return db.post.findUnique({
    where: { id },
    include: {
      coverImage: true,
      category: true,
      author: { select: { id: true, name: true } },
    },
  });
}

export async function createAdminPost(data: {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  status: PublishStatus;
  coverImageUrl?: string | null;
  authorId?: string | null;
  publishedAt?: Date | null;
}) {
  let coverAssetId: string | undefined = undefined;

  if (data.coverImageUrl) {
    const asset = await db.mediaAsset.create({
      data: {
        url: data.coverImageUrl,
        key: `blog-cover-${Date.now()}`,
        filename: data.slug,
        mimeType: "image/jpeg",
        sizeBytes: 1024,
      },
    });
    coverAssetId = asset.id;
  }

  return db.post.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: data.content,
      status: data.status,
      coverImageId: coverAssetId,
      authorId: data.authorId || null,
      publishedAt: data.status === PublishStatus.PUBLISHED ? (data.publishedAt || new Date()) : null,
    },
  });
}

export async function updateAdminPost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string | null;
    content?: string;
    status?: PublishStatus;
    coverImageUrl?: string | null;
    authorId?: string | null;
    publishedAt?: Date | null;
  }
) {
  let coverAssetId: string | undefined | null = undefined;

  if (data.coverImageUrl !== undefined) {
    if (data.coverImageUrl) {
      const asset = await db.mediaAsset.create({
        data: {
          url: data.coverImageUrl,
          key: `blog-cover-${Date.now()}`,
          filename: data.slug || "blog",
          mimeType: "image/jpeg",
          sizeBytes: 1024,
        },
      });
      coverAssetId = asset.id;
    } else {
      coverAssetId = null;
    }
  }

  return db.post.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      status: data.status,
      coverImageId: coverAssetId,
      authorId: data.authorId,
      publishedAt: data.status === PublishStatus.PUBLISHED ? (data.publishedAt || new Date()) : null,
    },
  });
}

export async function deleteAdminPost(id: string) {
  return db.post.delete({ where: { id } });
}

// ===========================================================================
// Disposal CMS Module
// ===========================================================================

export async function getDisposalCmsData() {
  const [hero, services, steps, industries, certifications, testimonials, faqs, submissions] = await Promise.all([
    db.pageSection.findUnique({ where: { key: "disposal.hero" } }),
    db.disposalService.findMany({ orderBy: { position: "asc" } }),
    db.processStep.findMany({ orderBy: { step: "asc" } }),
    db.industry.findMany({ orderBy: { position: "asc" } }),
    db.certification.findMany({ orderBy: { position: "asc" } }),
    db.testimonial.findMany({ where: { division: Division.DISPOSAL }, orderBy: { position: "asc" } }),
    db.faq.findMany({ where: { division: Division.DISPOSAL }, orderBy: { position: "asc" } }),
    db.contactSubmission.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return {
    hero: hero?.content as any || {
      eyebrow: "ISO 27001 · R2 Certified",
      heading: "Retire IT assets without inheriting the risk",
      subheading: "Secure data wiping, certified destruction and zero-landfill recycling.",
    },
    services,
    steps,
    industries,
    certifications,
    testimonials,
    faqs,
    submissions,
  };
}

export async function updateDisposalHero(content: any) {
  return db.pageSection.upsert({
    where: { key: "disposal.hero" },
    update: { content, division: Division.DISPOSAL },
    create: { key: "disposal.hero", division: Division.DISPOSAL, content },
  });
}

export async function upsertDisposalService(data: { id?: string; slug: string; title: string; summary: string; icon: string; position?: number }) {
  if (data.id) {
    return db.disposalService.update({
      where: { id: data.id },
      data: { slug: data.slug, title: data.title, summary: data.summary, icon: data.icon, position: data.position ?? 0 },
    });
  }
  return db.disposalService.create({
    data: { slug: data.slug, title: data.title, summary: data.summary, icon: data.icon, position: data.position ?? 0 },
  });
}

export async function deleteDisposalService(id: string) {
  return db.disposalService.delete({ where: { id } });
}

export async function upsertProcessStep(data: { id?: string; step: number; title: string; description: string }) {
  if (data.id) {
    return db.processStep.update({
      where: { id: data.id },
      data: { step: data.step, title: data.title, description: data.description },
    });
  }
  return db.processStep.create({
    data: { step: data.step, title: data.title, description: data.description },
  });
}

export async function deleteProcessStep(id: string) {
  return db.processStep.delete({ where: { id } });
}

export async function upsertIndustry(data: { id?: string; slug: string; name: string; description?: string }) {
  if (data.id) {
    return db.industry.update({
      where: { id: data.id },
      data: { slug: data.slug, name: data.name, description: data.description || null },
    });
  }
  return db.industry.create({
    data: { slug: data.slug, name: data.name, description: data.description || null },
  });
}

export async function deleteIndustry(id: string) {
  return db.industry.delete({ where: { id } });
}

export async function upsertCertification(data: { id?: string; name: string; issuer?: string; description?: string }) {
  if (data.id) {
    return db.certification.update({
      where: { id: data.id },
      data: { name: data.name, issuer: data.issuer || null, description: data.description || null },
    });
  }
  return db.certification.create({
    data: { name: data.name, issuer: data.issuer || null, description: data.description || null },
  });
}

export async function deleteCertification(id: string) {
  return db.certification.delete({ where: { id } });
}

export async function upsertTestimonial(data: { id?: string; quote: string; author: string; role?: string; company?: string; rating?: number; division?: Division }) {
  if (data.id) {
    return db.testimonial.update({
      where: { id: data.id },
      data: {
        quote: data.quote,
        author: data.author,
        role: data.role || null,
        company: data.company || null,
        rating: data.rating ?? 5,
        division: data.division || Division.DISPOSAL,
      },
    });
  }
  return db.testimonial.create({
    data: {
      quote: data.quote,
      author: data.author,
      role: data.role || null,
      company: data.company || null,
      rating: data.rating ?? 5,
      division: data.division || Division.DISPOSAL,
    },
  });
}

export async function deleteTestimonial(id: string) {
  return db.testimonial.delete({ where: { id } });
}

export async function upsertFaq(data: { id?: string; question: string; answer: string; division?: Division; category?: string }) {
  if (data.id) {
    return db.faq.update({
      where: { id: data.id },
      data: { question: data.question, answer: data.answer, division: data.division || Division.DISPOSAL, category: data.category || null },
    });
  }
  return db.faq.create({
    data: { question: data.question, answer: data.answer, division: data.division || Division.DISPOSAL, category: data.category || null },
  });
}

export async function deleteFaq(id: string) {
  return db.faq.delete({ where: { id } });
}

export async function updateContactSubmissionStatus(id: string, status: SubmissionStatus) {
  return db.contactSubmission.update({
    where: { id },
    data: { status },
  });
}

// ===========================================================================
// Media Library Module
// ===========================================================================

export async function getAdminMediaAssets(filters: { search?: string; page?: number; limit?: number } = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 12);
  const skip = (page - 1) * limit;

  const where: Prisma.MediaAssetWhereInput = {};

  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { filename: { contains: q, mode: "insensitive" } },
      { url: { contains: q, mode: "insensitive" } },
      { alt: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    db.mediaAsset.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.mediaAsset.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createMediaAsset(data: { url: string; filename: string; mimeType?: string; sizeBytes?: number; alt?: string }) {
  return db.mediaAsset.create({
    data: {
      url: data.url,
      key: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      filename: data.filename,
      mimeType: data.mimeType || "image/jpeg",
      sizeBytes: data.sizeBytes || 204800,
      alt: data.alt || null,
    },
  });
}

export async function deleteMediaAsset(id: string) {
  return db.mediaAsset.delete({ where: { id } });
}

// ===========================================================================
// SEO Management Module
// ===========================================================================

export async function getAdminSeoMetas() {
  return db.seoMeta.findMany({
    orderBy: { path: "asc" },
  });
}

export async function upsertAdminSeoMeta(data: {
  path: string;
  title?: string | null;
  description?: string | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
}) {
  return db.seoMeta.upsert({
    where: { path: data.path },
    update: {
      title: data.title || null,
      description: data.description || null,
      ogImageUrl: data.ogImageUrl || null,
      canonicalUrl: data.canonicalUrl || null,
      noIndex: data.noIndex ?? false,
    },
    create: {
      path: data.path,
      title: data.title || null,
      description: data.description || null,
      ogImageUrl: data.ogImageUrl || null,
      canonicalUrl: data.canonicalUrl || null,
      noIndex: data.noIndex ?? false,
    },
  });
}

export async function deleteAdminSeoMeta(id: string) {
  return db.seoMeta.delete({ where: { id } });
}

// ===========================================================================
// Settings Module
// ===========================================================================

export async function getAdminSiteSettings() {
  const section = await db.pageSection.findUnique({
    where: { key: "site.settings" },
  });

  return (section?.content as any) || {
    companyName: "Rhydm Technologies",
    tagline: "Enterprise IT Asset Disposal & Refurbished Electronics",
    email: "support@rhydm.tech",
    phone: "+1 (800) 555-0199",
    address: "100 Technology Plaza, San Francisco, CA 94107",
    twitterUrl: "https://twitter.com/rhydmtech",
    linkedinUrl: "https://linkedin.com/company/rhydmtech",
    githubUrl: "https://github.com/rhydmtech",
    logoUrl: "/logo.svg",
    faviconUrl: "/favicon.ico",
  };
}

export async function updateAdminSiteSettings(content: any) {
  return db.pageSection.upsert({
    where: { key: "site.settings" },
    update: { content, division: Division.REFURBISHED },
    create: { key: "site.settings", division: Division.REFURBISHED, content },
  });
}

// ===========================================================================
// Analytics Module
// ===========================================================================

export async function getAdminAnalyticsData() {
  const [totalProducts, totalOrders, totalCustomers, orderAggregate, ordersByStatus, topCategories] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count({ where: { role: Role.CUSTOMER } }),
    db.order.aggregate({ _sum: { totalCents: true } }),
    db.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    db.category.findMany({
      take: 5,
      select: {
        name: true,
        _count: { select: { products: true } },
      },
    }),
  ]);

  return {
    overview: {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenueCents: orderAggregate._sum.totalCents ?? 0,
    },
    ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count.id })),
    topCategories: topCategories.map((c) => ({ name: c.name, count: c._count.products })),
  };
}

// ===========================================================================
// Deals Module
// ===========================================================================
//
// A "deal" is a product whose compareAtCents exceeds its priceCents — the
// same rule the storefront's deals page uses. Managing deals therefore means
// managing those two fields, not a separate table.

export async function getAdminDeals() {
  const products = await db.product.findMany({
    where: { compareAtCents: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      sku: true,
      priceCents: true,
      compareAtCents: true,
      stock: true,
      status: true,
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
    },
  });

  // Largest saving first — mirrors the storefront ordering.
  return products.sort((a, b) => {
    const savingA = a.compareAtCents ? (a.compareAtCents - a.priceCents) / a.compareAtCents : 0;
    const savingB = b.compareAtCents ? (b.compareAtCents - b.priceCents) / b.compareAtCents : 0;
    return savingB - savingA;
  });
}

/** Published products not currently on a deal — the add-to-deal picker. */
export async function getDealCandidates() {
  return db.product.findMany({
    where: { compareAtCents: null, status: PublishStatus.PUBLISHED },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      sku: true,
      priceCents: true,
      category: { select: { name: true } },
    },
  });
}
