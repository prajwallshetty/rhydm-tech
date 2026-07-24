import { getAdminCoupons, getAdminCategories } from "@/lib/repositories/admin";
import { CouponsManager } from "@/components/admin/coupons-manager";

export default async function AdminCouponsPage() {
  const [coupons, categories] = await Promise.all([
    getAdminCoupons(),
    getAdminCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Coupons
        </h1>
        <p className="text-sm text-muted-foreground">
          Percentage or fixed discounts with minimum spend, expiry, usage caps
          and product / category scoping.
        </p>
      </div>

      <CouponsManager
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        coupons={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          type: c.type,
          value: c.value,
          minSpendCents: c.minSpendCents,
          active: c.active,
          expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
          usageLimit: c.usageLimit,
          usageCount: c.usageCount,
          oncePerCustomer: c.oncePerCustomer,
          categoryIds: c.categoryIds,
          productIds: c.productIds,
        }))}
      />
    </div>
  );
}
