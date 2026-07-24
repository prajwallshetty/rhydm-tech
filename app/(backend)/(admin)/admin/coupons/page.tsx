import { getAdminCoupons } from "@/lib/repositories/admin";
import { CouponsManager } from "@/components/admin/coupons-manager";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Coupons
        </h1>
        <p className="text-sm text-muted-foreground">
          Create percentage or fixed discounts with minimum spend and expiry rules.
        </p>
      </div>

      <CouponsManager
        coupons={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          type: c.type,
          value: c.value,
          minSpendCents: c.minSpendCents,
          active: c.active,
          expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
        }))}
      />
    </div>
  );
}
