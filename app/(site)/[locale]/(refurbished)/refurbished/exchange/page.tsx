import { ExchangeLandingClient } from "@/components/store/exchange-landing-client";

export async function generateMetadata() {
  return {
    title: "Refurbished Tech Exchange & Hardware Swaps | Rhydm Tech",
    description: "Exchange your old laptops or desktops for a premium refurbished upgrade. Subscriptions and instant discounts are applied on checkout.",
  };
}

export default function ExchangeLandingPage() {
  return <ExchangeLandingClient pageType="exchange" />;
}
