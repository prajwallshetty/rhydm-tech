import "server-only";

import { db } from "@/lib/db";
import { Division, MediaType, OrderStatus, ProductCondition, PublishStatus, Role, SubmissionStatus } from "@/lib/generated/prisma/enums";
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
  bannerUrl?: string | null;
  thumbnailUrl?: string | null;
  iconUrl?: string | null;
  parentId?: string | null;
  position?: number;
}) {
  return db.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      bannerUrl: data.bannerUrl || null,
      thumbnailUrl: data.thumbnailUrl || null,
      iconUrl: data.iconUrl || null,
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
    bannerUrl?: string | null;
    thumbnailUrl?: string | null;
    iconUrl?: string | null;
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
      bannerUrl: data.bannerUrl,
      thumbnailUrl: data.thumbnailUrl,
      iconUrl: data.iconUrl,
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

export async function deleteTestimonial(id: string) {
  return db.testimonial.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Testimonials CMS (dedicated manager — all fields, ordering, per division)
// ---------------------------------------------------------------------------

export async function getAdminTestimonials(division?: Division) {
  return db.testimonial.findMany({
    where: division ? { division } : undefined,
    orderBy: [{ division: "asc" }, { position: "asc" }],
  });
}

// Storefront ordering (featured first, then admin position) is applied in the
// store/disposal repositories; the admin list keeps pure position order so
// drag-reordering maps 1:1 to what the admin sees.

export type TestimonialInput = {
  id?: string;
  division: Division;
  author: string;
  role: string | null;
  company: string | null;
  quote: string;
  rating: number | null;
  avatarUrl: string | null;
  featured: boolean;
  status: PublishStatus;
};

export async function upsertTestimonialFull(data: TestimonialInput) {
  const base = {
    division: data.division,
    author: data.author,
    role: data.role,
    company: data.company,
    quote: data.quote,
    rating: data.rating,
    avatarUrl: data.avatarUrl,
    featured: data.featured,
    status: data.status,
  };
  if (data.id) {
    return db.testimonial.update({ where: { id: data.id }, data: base });
  }
  // New rows append to the end of their division's list.
  const last = await db.testimonial.findFirst({
    where: { division: data.division },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  return db.testimonial.create({
    data: { ...base, position: (last?.position ?? -1) + 1 },
  });
}

export async function setTestimonialStatus(id: string, status: PublishStatus) {
  return db.testimonial.update({ where: { id }, data: { status } });
}

/** Persists a new drag order: position becomes the index in `orderedIds`. */
export async function reorderTestimonials(orderedIds: string[]) {
  await db.$transaction(
    orderedIds.map((id, index) =>
      db.testimonial.update({ where: { id }, data: { position: index } }),
    ),
  );
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

/**
 * Real monthly time-series for the analytics dashboard. Everything here is
 * derived from live tables — orders, order items, recently-viewed events — and
 * aggregated in memory (fine at this scale), so the charts never show invented
 * numbers. Months with no activity render as zero rather than being skipped,
 * which keeps the x-axis continuous.
 */
export async function getAnalyticsOverview(months = 6) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const monthKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  // Seed each month bucket so gaps are zeros, not holes.
  const buckets = new Map<
    string,
    { label: string; revenueCents: number; orders: number; units: number; views: number }
  >();
  for (let i = 0; i < months; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    buckets.set(monthKey(d), {
      label: d.toLocaleDateString("en-US", { month: "short" }),
      revenueCents: 0,
      orders: 0,
      units: 0,
      views: 0,
    });
  }

  const [orders, orderItems, views, totalProducts, totalCustomers, stockAgg, lowStock, revenueAgg, totalOrders] =
    await Promise.all([
      db.order.findMany({
        where: { createdAt: { gte: start } },
        select: { createdAt: true, totalCents: true },
      }),
      db.orderItem.findMany({
        where: { order: { createdAt: { gte: start } } },
        select: { quantity: true, order: { select: { createdAt: true } } },
      }),
      db.recentlyViewed.findMany({
        where: { viewedAt: { gte: start } },
        select: { viewedAt: true },
      }),
      db.product.count(),
      db.user.count({ where: { role: Role.CUSTOMER } }),
      db.product.aggregate({ _sum: { stock: true } }),
      db.product.count({ where: { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } } }),
      db.order.aggregate({ _sum: { totalCents: true } }),
      db.order.count(),
    ]);

  for (const o of orders) {
    const b = buckets.get(monthKey(o.createdAt));
    if (b) {
      b.revenueCents += o.totalCents;
      b.orders += 1;
    }
  }
  for (const it of orderItems) {
    const b = it.order ? buckets.get(monthKey(it.order.createdAt)) : undefined;
    if (b) b.units += it.quantity;
  }
  for (const v of views) {
    const b = buckets.get(monthKey(v.viewedAt));
    if (b) b.views += 1;
  }

  const series = Array.from(buckets.values());

  return {
    series,
    snapshot: {
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenueCents: revenueAgg._sum.totalCents ?? 0,
      totalStockUnits: stockAgg._sum.stock ?? 0,
      lowStock,
    },
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

// ===========================================================================
// Media (Cloudinary)
// ===========================================================================

/** Reference counts for delete protection — where is this asset used? */
export async function getMediaUsage(id: string) {
  const asset = await db.mediaAsset.findUnique({
    where: { id },
    select: {
      _count: {
        select: {
          productImages: true,
          variantImages: true,
          certifications: true,
          posts: true,
        },
      },
    },
  });
  if (!asset) return null;
  const c = asset._count;
  return {
    products: c.productImages,
    variants: c.variantImages,
    certifications: c.certifications,
    posts: c.posts,
    total: c.productImages + c.variantImages + c.certifications + c.posts,
  };
}

export async function getMediaLibrary(filters: {
  search?: string;
  type?: MediaType;
  folder?: string;
} = {}) {
  const where: Prisma.MediaAssetWhereInput = {};
  if (filters.search?.trim()) {
    const term = filters.search.trim();
    where.OR = [
      { filename: { contains: term, mode: "insensitive" } },
      { alt: { contains: term, mode: "insensitive" } },
      { key: { contains: term, mode: "insensitive" } },
    ];
  }
  if (filters.type) where.type = filters.type;
  // Cloudinary folder is the public_id prefix (stored in `key`).
  if (filters.folder) where.key = { startsWith: `${filters.folder}/` };

  return db.mediaAsset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 120,
    select: {
      id: true,
      url: true,
      key: true,
      type: true,
      filename: true,
      mimeType: true,
      sizeBytes: true,
      width: true,
      height: true,
      alt: true,
      createdAt: true,
      _count: {
        select: {
          productImages: true,
          variantImages: true,
          certifications: true,
          posts: true,
        },
      },
    },
  });
}

// ===========================================================================
// Reviews Module
// ===========================================================================

export type ReviewStatusFilter = "PENDING" | "APPROVED" | "REJECTED";

export type AdminReviewFilters = {
  search?: string;
  rating?: number;
  verified?: "verified" | "unverified";
  status?: ReviewStatusFilter;
  productId?: string;
  page?: number;
  limit?: number;
};

export async function getAdminReviews(filters: AdminReviewFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 20);
  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = {};
  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { author: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { body: { contains: q, mode: "insensitive" } },
      { product: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (filters.rating) where.rating = filters.rating;
  if (filters.verified === "verified") where.verified = true;
  if (filters.verified === "unverified") where.verified = false;
  if (filters.status) where.status = filters.status;
  if (filters.productId) where.productId = filters.productId;

  const [items, total, verifiedCount, pendingCount, avg] = await Promise.all([
    db.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, slug: true } },
      },
    }),
    db.review.count({ where }),
    db.review.count({ where: { ...where, verified: true } }),
    db.review.count({ where: { status: "PENDING" } }),
    db.review.aggregate({ where, _avg: { rating: true } }),
  ]);

  return {
    items,
    total,
    verifiedCount,
    pendingCount,
    averageRating: avg._avg.rating ?? 0,
    page,
    limit,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function setReviewVerified(id: string, verified: boolean) {
  return db.review.update({ where: { id }, data: { verified } });
}

export async function setReviewStatus(id: string, status: ReviewStatusFilter) {
  return db.review.update({ where: { id }, data: { status } });
}

export async function deleteAdminReview(id: string) {
  return db.review.delete({ where: { id } });
}

// ===========================================================================
// Coupons Module
// ===========================================================================

export type AdminCouponInput = {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSpendCents: number | null;
  active: boolean;
  expiresAt: Date | null;
  usageLimit: number | null;
  oncePerCustomer: boolean;
  // Stored as slugs (category slugs / product slugs) so the storefront cart —
  // which knows slugs, not ids — can match without an extra lookup.
  categoryIds: string[];
  productIds: string[];
};

export async function getAdminCoupons() {
  return db.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

function couponData(input: AdminCouponInput) {
  return {
    code: input.code.trim().toUpperCase(),
    type: input.type,
    value: input.value,
    minSpendCents: input.minSpendCents,
    active: input.active,
    expiresAt: input.expiresAt,
    usageLimit: input.usageLimit,
    oncePerCustomer: input.oncePerCustomer,
    categoryIds: input.categoryIds,
    productIds: input.productIds,
  };
}

export async function createAdminCoupon(input: AdminCouponInput) {
  return db.coupon.create({ data: couponData(input) });
}

export async function updateAdminCoupon(id: string, input: AdminCouponInput) {
  return db.coupon.update({ where: { id }, data: couponData(input) });
}

export async function setCouponActive(id: string, active: boolean) {
  return db.coupon.update({ where: { id }, data: { active } });
}

export async function deleteAdminCoupon(id: string) {
  return db.coupon.delete({ where: { id } });
}

// ===========================================================================
// Inventory Module (a stock-focused view over Products)
// ===========================================================================

export type AdminInventoryFilters = {
  search?: string;
  stockLevel?: "all" | "low" | "out";
  page?: number;
  limit?: number;
};

/** Products at or below this on-hand count are surfaced as "low stock". */
export const LOW_STOCK_THRESHOLD = 10;

export async function getInventory(filters: AdminInventoryFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 20);
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};
  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }
  if (filters.stockLevel === "out") where.stock = { lte: 0 };
  else if (filters.stockLevel === "low")
    where.stock = { gt: 0, lte: LOW_STOCK_THRESHOLD };

  const [items, total, outOfStock, lowStock, unitsAgg] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { stock: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        slug: true,
        stock: true,
        priceCents: true,
        category: { select: { name: true } },
      },
    }),
    db.product.count({ where }),
    db.product.count({ where: { stock: { lte: 0 } } }),
    db.product.count({ where: { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } } }),
    db.product.aggregate({ _sum: { stock: true } }),
  ]);

  return {
    items,
    total,
    outOfStock,
    lowStock,
    totalUnits: unitsAgg._sum.stock ?? 0,
    page,
    limit,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
}

/**
 * Sets absolute on-hand stock and records the change in the movement ledger
 * atomically, so the inventory history always reconciles with the balance.
 */
export async function updateProductStock(
  id: string,
  stock: number,
  reason = "Manual adjustment",
  note?: string,
) {
  const next = Math.max(0, Math.round(stock));
  return db.$transaction(async (tx) => {
    const current = await tx.product.findUnique({
      where: { id },
      select: { stock: true },
    });
    if (!current) throw new Error("Product not found");

    const delta = next - current.stock;
    const product = await tx.product.update({
      where: { id },
      data: { stock: next },
    });

    // Only ledger an actual change.
    if (delta !== 0) {
      await tx.stockMovement.create({
        data: { productId: id, delta, balance: next, reason, note: note || null },
      });
    }
    return product;
  });
}

export async function getStockMovements(productId: string, limit = 30) {
  return db.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
