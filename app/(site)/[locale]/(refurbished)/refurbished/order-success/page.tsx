import OrderSuccessClient from "./order-success-client";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    orderNumber?: string;
    totalCents?: string;
    transactionId?: string;
    token?: string;
  }>;
}) {
  const params = await searchParams;

  const orderNumber = params.orderNumber || "N/A";
  const totalCents = params.totalCents ? parseInt(params.totalCents, 10) : 0;
  const transactionId = params.transactionId || "N/A";
  const token = params.token || "";

  return (
    <OrderSuccessClient
      orderNumber={orderNumber}
      totalCents={totalCents}
      transactionId={transactionId}
      token={token}
    />
  );
}

