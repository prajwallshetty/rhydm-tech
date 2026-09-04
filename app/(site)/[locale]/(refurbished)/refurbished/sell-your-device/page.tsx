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
    title: "Sell Your Used Laptops & IT Hardware Online | Rhydm Tech",
    description: "Get immediate value for your surplus business or personal computing devices. Insured shipments, fast processing, and data wiped clean.",
    path: "/refurbished/sell-your-device",
    absoluteTitle: true,
  });
}

export default function SellYourDeviceLandingPage() {
  return <ExchangeLandingClient pageType="sell-your-device" />;
}
