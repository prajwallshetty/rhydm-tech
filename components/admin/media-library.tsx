"use client";

import { useState } from "react";
import { Plus, Search, Copy, Check, Trash2, Image as ImageIcon } from "lucide-react";
import { createMediaAssetAction, deleteMediaAssetAction } from "@/app/(backend)/(admin)/admin/actions";

export function MediaLibrary({
  mediaData,
}: {
  mediaData: {
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search media assets..."
            className="w-full rounded-lg border border-input bg-background/50 pl-9 pr-4 py-2 text-xs outline-none focus:border-primary"
          />
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Upload / Add Media</span>
        </button>
      </div>

      {/* Add Media Panel */}
      {showAddModal && (
        <form
          action={async (formData) => {
            await createMediaAssetAction(formData);
            setShowAddModal(false);
          }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-sm space-y-4 max-w-xl"
        >
          <h3 className="text-sm font-bold text-foreground">Add New Media Asset</h3>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Image URL *</label>
            <input
              type="url"
              name="url"
              required
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2 text-xs font-mono outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="filename"
              placeholder="Filename (e.g. laptop-banner.jpg)"
              className="rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
            />
            <input
              type="text"
              name="alt"
              placeholder="Alt text description"
              className="rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground cursor-pointer"
            >
              Save Asset
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Grid View */}
      {mediaData.items.length === 0 ? (
        <div className="rounded-xl border border-border/80 bg-card py-16 text-center text-muted-foreground text-sm space-y-2">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p>No media assets in library yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {mediaData.items.map((asset) => (
            <div
              key={asset.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
            >
              {/* Image Preview */}
              <div className="relative aspect-square w-full bg-muted">
                <img src={asset.url} alt={asset.filename} className="h-full w-full object-cover" />
              </div>

              {/* Asset Info & Action Overlay */}
              <div className="p-3 space-y-1">
                <div className="truncate text-xs font-semibold text-foreground">{asset.filename}</div>
                <div className="text-[10px] text-muted-foreground truncate">{asset.mimeType}</div>

                <div className="flex items-center justify-between border-t border-border/40 pt-2 mt-2">
                  <button
                    onClick={() => copyToClipboard(asset.url, asset.id)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy URL
                      </>
                    )}
                  </button>

                  <form action={deleteMediaAssetAction.bind(null, asset.id)}>
                    <button type="submit" className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
