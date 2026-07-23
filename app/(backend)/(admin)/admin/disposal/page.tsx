import { getDisposalCmsData } from "@/lib/repositories/admin";
import { DisposalCmsManager } from "@/components/admin/disposal-cms";

export default async function AdminDisposalCmsPage() {
  const cmsData = await getDisposalCmsData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Disposal CMS</h1>
        <p className="text-sm text-muted-foreground">Manage enterprise IT asset disposal website content.</p>
      </div>

      <DisposalCmsManager cmsData={cmsData} />
    </div>
  );
}
