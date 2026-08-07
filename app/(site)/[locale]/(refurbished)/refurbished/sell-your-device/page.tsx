import { ExchangeLandingClient } from "@/components/store/exchange-landing-client";

export async function generateMetadata() {
  return {
    title: "Sell Your Used Laptops & IT Hardware Online | Rhydm Tech",
    description: "Get immediate value for your surplus business or personal computing devices. Insured shipments, fast processing, and data wiped clean.",
  };
}

export default function SellYourDeviceLandingPage() {
  return <ExchangeLandingClient pageType="sell-your-device" />;
}
