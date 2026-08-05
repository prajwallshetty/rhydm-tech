import { useTranslations } from "next-intl";
import { Check, Download, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatPriceExact } from "@/lib/format";

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
  const t = useTranslations("store.orderSuccess");
  const params = await searchParams;

  const orderNumber = params.orderNumber || "N/A";
  const totalCents = params.totalCents ? parseInt(params.totalCents, 10) : 0;
  const transactionId = params.transactionId || "N/A";
  const token = params.token || "";

  const invoiceUrl = `/api/orders/${orderNumber}/invoice?token=${token}`;

  return (
    <div className="mx-auto max-w-2xl px-6 pt-36 pb-24 text-center">
      {/* Pop-in Checkmark Badge */}
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-100 shadow-sm mb-6">
        <Check className="size-8" strokeWidth={3} />
      </div>

      {/* Main Headers */}
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {t("paymentSuccessful")}
      </h1>
      <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
        {t("subtitle")}
      </p>

      {/* Order Info Card */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left max-w-md mx-auto space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">{t("orderNumber")}</span>
          <span className="font-mono font-bold text-slate-950 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            {orderNumber}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">{t("transactionId")}</span>
          <span className="font-mono font-medium text-slate-700 max-w-[180px] truncate text-right" title={transactionId}>
            {transactionId}
          </span>
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-sm">
          <span className="text-slate-950 font-semibold">{t("totalPaid")}</span>
          <span className="text-lg font-black text-[#2E6F40]">
            {formatPriceExact(totalCents)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row max-w-md mx-auto">
        <a
          href={invoiceUrl}
          download
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E6F40] text-white px-6 py-3.5 text-sm font-bold shadow-md shadow-[#2E6F40]/10 hover:bg-[#255833] transition-all"
        >
          <Download className="size-4" />
          {t("downloadInvoice")}
        </a>
        <Link
          href="/refurbished/shop"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 px-6 py-3.5 text-sm font-bold hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <ShoppingBag className="size-4" />
          {t("continueShopping")}
        </Link>
      </div>
    </div>
  );
}
