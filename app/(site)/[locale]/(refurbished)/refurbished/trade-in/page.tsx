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
    title: "Apple & Back Market Style Trade-In Program | Rhydm Tech",
    description: "Get instant credit for your used laptops, desktops, and servers. Trade-in is fast, secure, and includes free courier pickup services.",
    path: "/refurbished/trade-in",
    absoluteTitle: true,
  });
}

export default function TradeInLandingPage() {
  return <ExchangeLandingClient pageType="trade-in" />;
}
