import Link from "next/link";
import { Plus, Bookmark, Edit, Trash2 } from "lucide-react";
import { getAdminBrands } from "@/lib/repositories/admin";
import { deleteBrandAction } from "@/app/admin/actions";

export default async function AdminBrandsPage() {
  const brands = await getAdminBrands();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Brands</h1>
          <p className="text-sm text-muted-foreground">Manage manufacturer brands and partner logos.</p>
        </div>
        <Link
          href="/admin/brands/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Brand</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-3">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-10 w-10 rounded-lg object-contain border border-border p-1 bg-background shrink-0"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-primary/10 text-primary font-bold text-xs shrink-0">
                  <Bookmark className="h-5 w-5" />
                </div>
              )}
              <div>
                <div className="font-semibold text-foreground text-sm">{brand.name}</div>
                <div className="text-xs font-mono text-muted-foreground">{brand.slug}</div>
                <div className="text-[11px] font-medium text-primary mt-0.5">
                  {brand._count.products} Products
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href={`/admin/brands/${brand.id}/edit`}
                className="rounded p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                <Edit className="h-4 w-4" />
              </Link>
              <form action={deleteBrandAction.bind(null, brand.id)} className="inline">
                <button
                  type="submit"
                  className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
