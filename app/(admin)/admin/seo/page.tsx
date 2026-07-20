import { Globe, Plus, Save, Trash2, ShieldCheck } from "lucide-react";
import { getAdminSeoMetas } from "@/lib/repositories/admin";
import { saveSeoMetaAction, deleteSeoMetaAction } from "@/app/(admin)/admin/actions";

export default async function AdminSeoPage() {
  const seoMetas = await getAdminSeoMetas();

  const presetPaths = [
    { label: "Homepage Gateway (/)", path: "/" },
    { label: "Disposal Website (/disposal)", path: "/disposal" },
    { label: "Refurbished Store (/refurbished)", path: "/refurbished" },
    { label: "Disposal Services (/disposal/services)", path: "/disposal/services" },
    { label: "Store Shop (/refurbished/shop)", path: "/refurbished/shop" },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">SEO Management</h1>
        <p className="text-sm text-muted-foreground">Manage Meta Titles, Descriptions, OG Images, and indexing controls.</p>
      </div>

      {/* Preset Quick Actions */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3">Per-Route SEO Overrides</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {presetPaths.map((preset) => {
            const existing = seoMetas.find((s) => s.path === preset.path);
            return (
              <form key={preset.path} action={saveSeoMetaAction} className="rounded-lg border border-border/60 p-4 bg-muted/20 space-y-3">
                <input type="hidden" name="path" value={preset.path} />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-primary">{preset.label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{preset.path}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Meta Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={existing?.title || ""}
                    placeholder="Page Title — Rhydm"
                    className="w-full rounded border border-input bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Meta Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={existing?.description || ""}
                    placeholder="Compelling search result description..."
                    className="w-full rounded border border-input bg-background p-2 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Open Graph Image URL</label>
                  <input
                    type="text"
                    name="ogImageUrl"
                    defaultValue={existing?.ogImageUrl || ""}
                    placeholder="https://example.com/og-image.jpg"
                    className="w-full rounded border border-input bg-background px-3 py-1.5 text-xs font-mono outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      name="noIndex"
                      value="true"
                      defaultChecked={existing?.noIndex || false}
                      className="rounded border-input text-primary"
                    />
                    <span>NoIndex</span>
                  </label>

                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      </div>

      {/* Custom Path Add Form */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3">Add Custom Path SEO</h2>
        <form action={saveSeoMetaAction} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Route Path (e.g. /disposal/contact)</label>
            <input
              type="text"
              name="path"
              required
              placeholder="/disposal/contact"
              className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Meta Title</label>
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-2 text-xs outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Meta Description</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Description"
              className="w-full rounded-lg border border-input bg-background/50 p-3 text-xs outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add SEO Entry
          </button>
        </form>
      </div>
    </div>
  );
}
