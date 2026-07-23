"use client";

import { useEffect, useState } from "react";
import { Check, ImagePlus, Loader2, Search, X } from "lucide-react";

import { listMediaForPickerAction } from "@/app/(backend)/(admin)/admin/actions";
import { MediaUploader, type UploadedAsset } from "@/components/admin/media-uploader";
import type { MediaFolder } from "@/lib/media/folders";
import { cn } from "@/lib/utils";

export type PickedAsset = { id: string; url: string; alt: string | null; filename: string };

type PickerAsset = PickedAsset & { key: string };

/**
 * The one media picker every image field uses: browse the library, search,
 * or upload new (which lands in the library and is auto-selected). Renders a
 * trigger button; the dialog mounts only while open.
 */
export function MediaPicker({
  folder,
  onSelect,
  triggerLabel = "Choose image",
  className,
}: {
  /** Where "Upload new" files land. */
  folder: MediaFolder;
  onSelect: (asset: PickedAsset) => void;
  triggerLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-[#2E6F40]/50 hover:text-[#2E6F40]",
          className,
        )}
      >
        <ImagePlus className="size-3.5" />
        {triggerLabel}
      </button>

      {open && (
        <PickerDialog
          folder={folder}
          onClose={() => setOpen(false)}
          onSelect={(asset) => {
            onSelect(asset);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function PickerDialog({
  folder,
  onClose,
  onSelect,
}: {
  folder: MediaFolder;
  onClose: () => void;
  onSelect: (asset: PickedAsset) => void;
}) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [assets, setAssets] = useState<PickerAsset[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    listMediaForPickerAction().then((res) => {
      if (!cancelled) setAssets(res.assets ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const term = search.trim().toLowerCase();
  const filtered = (assets ?? []).filter(
    (a) =>
      !term ||
      a.filename.toLowerCase().includes(term) ||
      (a.alt ?? "").toLowerCase().includes(term) ||
      a.key.toLowerCase().includes(term),
  );

  function handleUploaded(asset: UploadedAsset) {
    // New uploads are auto-selected — the Shopify behaviour.
    onSelect(asset);
  }

  return (
    <div className="fixed inset-0 z-100 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Media picker"
        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex gap-1 rounded-xl border border-border p-1">
            {(["library", "upload"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-xs font-bold capitalize transition-colors",
                  tab === t
                    ? "bg-[#2E6F40] text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "library" ? "Media library" : "Upload new"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media picker"
            className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "upload" ? (
            <MediaUploader folder={folder} onUploaded={handleUploaded} compact />
          ) : (
            <>
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search images…"
                  aria-label="Search images"
                  className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-[#2E6F40]"
                />
              </div>

              {assets === null ? (
                <div className="grid place-items-center py-16">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  {assets.length === 0
                    ? "No images yet — use the Upload new tab."
                    : "No matches."}
                </p>
              ) : (
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {filtered.map((asset) => (
                    <li key={asset.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(asset)}
                        className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-border bg-slate-50 transition-colors hover:border-[#2E6F40] dark:bg-muted"
                        aria-label={`Select ${asset.filename}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails */}
                        <img
                          src={asset.url}
                          alt={asset.alt ?? ""}
                          loading="lazy"
                          className="size-full object-contain p-1.5"
                        />
                        <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {asset.filename}
                        </span>
                        <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-[#2E6F40] opacity-0 transition-opacity group-hover:opacity-100">
                          <Check className="size-3 text-white" strokeWidth={3} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
