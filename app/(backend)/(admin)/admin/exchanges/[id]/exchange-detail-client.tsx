"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Check, X, ShieldAlert, Clock, Sliders, Landmark, User,
  CheckSquare, Camera, Loader2, Mail, Phone, MessageCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatPriceExact } from "@/lib/format";
import { updateExchangeStatusAction } from "@/app/(backend)/(admin)/admin/actions";
import {
  EXCHANGE_STATUSES,
  EXCHANGE_TONE_CLASSES,
  exchangeStatusLabel,
  exchangeStatusTone,
} from "@/lib/data/exchange-status";
import { cn } from "@/lib/utils";

const OFFER_METHODS = ["WhatsApp", "Email", "Phone", "Other"] as const;

interface ExchangeDetailClientProps {
  exchange: any;
}

export function ExchangeDetailClient({ exchange: initialExchange }: ExchangeDetailClientProps) {
  const [exchange, setExchange] = useState(initialExchange);
  const pushToast = useToast((s) => s.push);

  // Forms state. The offer amount starts blank unless one has already been
  // recorded — never pre-filled from a computed number, because the whole
  // point is that a human decides it.
  const [offerValue, setOfferValue] = useState<string>(
    exchange.finalValueCents != null ? (exchange.finalValueCents / 100).toString() : "",
  );
  const [offerMethod, setOfferMethod] = useState<string>(exchange.offerMethod || "WhatsApp");
  const [offerNotes, setOfferNotes] = useState<string>(exchange.offerNotes || "");
  const [adminNotes, setAdminNotes] = useState<string>(exchange.notes || "");
  const [actionNotes, setActionNotes] = useState<string>("");
  const [nextStatus, setNextStatus] = useState<string>(exchange.status);

  const [submitting, setSubmitting] = useState<string | null>(null);

  const contactName = exchange.contactName || exchange.user?.name || null;
  const contactEmail = exchange.contactEmail || exchange.user?.email || null;
  const contactPhone = exchange.contactPhone || exchange.user?.phone || null;
  /** E.164-ish digits for a wa.me deep link. */
  const whatsappNumber = contactPhone?.replace(/[^\d]/g, "") || null;

  const checklistItems = Object.entries(exchange.checklist || {})
    .map(([key, value]) => ({
      key,
      label: key.replace(/([A-Z])/g, " $1").trim(),
      checked: !!value,
    }));

  const applyUpdate = (
    updated: any,
    newStatus: string,
    action: string,
    details: string,
  ) => {
    setExchange((prev: any) => ({
      ...prev,
      status: updated.status,
      finalValueCents: updated.finalValueCents,
      offerMethod: updated.offerMethod,
      offerNotes: updated.offerNotes,
      offerSentAt: updated.offerSentAt,
      customerContactedAt: updated.customerContactedAt,
      notes: updated.notes,
      activities: [
        {
          id: `local-${Date.now()}`,
          createdAt: new Date().toISOString(),
          action,
          toStatus: newStatus,
          details,
        },
        ...prev.activities,
      ],
    }));
    setNextStatus(updated.status);
  };

  /** Records the admin's hand-set offer and marks it as sent to the customer. */
  const handleRecordOffer = async () => {
    const euros = Number.parseFloat(offerValue);
    if (!Number.isFinite(euros) || euros < 0) {
      pushToast("Enter a valid offer amount.", "warning");
      return;
    }

    setSubmitting("offer");
    try {
      const finalValueCents = Math.round(euros * 100);
      const details = `Offer of €${euros.toFixed(2)} recorded, sent via ${offerMethod}.`;
      const updated = await updateExchangeStatusAction(exchange.id, "OFFER_SENT", {
        finalValueCents,
        offerMethod,
        offerNotes: offerNotes || undefined,
        notes: adminNotes || undefined,
        markOfferSent: true,
      });
      applyUpdate(updated, "OFFER_SENT", "OFFER_SENT", details);
      pushToast("Offer recorded and the customer has been notified.", "check");
    } catch {
      pushToast("Could not record the offer. Please try again.", "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleStatusChange = async (newStatus: string, actionKey: string) => {
    setSubmitting(actionKey);
    try {
      const details = actionNotes || `Status updated to ${exchangeStatusLabel(newStatus)}.`;
      const updated = await updateExchangeStatusAction(exchange.id, newStatus, {
        details,
        notes: adminNotes || undefined,
      });
      applyUpdate(updated, newStatus, "STATUS_UPDATED", details);
      pushToast(`Status updated to ${exchangeStatusLabel(newStatus)}.`, "check");
      setActionNotes("");
    } catch {
      pushToast("Failed to update status. Please try again.", "error");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/admin/exchanges" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Exchange List</span>
          </Link>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl flex items-center gap-2">
              <Landmark className="h-8 w-8 text-primary" />
              <span>Review Exchange Request</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Reference: <span className="font-mono font-bold text-slate-900">{exchange.referenceNumber}</span> · Submitted {new Date(exchange.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-black uppercase tracking-wider",
              EXCHANGE_TONE_CLASSES[exchangeStatusTone(exchange.status)],
            )}>
              {exchangeStatusLabel(exchange.status)}
            </span>
            {exchange.finalValueCents != null && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-700">
                Offer {formatPriceExact(exchange.finalValueCents)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Details (Client, Device Specs, Images) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Client & Connection details */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span>Customer Details</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 text-xs font-medium md:grid-cols-2">
              <div>
                <span className="text-slate-400">Name:</span>{" "}
                <span className="font-bold text-slate-900">{contactName || "Not provided"}</span>
                {!exchange.userId && (
                  <span className="ml-1.5 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                    Guest
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-slate-400">Email:</span>{" "}
                {contactEmail ? (
                  <a href={`mailto:${contactEmail}`} className="font-bold text-primary underline-offset-2 hover:underline break-all">
                    {contactEmail}
                  </a>
                ) : (
                  <span className="font-bold text-slate-900">Not provided</span>
                )}
              </div>
              <div>
                <span className="text-slate-400">Phone:</span>{" "}
                {contactPhone ? (
                  <a href={`tel:${contactPhone}`} className="font-bold text-primary underline-offset-2 hover:underline">
                    {contactPhone}
                  </a>
                ) : (
                  <span className="font-bold text-slate-900">Not provided</span>
                )}
              </div>
              <div>
                <span className="text-slate-400">Collection:</span>{" "}
                <span className="font-bold text-slate-900">{exchange.pickupOption || "Not specified"}</span>
              </div>
              {exchange.pickupSchedule?.address && (
                <div className="md:col-span-2">
                  <span className="text-slate-400">Address:</span>{" "}
                  <span className="font-bold text-slate-900">{exchange.pickupSchedule.address}</span>
                </div>
              )}

              {/* One-tap contact — the admin reaches out personally, then
                  records the offer they made. */}
              <div className="flex flex-wrap gap-2 md:col-span-2">
                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Your Rhydm trade-in ${exchange.referenceNumber}`)}`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email</span>
                  </a>
                )}
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {contactPhone && (
                  <a
                    href={`tel:${contactPhone}`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call</span>
                  </a>
                )}
              </div>

              {exchange.product && (
                <div className="col-span-full flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div className="min-w-0">
                    <span className="text-slate-400">Interested in:</span>{" "}
                    <span className="font-bold text-slate-900">{exchange.product.name}</span>
                  </div>
                  <span className="shrink-0 font-extrabold text-slate-800">
                    {formatPriceExact(exchange.product.priceCents)}
                  </span>
                </div>
              )}

              {/* Historical only: requests created before manual pricing. */}
              {exchange.estimatedValueCents > 0 && (
                <div className="col-span-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
                  Legacy auto-estimate on this record:{" "}
                  <span className="font-bold">{formatPriceExact(exchange.estimatedValueCents)}</span>{" "}
                  — reference only, never shown to the customer.
                </div>
              )}
            </div>
          </div>

          {/* Specs Details */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-slate-500" />
              <span>Device Specifications</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-slate-400 uppercase tracking-wider font-bold">Category</p>
                <p className="text-slate-800 font-extrabold mt-0.5">{exchange.deviceType}</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wider font-bold">Brand</p>
                <p className="text-slate-800 font-extrabold mt-0.5">{exchange.brand}</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wider font-bold">Model</p>
                <p className="text-slate-800 font-extrabold mt-0.5">
                  {exchange.model} {exchange.customModel && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">Custom</span>}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wider font-bold">Condition</p>
                <p className="text-slate-800 font-extrabold mt-0.5">{exchange.condition}</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wider font-bold">Purchase Year</p>
                <p className="text-slate-800 font-extrabold mt-0.5">{exchange.purchaseYear || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wider font-bold">Serial Number</p>
                <p className="text-slate-800 font-mono font-bold mt-0.5">{exchange.serialNumber || "—"}</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4" />
                <span>Components Inspection Checklist</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {checklistItems.map((chk) => (
                  <div key={chk.key} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <div className={cn(
                      "size-4 rounded-md flex items-center justify-center border",
                      chk.checked ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-red-50 text-red-700 border-red-200"
                    )}>
                      {chk.checked ? <Check className="h-3 w-3 stroke-[3]" /> : <X className="h-3 w-3" />}
                    </div>
                    <span>{chk.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {exchange.description && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Customer Description</p>
                <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200/60 rounded-xl p-3 leading-relaxed font-semibold">
                  {exchange.description}
                </p>
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Camera className="h-5 w-5 text-sky-500" />
              <span>Uploaded Photos ({exchange.images.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {exchange.images.map((url: string, index: number) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:opacity-90 transition-opacity"
                >
                  <img src={url} alt="Device view" className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Status transition forms & Audit trail */}
        <div className="space-y-6">
          
          {/* Action panels card */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              <span>Admin Decision Center</span>
            </h2>

            {/* Manual offer — the amount is always decided here, by a person. */}
            <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Offer to customer
                </span>
                {exchange.offerSentAt && (
                  <span className="text-[10px] font-bold text-emerald-700">
                    Sent {new Date(exchange.offerSentAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="offer-amount" className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Amount (EUR)
                </label>
                <input
                  id="offer-amount"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={5}
                  value={offerValue}
                  onChange={(e) => setOfferValue(e.target.value)}
                  placeholder="e.g. 320"
                  className="min-h-10 w-full rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-sm font-bold outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="offer-method" className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Sent via
                </label>
                <select
                  id="offer-method"
                  value={offerMethod}
                  onChange={(e) => setOfferMethod(e.target.value)}
                  className="min-h-10 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#16A34A]"
                >
                  {OFFER_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="offer-notes" className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Offer notes
                </label>
                <textarea
                  id="offer-notes"
                  rows={2}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  placeholder="How the figure was reached, conditions, validity…"
                  className="w-full resize-none rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#16A34A]"
                />
              </div>

              <button
                type="button"
                disabled={submitting !== null || !offerValue}
                onClick={handleRecordOffer}
                className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#16A34A] py-2.5 text-xs font-bold text-white shadow-md shadow-[#16A34A]/10 transition-colors hover:bg-[#159342] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting === "offer" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{exchange.offerSentAt ? "Update offer" : "Record offer as sent"}</span>
              </button>
              <p className="text-[10px] font-medium leading-relaxed text-slate-500">
                Contact the customer yourself using the links above, then record what you
                offered here. The customer sees the amount only once it is recorded.
              </p>
            </div>

            {/* Status transition */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="space-y-1.5">
                <label htmlFor="next-status" className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Move to status
                </label>
                <select
                  id="next-status"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#2E6F40]"
                >
                  {EXCHANGE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="action-notes" className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Reason / details
                </label>
                <textarea
                  id="action-notes"
                  rows={2}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Recorded on the audit trail and emailed to the customer."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#2E6F40]"
                />
              </div>

              <button
                type="button"
                disabled={submitting !== null || nextStatus === exchange.status}
                onClick={() => handleStatusChange(nextStatus, "status")}
                className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting === "status" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Update status</span>
              </button>
            </div>

            {/* Internal notes — explicitly never shown to the customer. */}
            <div className="space-y-1.5 border-t border-slate-100 pt-4">
              <label htmlFor="admin-notes" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Internal notes (never shown to the customer)</span>
              </label>
              <textarea
                id="admin-notes"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Assigned technician, internal valuation reasoning, risk flags…"
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#2E6F40]"
              />
              <p className="text-[10px] text-slate-400">Saved with the next offer or status update.</p>
            </div>
          </div>

          {/* Activity Timeline Audit Log */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" />
              <span>Audit Trail Timeline</span>
            </h2>

            <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-4 text-xs">
              {exchange.activities.map((act: any) => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-[21px] top-1 bg-white border border-primary size-2.5 rounded-full" />
                  <div className="flex flex-col gap-0.5 font-medium">
                    <div className="font-extrabold text-slate-800 flex flex-wrap items-center gap-1.5">
                      <span>{act.action.replace("_", " ")}</span>
                      {act.toStatus && (
                        <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider">
                          → {act.toStatus.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 text-[10px]">{new Date(act.createdAt).toLocaleString()}</div>
                    <div className="text-slate-600 mt-1 leading-relaxed">{act.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
