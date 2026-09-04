import { ExchangeLandingClient } from "@/components/store/exchange-landing-client";
import { createPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    title: "Refurbished Tech Exchange & Hardware Swaps | Rhydm Tech",
    description: "Exchange your old laptops or desktops for a premium refurbished upgrade. Subscriptions and instant discounts are applied on checkout.",
    path: "/refurbished/exchange",
    absoluteTitle: true,
  });
}

export default function ExchangeLandingPage() {
  return <ExchangeLandingClient pageType="exchange" />;
}
