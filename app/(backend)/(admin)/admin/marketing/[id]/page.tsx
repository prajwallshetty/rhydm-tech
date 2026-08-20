import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { hasPermission } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { listProductsForCampaign } from "@/app/(backend)/(admin)/admin/marketing/actions";

import { CampaignEditor } from "../campaign-editor";
import { CampaignReport } from "../campaign-report";

export const metadata = { title: "Campaign" };

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!hasPermission(admin.role, "SYSTEM_SETTINGS")) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-6 text-sm font-medium text-amber-900">
        You do not have permission to view campaigns.
      </div>
    );
  }

  const campaign = await db.emailCampaign.findUnique({ where: { id } });
  if (!campaign) notFound();

  // Once a campaign has left DRAFT its content is frozen — editing what was
  // already delivered would make the record disagree with the inboxes.
  if (campaign.status !== "DRAFT") {
    return <CampaignReport campaignId={campaign.id} />;
  }

  const products = await listProductsForCampaign();

  return (
    <CampaignEditor
      products={products}
      campaignId={campaign.id}
      adminEmail={admin.email}
      initial={{
        name: campaign.name,
        subject: campaign.subject,
        previewText: campaign.previewText ?? "",
        bodyHtml: campaign.bodyHtml,
        bodyText: campaign.bodyText ?? "",
        audience: campaign.audience,
        customEmails: campaign.customEmails ?? "",
        productIds: campaign.productIds,
      }}
    />
  );
}
