import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ExchangeDetailClient } from "./exchange-detail-client";

export const dynamic = "force-dynamic";

export default async function AdminExchangeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const exchange = await db.exchangeRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      product: {
        select: {
          name: true,
          slug: true,
          priceCents: true,
        },
      },
    },
  });

  if (!exchange) {
    notFound();
  }

  // Serialize dates for client components safety
  const serializedExchange = {
    ...exchange,
    createdAt: exchange.createdAt.toISOString(),
    updatedAt: exchange.updatedAt.toISOString(),
    offerSentAt: exchange.offerSentAt?.toISOString() ?? null,
    customerContactedAt: exchange.customerContactedAt?.toISOString() ?? null,
    activities: exchange.activities.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  };

  return <ExchangeDetailClient exchange={serializedExchange} />;
}
