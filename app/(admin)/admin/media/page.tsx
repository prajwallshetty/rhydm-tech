import { getAdminMediaAssets } from "@/lib/repositories/admin";
import { MediaLibrary } from "@/components/admin/media-library";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const mediaData = await getAdminMediaAssets({
    search: params.search,
    page,
    limit: 12,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Media Library</h1>
        <p className="text-sm text-muted-foreground">Upload, organize, and copy image links for products and CMS pages.</p>
      </div>

      <MediaLibrary mediaData={mediaData} />
    </div>
  );
}
