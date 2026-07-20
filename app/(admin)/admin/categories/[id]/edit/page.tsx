import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { getAdminCategoryById, getAdminCategories } from "@/lib/repositories/admin";
import { saveCategoryAction } from "@/app/(admin)/admin/actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, allCategories] = await Promise.all([
    getAdminCategoryById(id),
    getAdminCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const parentOptions = allCategories.filter((c) => c.id !== category.id);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <Link
          href="/admin/categories"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Categories</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Category</h1>
        <p className="text-sm text-muted-foreground">Modify {category.name} details.</p>
      </div>

      <form action={saveCategoryAction} className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <input type="hidden" name="id" value={category.id} />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Category Name *</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={category.name}
            className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Slug</label>
          <input
            type="text"
            name="slug"
            defaultValue={category.slug}
            className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Parent Category</label>
          <select
            name="parentId"
            defaultValue={category.parentId || ""}
            className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none focus:border-primary"
          >
            <option value="">None (Top Level)</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Image URL</label>
          <input
            type="text"
            name="imageUrl"
            defaultValue={category.imageUrl || ""}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={category.description || ""}
            className="w-full rounded-lg border border-input bg-background/50 p-3 text-xs outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>Update Category</span>
        </button>
      </form>
    </div>
  );
}
