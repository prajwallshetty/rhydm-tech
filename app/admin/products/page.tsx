import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminProducts, getAdminCategories, getAdminBrands } from "@/lib/repositories/admin";
import { ProductsTable } from "@/components/admin/products-table";
import { ProductCondition, PublishStatus } from "@/lib/generated/prisma/enums";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    brandId?: string;
    condition?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const [productsData, categories, brands] = await Promise.all([
    getAdminProducts({
      search: params.search,
      categoryId: params.categoryId,
      brandId: params.brandId,
      condition: params.condition as ProductCondition,
      status: params.status as PublishStatus,
      page,
      limit: 10,
    }),
    getAdminCategories(),
    getAdminBrands(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground">Manage catalog items, pricing, stock, and status.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Product</span>
        </Link>
      </div>

      <ProductsTable
        productsData={productsData}
        categories={categories}
        brands={brands}
        currentFilters={params}
      />
    </div>
  );
}
