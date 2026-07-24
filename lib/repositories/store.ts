import "server-only";

import { db } from "@/lib/db";
import { PublishStatus } from "@/lib/generated/prisma/enums";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { SortValue } from "@/lib/store/sort";

/**
 * Data access for the refurbished store. Pages import from here rather than
 * touching `db` directly.
 */

/** Shared shape for anything rendering a product card. */
const CARD_SELECT = {
  id: true,
  slug: true,
  name: true,
  priceCents: true,
  compareAtCents: true,
  condition: true,
  warrantyMonths: true,
  shortDescription: true,
  stock: true,
  ratingAvg: true,
  ratingCount: true,
  featured: true,
  bestSeller: true,
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  images: {
    select: { url: true, alt: true },
    orderBy: { position: "asc" },
  },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{
  select: typeof CARD_SELECT;
}>;

// Re-exported for convenience; defined in lib/store/sort.ts so Client
// Components can import them without pulling in Prisma. The local import is
// needed as well — a re-export alone does not bind the name in this module.
export { SORT_OPTIONS, type SortValue } from "@/lib/store/sort";

function orderBy(sort: SortValue): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ priceCents: "asc" }];
    case "price-desc":
      return [{ priceCents: "desc" }];
    case "rating":
      return [{ ratingAvg: "desc" }, { ratingCount: "desc" }];
    case "best-selling":
      return [{ bestSeller: "desc" }, { ratingCount: "desc" }];
    case "popular":
      return [{ featured: "desc" }, { ratingCount: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

export type ProductFilters = {
  category?: string;
  brands?: string[];
  conditions?: string[];
  minCents?: number;
  maxCents?: number;
  inStockOnly?: boolean;
  minWarranty?: number;
  search?: string;
  sort?: SortValue;
  page?: number;
  perPage?: number;
};

function buildWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    status: PublishStatus.PUBLISHED,
  };

  if (filters.category) where.category = { slug: filters.category };
  if (filters.brands?.length) where.brand = { slug: { in: filters.brands } };
  if (filters.conditions?.length) {
    where.condition = {
      in: filters.conditions as Prisma.EnumProductConditionFilter["in"],
    };
  }
  if (filters.inStockOnly) where.stock = { gt: 0 };
  if (filters.minWarranty) where.warrantyMonths = { gte: filters.minWarranty };

  if (filters.minCents != null || filters.maxCents != null) {
    where.priceCents = {
      ...(filters.minCents != null ? { gte: filters.minCents } : {}),
      ...(filters.maxCents != null ? { lte: filters.maxCents } : {}),
    };
  }

  if (filters.search?.trim()) {
    const term = filters.search.trim();
    // `mode: "insensitive"` is Postgres ILIKE under the hood.
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { shortDescription: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
      { brand: { name: { contains: term, mode: "insensitive" } } },
      { category: { name: { contains: term, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function getProducts(filters: ProductFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(48, Math.max(1, filters.perPage ?? 12));
  const where = buildWhere(filters);

  // Count and page are fetched together — two sequential round trips would
  // double the latency of every listing render.
  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: orderBy(filters.sort ?? "newest"),
      skip: (page - 1) * perPage,
      take: perPage,
      select: CARD_SELECT,
    }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, status: PublishStatus.PUBLISHED },
    include: {
      brand: true,
      category: true,
      specs: { orderBy: { position: "asc" } },
      images: { orderBy: { position: "asc" } },
      // Only moderator-approved reviews are shown publicly.
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getProductSlugs() {
  const rows = await db.product.findMany({
    where: { status: PublishStatus.PUBLISHED },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

/** Products in the same category, excluding the one being viewed. */
export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  take = 4,
) {
  return db.product.findMany({
    where: {
      status: PublishStatus.PUBLISHED,
      categoryId,
      id: { not: excludeId },
    },
    orderBy: [{ bestSeller: "desc" }, { ratingCount: "desc" }],
    take,
    select: CARD_SELECT,
  });
}

/** Look up specific products by slug — used by cart, wishlist and compare,
 *  which store only slugs client-side. */
export async function getProductsBySlugs(slugs: string[]) {
  if (!slugs.length) return [];
  return db.product.findMany({
    where: { slug: { in: slugs }, status: PublishStatus.PUBLISHED },
    select: CARD_SELECT,
  });
}

export async function getFeaturedProducts(take = 8) {
  try {
    const featured = await db.product.findMany({
      where: { status: PublishStatus.PUBLISHED, featured: true },
      orderBy: { ratingCount: "desc" },
      take,
      select: CARD_SELECT,
    });
    if (featured.length > 0) return featured;
    return await db.product.findMany({
      where: { status: PublishStatus.PUBLISHED },
      orderBy: { createdAt: "desc" },
      take,
      select: CARD_SELECT,
    });
  } catch (err) {
    console.error("Error fetching featured products:", err);
    return [];
  }
}

export async function getBestSellers(take = 8) {
  try {
    const sellers = await db.product.findMany({
      where: { status: PublishStatus.PUBLISHED, bestSeller: true },
      orderBy: { ratingAvg: "desc" },
      take,
      select: CARD_SELECT,
    });
    if (sellers.length > 0) return sellers;
    return await db.product.findMany({
      where: { status: PublishStatus.PUBLISHED },
      orderBy: { priceCents: "desc" },
      take,
      select: CARD_SELECT,
    });
  } catch (err) {
    console.error("Error fetching best sellers:", err);
    return [];
  }
}

/** Biggest percentage savings — powers the deals page. */
export async function getDeals(take = 12) {
  try {
    const items = await db.product.findMany({
      where: { status: PublishStatus.PUBLISHED, compareAtCents: { not: null } },
      select: CARD_SELECT,
    });

    return items
      .map((item) => ({
        item,
        saving:
          item.compareAtCents != null
            ? (item.compareAtCents - item.priceCents) / item.compareAtCents
            : 0,
      }))
      .sort((a, b) => b.saving - a.saving)
      .slice(0, take)
      .map((entry) => entry.item);
  } catch (err) {
    console.error("Error fetching deals:", err);
    return [];
  }
}

export async function getCategories() {
  try {
    return await db.category.findMany({
      orderBy: { position: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}


export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, description: true },
  });
}

export async function getBrands() {
  return db.brand.findMany({
    orderBy: { position: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      _count: { select: { products: { where: { status: PublishStatus.PUBLISHED } } } },
    },
  });
}

export async function getBrandBySlug(slug: string) {
  return db.brand.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true },
  });
}

/** Price bounds across the published catalog, for the filter slider. */
export async function getPriceBounds() {
  const result = await db.product.aggregate({
    where: { status: PublishStatus.PUBLISHED },
    _min: { priceCents: true },
    _max: { priceCents: true },
  });

  return {
    minCents: result._min.priceCents ?? 0,
    maxCents: result._max.priceCents ?? 0,
  };
}

export async function getStoreFaqs() {
  return db.faq.findMany({
    where: { division: "REFURBISHED", status: PublishStatus.PUBLISHED },
    orderBy: { position: "asc" },
    select: { id: true, question: true, answer: true },
  });
}

export async function getStoreTestimonials() {
  return db.testimonial.findMany({
    where: { division: "REFURBISHED", status: PublishStatus.PUBLISHED },
    orderBy: [{ featured: "desc" }, { position: "asc" }],
    select: {
      id: true,
      quote: true,
      author: true,
      role: true,
      company: true,
      rating: true,
      avatarUrl: true,
    },
  });
}

/** Lightweight search for the header's instant-search dropdown. */
export async function searchProducts(term: string, take = 6) {
  if (!term.trim()) return [];

  return db.product.findMany({
    where: buildWhere({ search: term }),
    orderBy: [{ bestSeller: "desc" }, { ratingCount: "desc" }],
    take,
    select: {
      id: true,
      slug: true,
      name: true,
      priceCents: true,
      condition: true,
      category: { select: { name: true, slug: true } },
      brand: { select: { name: true } },
    },
  });
}
