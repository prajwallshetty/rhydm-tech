import { MediaLibrary, type LibraryAsset } from "@/components/admin/media-library";
import { isCloudinaryConfigured } from "@/lib/media/cloudinary";
import { getMediaLibrary } from "@/lib/repositories/admin";

export default async function AdminMediaPage() {
  const rows = await getMediaLibrary();

  const assets: LibraryAsset[] = rows.map((row) => ({
    id: row.id,
    url: row.url,
    key: row.key,
    type: row.type,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    width: row.width,
    height: row.height,
    alt: row.alt,
    createdAt: row.createdAt.toISOString(),
    usageTotal:
      row._count.productImages +
      row._count.variantImages +
      row._count.certifications +
      row._count.posts,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Media Library
        </h1>
        <p className="text-sm text-muted-foreground">
          Central Cloudinary-backed storage. Uploads land in organised folders;
          deleting checks where a file is used first.
        </p>
      </div>

      <MediaLibrary assets={assets} configured={isCloudinaryConfigured()} />
    </div>
  );
}
