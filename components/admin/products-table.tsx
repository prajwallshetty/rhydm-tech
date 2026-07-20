"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit, Trash2, CheckSquare, Square, Eye, Sparkles, AlertCircle } from "lucide-react";
import { bulkDeleteProductsAction, bulkPublishProductsAction, deleteProductAction } from "@/app/admin/actions";
import { formatMoney } from "@/lib/format";
import { PublishStatus } from "@/lib/generated/prisma/enums";

export function ProductsTable({
  productsData,
  categories,
  brands,
  currentFilters,
}: {
  productsData: {
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  categories: any[];
  brands: any[];
  currentFilters: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    condition?: string;
    status?: string;
  };
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const { items, total, page, totalPages } = productsData;

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected products?`)) return;
    setIsDeleting(true);
    await bulkDeleteProductsAction(selectedIds);
    setSelectedIds([]);
    setIsDeleting(false);
    router.refresh();
  };

  const handleBulkStatus = async (status: PublishStatus) => {
    setIsDeleting(true);
    await bulkPublishProductsAction(selectedIds, status);
    setSelectedIds([]);
    setIsDeleting(false);
    router.refresh();
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await deleteProductAction(id);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, SKU, or slug..."
            defaultValue={currentFilters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full rounded-lg border border-input bg-background/50 pl-9 pr-4 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentFilters.categoryId || ""}
            onChange={(e) => handleFilterChange("categoryId", e.target.value)}
            className="rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={currentFilters.brandId || ""}
            onChange={(e) => handleFilterChange("brandId", e.target.value)}
            className="rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={currentFilters.condition || ""}
            onChange={(e) => handleFilterChange("condition", e.target.value)}
            className="rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
          >
            <option value="">All Conditions</option>
            <option value="GRADE_A">Grade A</option>
            <option value="GRADE_B">Grade B</option>
            <option value="GRADE_C">Grade C</option>
            <option value="OPEN_BOX">Open Box</option>
          </select>

          <select
            value={currentFilters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs text-primary font-semibold">
          <span>{selectedIds.length} products selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus(PublishStatus.PUBLISHED)}
              disabled={isDeleting}
              className="rounded bg-primary px-2.5 py-1 text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Publish Selected
            </button>
            <button
              onClick={() => handleBulkStatus(PublishStatus.DRAFT)}
              disabled={isDeleting}
              className="rounded bg-card border border-border px-2.5 py-1 text-foreground hover:bg-muted transition-colors"
            >
              Unpublish Selected
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="rounded bg-destructive px-2.5 py-1 text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/30 font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-muted-foreground hover:text-foreground">
                    {selectedIds.length === items.length && items.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="p-3">Product</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground text-sm">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                items.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-muted/40 transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                    >
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(product.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-9 w-9 rounded-lg object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted font-bold text-muted-foreground text-[10px] shrink-0">
                              IMG
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold truncate max-w-xs">{product.name}</div>
                            {product.featured && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-500">
                                <Sparkles className="h-2.5 w-2.5" /> Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">{product.sku}</td>
                      <td className="p-3">{product.category?.name || "—"}</td>
                      <td className="p-3 font-semibold text-foreground">
                        {formatMoney(product.priceCents)}
                        {product.compareAtCents && (
                          <div className="text-[10px] text-muted-foreground line-through font-normal">
                            {formatMoney(product.compareAtCents)}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-semibold ${
                            product.stock <= 5 ? "text-red-500" : "text-foreground"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                          {product.condition}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            product.status === "PUBLISHED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : product.status === "DRAFT"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/refurbished/products/${product.slug}`}
                            target="_blank"
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteOne(product.id)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-border/60 p-4 text-xs text-muted-foreground">
          <span>
            Showing {items.length} of {total} products
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => handleFilterChange("page", (page - 1).toString())}
              className="rounded border border-border px-2.5 py-1 hover:bg-muted disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 font-medium text-foreground">
              Page {page} of {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => handleFilterChange("page", (page + 1).toString())}
              className="rounded border border-border px-2.5 py-1 hover:bg-muted disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
