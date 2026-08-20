import { requireAdmin } from "@/lib/auth/admin";
import { hasPermission } from "@/lib/auth/rbac";
import { listProductsForCampaign } from "@/app/(backend)/(admin)/admin/marketing/actions";

import { CampaignEditor } from "../campaign-editor";

export const metadata = { title: "New campaign" };

export default async function NewCampaignPage() {
  const admin = await requireAdmin();
  if (!hasPermission(admin.role, "SYSTEM_SETTINGS")) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-6 text-sm font-medium text-amber-900">
        You do not have permission to create campaigns.
      </div>
    );
  }

  const products = await listProductsForCampaign();

  return (
    <CampaignEditor
      products={products}
      adminEmail={admin.email}
      initial={{
        name: "",
        subject: "",
        previewText: "",
        bodyHtml: "",
        bodyText: "",
        audience: "ALL_OPTED_IN",
        customEmails: "",
        productIds: [],
      }}
    />
  );
}
