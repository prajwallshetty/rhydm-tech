import { ExchangeLandingClient } from "@/components/store/exchange-landing-client";

export async function generateMetadata() {
  return {
    title: "Apple & Back Market Style Trade-In Program | Rhydm Tech",
    description: "Get instant credit for your used laptops, desktops, and servers. Trade-in is fast, secure, and includes free courier pickup services.",
  };
}

export default function TradeInLandingPage() {
  return <ExchangeLandingClient pageType="trade-in" />;
}
