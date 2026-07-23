import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { getAdminBrandById } from "@/lib/repositories/admin";
import { saveBrandAction } from "@/app/(backend)/(admin)/admin/actions";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await getAdminBrandById(id);

  if (!brand) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <Link
          href="/admin/brands"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Brands</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Brand</h1>
        <p className="text-sm text-muted-foreground">Modify {brand.name} brand details.</p>
      </div>

      <form action={saveBrandAction} className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <input type="hidden" name="id" value={brand.id} />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Brand Name *</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={brand.name}
            className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Slug</label>
          <input
            type="text"
            name="slug"
            defaultValue={brand.slug}
            className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Logo URL</label>
          <input
            type="text"
            name="logoUrl"
            defaultValue={brand.logoUrl || ""}
            placeholder="https://example.com/logo.svg"
            className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>Update Brand</span>
        </button>
      </form>
    </div>
  );
}
