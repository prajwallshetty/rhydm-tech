import { getAnalyticsOverview } from "@/lib/repositories/admin";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";

export default async function AdminAnalyticsPage() {
  const analyticsData = await getAnalyticsOverview(6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Live revenue, orders, sales and storefront activity over the last 6 months.
        </p>
      </div>

      <AnalyticsCharts data={analyticsData} />
    </div>
  );
}
