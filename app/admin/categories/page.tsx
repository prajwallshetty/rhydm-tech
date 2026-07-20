import Link from "next/link";
import { Plus, Layers, Edit, Trash2 } from "lucide-react";
import { getAdminCategories } from "@/lib/repositories/admin";
import { deleteCategoryAction } from "@/app/admin/actions";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage product classification hierarchy and images.</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
        </Link>
      </div>

      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/30 font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Parent Category</th>
                <th className="p-3">Products</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                    No categories created yet.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="h-8 w-8 rounded-lg object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-primary/10 text-primary font-bold text-[10px] shrink-0">
                            <Layers className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-foreground">{cat.name}</div>
                          {cat.description && (
                            <div className="text-[11px] text-muted-foreground truncate max-w-xs">{cat.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{cat.slug}</td>
                    <td className="p-3">
                      {cat.parent ? (
                        <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground">
                          {cat.parent.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Top Level</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-foreground">{cat._count.products}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/categories/${cat.id}/edit`}
                          className="rounded p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                        <form action={deleteCategoryAction.bind(null, cat.id)} className="inline">
                          <button
                            type="submit"
                            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
