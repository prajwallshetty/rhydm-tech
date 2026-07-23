"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  FileText,
  Film,
  Image as ImageIcon,
  Link2,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

import {
  deleteMediaWithProtectionAction,
  updateMediaAltAction,
} from "@/app/(backend)/(admin)/admin/actions";
import { MediaUploader } from "@/components/admin/media-uploader";
import { useToast } from "@/components/ui/toast";
import { MEDIA_FOLDERS, MEDIA_ROOT, type MediaFolder } from "@/lib/media/folders";

export type LibraryAsset = {
  id: string;
  url: string;
  key: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  createdAt: string;
  usageTotal: number;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_FILTERS = [
  { value: "", label: "All types" },
  { value: "IMAGE", label: "Images" },
  { value: "VIDEO", label: "Videos" },
  { value: "DOCUMENT", label: "Documents" },
] as const;

export function MediaLibrary({
  assets,
  configured,
}: {
  assets: LibraryAsset[];
  configured: boolean;
}) {
  const router = useRouter();
  const push = useToast((s) => s.push);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [folder, setFolder] = useState<MediaFolder>("products");
  const [folderFilter, setFolderFilter] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingAlt, setEditingAlt] = useState<{ id: string; alt: string } | null>(null);
  const [confirming, setConfirming] = useState<{
    id: string;
    usage: { products: number; variants: number; certifications: number; posts: number };
  } | null>(null);

  // Client-side filtering over the server-fetched window — instant, and the
  // library rarely exceeds a page-load's worth at this catalog size.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return assets.filter((asset) => {
      if (typeFilter && asset.type !== typeFilter) return false;
      if (folderFilter && !asset.key.startsWith(`${MEDIA_ROOT}/${folderFilter}/`))
        return false;
      if (
        term &&
        !asset.filename.toLowerCase().includes(term) &&
        !(asset.alt ?? "").toLowerCase().includes(term) &&
        !asset.key.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
  }, [assets, search, typeFilter, folderFilter]);

  async function handleDelete(id: string, force: boolean) {
    const res = await deleteMediaWithProtectionAction(id, force);
    if (res && "inUse" in res && res.inUse) {
      setConfirming({ id, usage: res.inUse });
      return;
    }
    setConfirming(null);
    if (res && "error" in res && res.error) {
      push(`Error: ${res.error}`);
      return;
    }
    push("Asset deleted");
    router.refresh();
  }

  async function saveAlt() {
    if (!editingAlt) return;
    await updateMediaAltAction(editingAlt.id, editingAlt.alt);
    setEditingAlt(null);
    push("Alt text saved");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {!configured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm dark:border-amber-800 dark:bg-amber-950/30">
          <p className="font-bold text-amber-800 dark:text-amber-300">
            Cloudinary is not configured
          </p>
          <p className="mt-1 text-amber-700 dark:text-amber-400">
            Uploads are disabled until{" "}
            <code className="font-mono text-xs">CLOUDINARY_CLOUD_NAME</code>,{" "}
            <code className="font-mono text-xs">CLOUDINARY_API_KEY</code> and{" "}
            <code className="font-mono text-xs">CLOUDINARY_API_SECRET</code>{" "}
            are set (see .env.example). Existing assets below stay browsable.
          </p>
        </div>
      )}

      {configured && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-border dark:bg-card">
          <div className="mb-3 flex items-center gap-3">
            <label
              htmlFor="upload-folder"
              className="text-xs font-bold text-muted-foreground"
            >
              Upload to folder
            </label>
            <select
              id="upload-folder"
              value={folder}
              onChange={(e) => setFolder(e.target.value as MediaFolder)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[#2E6F40]"
            >
              {MEDIA_FOLDERS.map((f) => (
                <option key={f} value={f}>
                  /{f}
                </option>
              ))}
            </select>
          </div>
          <MediaUploader folder={folder} onUploaded={() => router.refresh()} />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename, alt text, or path…"
            aria-label="Search media"
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-[#2E6F40]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter by type"
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-[#2E6F40]"
        >
          {TYPE_FILTERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={folderFilter}
          onChange={(e) => setFolderFilter(e.target.value)}
          aria-label="Filter by folder"
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-[#2E6F40]"
        >
          <option value="">All folders</option>
          {MEDIA_FOLDERS.map((f) => (
            <option key={f} value={f}>
              /{f}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-14 text-center dark:border-border">
          <ImageIcon className="mx-auto size-10 text-slate-300" />
          <p className="mt-3 text-sm font-bold">No media found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {assets.length === 0
              ? "Upload your first file above."
              : "Try clearing the search or filters."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((asset) => (
            <li
              key={asset.id}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-border dark:bg-card"
            >
              <div className="relative aspect-square bg-slate-50 dark:bg-muted">
                {asset.type === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-only thumbnails
                  <img
                    src={asset.url}
                    alt={asset.alt ?? ""}
                    loading="lazy"
                    className="size-full object-contain p-2"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-slate-400">
                    {asset.type === "VIDEO" ? (
                      <Film className="size-10" strokeWidth={1.2} />
                    ) : (
                      <FileText className="size-10" strokeWidth={1.2} />
                    )}
                  </div>
                )}
                {asset.usageTotal > 0 && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Link2 className="size-3" /> {asset.usageTotal}
                  </span>
                )}
              </div>

              <div className="space-y-1 p-3">
                <p className="truncate text-xs font-bold" title={asset.filename}>
                  {asset.filename}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatBytes(asset.sizeBytes)}
                  {asset.width && asset.height && ` · ${asset.width}×${asset.height}`}
                </p>

                <div className="flex items-center gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(asset.url);
                      setCopiedId(asset.id);
                      setTimeout(() => setCopiedId(null), 1500);
                    }}
                    aria-label={`Copy URL for ${asset.filename}`}
                    className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                  >
                    {copiedId === asset.id ? (
                      <Check className="size-3.5 text-[#2E6F40]" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAlt({ id: asset.id, alt: asset.alt ?? "" })
                    }
                    aria-label={`Edit alt text for ${asset.filename}`}
                    className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(asset.id, false)}
                    aria-label={`Delete ${asset.filename}`}
                    className="ml-auto grid size-8 place-items-center rounded-lg border border-border text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {editingAlt?.id === asset.id && (
                  <div className="flex gap-1.5 pt-1">
                    <input
                      value={editingAlt.alt}
                      onChange={(e) =>
                        setEditingAlt({ id: asset.id, alt: e.target.value })
                      }
                      placeholder="Alt text"
                      aria-label="Alt text"
                      className="h-8 w-full rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-[#2E6F40]"
                    />
                    <button
                      type="button"
                      onClick={() => void saveAlt()}
                      className="h-8 rounded-lg bg-[#2E6F40] px-2.5 text-xs font-bold text-white"
                    >
                      Save
                    </button>
                  </div>
                )}

                {confirming?.id === asset.id && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-[11px] dark:border-red-900 dark:bg-red-950/30">
                    <p className="font-bold text-red-700 dark:text-red-400">
                      This file is in use:
                    </p>
                    <ul className="mt-1 text-red-600 dark:text-red-400">
                      {confirming.usage.products > 0 && (
                        <li>{confirming.usage.products} product image(s)</li>
                      )}
                      {confirming.usage.variants > 0 && (
                        <li>{confirming.usage.variants} variant image(s)</li>
                      )}
                      {confirming.usage.certifications > 0 && (
                        <li>{confirming.usage.certifications} certification(s)</li>
                      )}
                      {confirming.usage.posts > 0 && (
                        <li>{confirming.usage.posts} blog post(s)</li>
                      )}
                    </ul>
                    <div className="mt-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => void handleDelete(asset.id, true)}
                        className="rounded-md bg-red-600 px-2.5 py-1.5 font-bold text-white"
                      >
                        Delete anyway
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(null)}
                        className="rounded-md border border-border px-2.5 py-1.5 font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
