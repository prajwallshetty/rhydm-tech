"use client";

import { useCallback, useRef, useState } from "react";
import { CloudUpload, FileWarning, Loader2, RotateCcw } from "lucide-react";

import {
  recordMediaUploadAction,
  signMediaUploadAction,
} from "@/app/(backend)/(admin)/admin/actions";
import { MEDIA_FOLDERS, type MediaFolder } from "@/lib/media/folders";
import { cn } from "@/lib/utils";

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif,image/svg+xml,video/mp4,video/quicktime,video/webm,application/pdf,.docx";
const MAX_BYTES = 50 * 1024 * 1024;

type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

export type UploadedAsset = {
  id: string;
  url: string;
  key: string;
  alt: string | null;
  filename: string;
};

/**
 * Drag-and-drop / click uploader. Files go browser → Cloudinary directly
 * using a server-signed request (secret stays server-side, bytes never
 * transit our server), then the result is persisted via a server action.
 */
export function MediaUploader({
  folder,
  onUploaded,
  compact = false,
}: {
  folder: MediaFolder;
  onUploaded?: (asset: UploadedAsset) => void;
  compact?: boolean;
}) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const patch = useCallback((id: string, next: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...next } : it)));
  }, []);

  const uploadOne = useCallback(
    async (item: UploadItem) => {
      patch(item.id, { status: "uploading", progress: 0, error: undefined });

      const signed = await signMediaUploadAction(folder);
      if ("error" in signed && signed.error) {
        patch(item.id, { status: "error", error: signed.error });
        return;
      }
      const upload = signed.upload!;

      const isVideo = item.file.type.startsWith("video/");
      const isImage = item.file.type.startsWith("image/");
      const resource = isVideo ? "video" : isImage ? "image" : "raw";

      const form = new FormData();
      form.append("file", item.file);
      form.append("api_key", upload.apiKey);
      form.append("timestamp", String(upload.timestamp));
      form.append("folder", upload.folder);
      form.append("signature", upload.signature);

      // XHR rather than fetch: upload progress events.
      const response = await new Promise<Record<string, unknown> | null>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${upload.cloudName}/${resource}/upload`,
        );
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            patch(item.id, { progress: Math.round((e.loaded / e.total) * 100) });
          }
        };
        xhr.onload = () => {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve(null);
          }
        };
        xhr.onerror = () => resolve(null);
        xhr.send(form);
      });

      if (!response || !response.public_id) {
        const msg =
          (response as { error?: { message?: string } })?.error?.message ??
          "Upload failed — check your connection and retry.";
        patch(item.id, { status: "error", error: msg });
        return;
      }

      const recorded = await recordMediaUploadAction({
        publicId: String(response.public_id),
        secureUrl: String(response.secure_url),
        resourceType: String(response.resource_type),
        format: String(response.format ?? ""),
        bytes: Number(response.bytes ?? 0),
        width: typeof response.width === "number" ? response.width : undefined,
        height: typeof response.height === "number" ? response.height : undefined,
        originalFilename: item.file.name,
      });

      if (recorded?.error || !recorded?.asset) {
        patch(item.id, { status: "error", error: recorded?.error ?? "Failed to save." });
        return;
      }

      patch(item.id, { status: "done", progress: 100 });
      onUploaded?.(recorded.asset);
    },
    [folder, onUploaded, patch],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        if (file.size > MAX_BYTES) {
          setItems((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              file,
              progress: 0,
              status: "error",
              error: "File exceeds the 50MB limit.",
            },
          ]);
          continue;
        }
        const item: UploadItem = {
          id: crypto.randomUUID(),
          file,
          progress: 0,
          status: "uploading",
        };
        setItems((prev) => [...prev, item]);
        void uploadOne(item);
      }
    },
    [uploadOne],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed text-center transition-colors",
          compact ? "p-5" : "p-10",
          dragOver
            ? "border-[#2E6F40] bg-[#2E6F40]/5"
            : "border-slate-300 hover:border-[#2E6F40]/50 dark:border-border",
        )}
      >
        <CloudUpload
          className={cn("text-slate-400", compact ? "size-6" : "size-9")}
          strokeWidth={1.5}
        />
        <p className="mt-2 text-sm font-bold text-foreground">
          Drop files here or click to upload
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Images, video (MP4/MOV/WEBM), PDF, DOCX · to /{folder} · max 50MB
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-border dark:bg-card"
            >
              {item.status === "uploading" && (
                <Loader2 className="size-4 shrink-0 animate-spin text-[#2E6F40]" />
              )}
              {item.status === "error" && (
                <FileWarning className="size-4 shrink-0 text-red-500" />
              )}
              {item.status === "done" && (
                <span className="size-2.5 shrink-0 rounded-full bg-[#2E6F40]" />
              )}

              <span className="min-w-0 flex-1 truncate font-medium">
                {item.file.name}
              </span>

              {item.status === "uploading" && (
                <span className="w-32 shrink-0">
                  <span className="block h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-muted">
                    <span
                      className="block h-full rounded-full bg-[#2E6F40] transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </span>
                </span>
              )}

              {item.status === "error" && (
                <>
                  <span className="max-w-48 truncate text-xs text-red-500">
                    {item.error}
                  </span>
                  <button
                    type="button"
                    onClick={() => void uploadOne(item)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold hover:bg-muted"
                  >
                    <RotateCcw className="size-3" /> Retry
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { MEDIA_FOLDERS };
