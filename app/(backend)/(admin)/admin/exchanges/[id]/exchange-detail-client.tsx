"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Check, X, ShieldAlert, AlertCircle, Sparkles, Clock,
  FileText, Sliders, MapPin, ClipboardList, Info, Landmark, User,
  Calendar, CreditCard, ChevronRight, PenTool, CheckSquare, Camera, Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatPriceExact } from "@/lib/format";
import { updateExchangeStatusAction } from "@/app/(backend)/(admin)/admin/actions";
import { cn } from "@/lib/utils";

interface ExchangeDetailClientProps {
  exchange: any;
}

export function ExchangeDetailClient({ exchange: initialExchange }: ExchangeDetailClientProps) {
  const [exchange, setExchange] = useState(initialExchange);
  const pushToast = useToast((s) => s.push);

  // Forms state
  const [counterValue, setCounterValue] = useState<string>(
    exchange.finalValueCents ? (exchange.finalValueCents / 100).toString() : (exchange.estimatedValueCents / 100).toString()
  );
  const [adminNotes, setAdminNotes] = useState<string>(exchange.notes || "");
  const [actionNotes, setActionNotes] = useState<string>("");
  const [technicianName, setTechnicianName] = useState<string>(exchange.notes?.match(/Technician: (.*)/)?.[1] || "");

  const [submitting, setSubmitting] = useState<string | null>(null);

  const checklistItems = Object.entries(exchange.checklist || {})
    .map(([key, value]) => ({
      key,
      label: key.replace(/([A-Z])/g, " $1").trim(),
      checked: !!value,
    }));

  const handleAction = async (newStatus: string, actionKey: string) => {
    setSubmitting(actionKey);
    try {
      let finalValueCents = undefined;
      let notes = adminNotes;

      if (actionKey === "counter") {
        finalValueCents = Math.round(parseFloat(counterValue) * 100);
      } else if (actionKey === "approve") {
        finalValueCents = exchange.estimatedValueCents;
      }

      if (technicianName) {
        notes = `${adminNotes}\nTechnician: ${technicianName}`.trim();
      }

      const updated = await updateExchangeStatusAction(exchange.id, newStatus, {
        details: actionNotes || `Status updated to ${newStatus} by Administrator.`,
        finalValueCents,
        notes,
      });

      // Update local state
      setExchange({
        ...exchange,
        status: updated.status,
        finalValueCents: updated.finalValueCents,
        notes: updated.notes,
        activities: [
          {
            id: Math.random().toString(),
            createdAt: new Date().toISOString(),
            action: actionKey.toUpperCase(),
            toStatus: newStatus,
            details: actionNotes || `Status updated to ${newStatus} by Administrator.`,
          },
          ...exchange.activities,
        ],
      });

      pushToast(`Exchange request status updated successfully to ${newStatus}!`);
      setActionNotes("");
    } catch (err: any) {
      console.error(err);
      pushToast("Failed to update status. Please try again.");
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

          <div className="flex items-center gap-3">
            <span className={cn(
              "rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider border",
              exchange.status === "PENDING" && "bg-slate-50 text-slate-600 border-slate-200",
              exchange.status === "COUNTER_OFFER" && "bg-amber-50 text-amber-700 border-amber-250 animate-pulse",
              exchange.status === "APPROVED" && "bg-emerald-50 text-emerald-700 border-emerald-250",
              exchange.status === "REJECTED" && "bg-red-50 text-red-700 border-red-200",
              exchange.status === "PICKUP_SCHEDULED" && "bg-blue-50 text-blue-700 border-blue-200",
              exchange.status === "RECEIVED" && "bg-violet-50 text-violet-700 border-violet-200",
              exchange.status === "COMPLETED" && "bg-[#E8F5E9] text-[#1B5E20] border-emerald-250"
            )}>
              {exchange.status.replace("_", " ")}
            </span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <span className="text-slate-400">Name:</span>{" "}
                <span className="text-slate-900 font-bold">{exchange.user?.name || "Guest / Storefront Client"}</span>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>{" "}
                <span className="text-slate-900 font-bold">{exchange.user?.email || "No email available"}</span>
              </div>
              {exchange.user?.phone && (
                <div>
                  <span className="text-slate-400">Phone:</span>{" "}
                  <span className="text-slate-900 font-bold">{exchange.user.phone}</span>
                </div>
              )}
              {exchange.product && (
                <div className="col-span-2 border-t border-slate-100 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400">Linked Purchase Product:</span>{" "}
                    <span className="text-slate-900 font-bold">{exchange.product.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-800">{formatPriceExact(exchange.product.priceCents)}</span>
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
                <p className="text-slate-805 font-extrabold mt-0.5">{exchange.condition}</p>
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
                <p className="text-xs text-slate-700 bg-slate-50 border border-slate-250/40 rounded-xl p-3 leading-relaxed font-semibold">
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

            {/* Price evaluation dashboard display */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100/60 text-xs font-medium space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated value:</span>
                <span className="font-bold text-slate-800">{formatPriceExact(exchange.estimatedValueCents)}</span>
              </div>
              {exchange.finalValueCents && (
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-150/40 pt-2 text-sm">
                  <span>Approved value:</span>
                  <span>{formatPriceExact(exchange.finalValueCents)}</span>
                </div>
              )}
            </div>

            {/* General details textarea */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Transaction Notes / Details</label>
              <textarea
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Include reason for counter-offer, rejection, or additional verification instructions..."
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#2E6F40] resize-none"
              />
            </div>

            {/* Technician assignment input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Assigned Technician</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#2E6F40]"
              />
            </div>

            {/* PENDING Status Control panel */}
            {exchange.status === "PENDING" && (
              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submitting !== null}
                  onClick={() => handleAction("APPROVED", "approve")}
                  className="w-full py-2.5 bg-[#16A34A] hover:bg-[#159342] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#16A34A]/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitting === "approve" && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                  <span>Approve Request (Est. Credit)</span>
                </button>

                {/* Counter offer subform */}
                <div className="border border-amber-200 bg-amber-50/20 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-850">Propose Counter Offer</span>
                    <span className="text-xs font-bold text-amber-700">EUR (€)</span>
                  </div>
                  <input
                    type="number"
                    value={counterValue}
                    step={5}
                    onChange={(e) => setCounterValue(e.target.value)}
                    className="w-full border border-amber-250 bg-white rounded-xl px-3.5 py-2 text-sm outline-none font-bold"
                  />
                  <button
                    type="button"
                    disabled={submitting !== null || !counterValue}
                    onClick={() => handleAction("COUNTER_OFFER", "counter")}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {submitting === "counter" && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                    <span>Propose Counter Offer</span>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={submitting !== null}
                  onClick={() => handleAction("REJECTED", "reject")}
                  className="w-full py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-650 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitting === "reject" && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                  <span>Reject Exchange Request</span>
                </button>
              </div>
            )}

            {/* PICKUP SCHEDULED Control panel */}
            {exchange.status === "PICKUP_SCHEDULED" && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submitting !== null}
                  onClick={() => handleAction("RECEIVED", "received")}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitting === "received" && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                  <span>Mark as Received at Warehouse</span>
                </button>
              </div>
            )}

            {/* RECEIVED Status Control panel */}
            {exchange.status === "RECEIVED" && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submitting !== null}
                  onClick={() => handleAction("COMPLETED", "completed")}
                  className="w-full py-2.5 bg-[#16A34A] hover:bg-[#159342] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#16A34A]/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitting === "completed" && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                  <span>Complete Final Inspection (Credit Issued)</span>
                </button>
              </div>
            )}

            {/* Completed status indicator */}
            {exchange.status === "COMPLETED" && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Exchange valuation completed and store credit issued.</span>
              </div>
            )}

            {/* Rejected status indicator */}
            {exchange.status === "REJECTED" && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs font-bold flex items-center gap-2">
                <X className="h-4 w-4 stroke-[3]" />
                <span>This exchange request has been rejected.</span>
              </div>
            )}
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
