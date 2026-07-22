import { getAdminDeals, getDealCandidates } from "@/lib/repositories/admin";
import { DealsTable } from "@/components/admin/deals-table";

export default async function AdminDealsPage() {
  const [deals, candidates] = await Promise.all([
    getAdminDeals(),
    getDealCandidates(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Deals
        </h1>
        <p className="text-sm text-muted-foreground">
          A deal is a product with a compare-at price above its sale price —
          changes here appear on the storefront immediately.
        </p>
      </div>

      <DealsTable deals={deals} candidates={candidates} />
    </div>
  );
}
