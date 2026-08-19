"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Loader2,
  Monitor,
  Save,
  Send,
  Smartphone,
} from "lucide-react";

import {
  countAudienceAction,
  previewCampaignAction,
  saveCampaignAction,
  sendCampaignTestAction,
  type CampaignInput,
} from "@/app/(backend)/(admin)/admin/marketing/actions";
import { cn } from "@/lib/utils";

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
}

const AUDIENCES: Array<{ value: CampaignInput["audience"]; label: string; hint: string }> = [
  { value: "ALL_OPTED_IN", label: "All opted-in", hint: "Customers and newsletter subscribers who opted in." },
  { value: "NEWSLETTER_SUBSCRIBERS", label: "Newsletter only", hint: "People who signed up for the newsletter." },
  { value: "CUSTOMERS_WITH_ORDERS", label: "Past customers", hint: "Opted-in accounts with at least one order." },
];

const FIELD_CLASS =
  "min-h-11 w-full rounded-lg border border-input bg-background/50 px-3.5 text-base outline-none transition-colors focus:border-primary sm:text-sm";

export function CampaignEditor({
  products,
  initial,
  campaignId,
  adminEmail,
}: {
  products: ProductOption[];
  initial: CampaignInput;
  campaignId?: string;
  adminEmail: string;
}) {
  const router = useRouter();

  const [form, setForm] = useState<CampaignInput>(initial);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [testTo, setTestTo] = useState(adminEmail);
  const [feedback, setFeedback] = useState<
    { kind: "ok" | "error"; message: string } | null
  >(null);

  const [saving, startSaving] = useTransition();
  const [previewing, startPreviewing] = useTransition();
  const [testing, startTesting] = useTransition();

  // Keep the audience size live so the admin always knows the blast radius
  // before they commit to sending.
  useEffect(() => {
    let cancelled = false;
    countAudienceAction(form.audience)
      .then((count) => {
        if (!cancelled) setAudienceCount(count);
      })
      .catch(() => {
        if (!cancelled) setAudienceCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [form.audience]);

  const update = <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleProduct = (id: string) =>
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(id)
        ? prev.productIds.filter((p) => p !== id)
        : prev.productIds.length >= 8
          ? prev.productIds
          : [...prev.productIds, id],
    }));

  const handleSave = () => {
    setFeedback(null);
    startSaving(async () => {
      const result = await saveCampaignAction({ ...form, id: campaignId });
      if (!result.ok) {
        setFeedback({ kind: "error", message: result.error });
        return;
      }
      setFeedback({ kind: "ok", message: "Draft saved." });
      if (!campaignId) router.replace(`/admin/marketing/${result.id}`);
      else router.refresh();
    });
  };

  const handlePreview = () => {
    setFeedback(null);
    startPreviewing(async () => {
      const result = await previewCampaignAction(form);
      if (!result.ok) setFeedback({ kind: "error", message: result.error });
      else setPreview(result.html);
    });
  };

  const handleTest = () => {
    setFeedback(null);
    startTesting(async () => {
      const result = await sendCampaignTestAction({ ...form, to: testTo });
      setFeedback(
        result.ok
          ? { kind: "ok", message: `Test sent to ${testTo}.` }
          : { kind: "error", message: result.error },
      );
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/marketing"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to campaigns</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {campaignId ? "Edit campaign" : "New campaign"}
        </h1>
      </div>

      {feedback && (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={cn(
            "flex items-start gap-2 rounded-lg p-3 text-xs font-semibold",
            feedback.kind === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700",
          )}
        >
          {feedback.kind === "ok" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        {/* Editor */}
        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-border/80 bg-card p-6 shadow-sm">
            <h2 className="border-b border-border/60 pb-3 text-base font-semibold text-foreground">
              Content
            </h2>

            <div className="space-y-1.5">
              <label htmlFor="c-name" className="text-xs font-semibold text-muted-foreground">
                Campaign name <span className="font-normal">(internal)</span>
              </label>
              <input
                id="c-name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={FIELD_CLASS}
                placeholder="October refurbished laptops"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="c-subject" className="text-xs font-semibold text-muted-foreground">
                Subject line
              </label>
              <input
                id="c-subject"
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
                className={FIELD_CLASS}
                placeholder="New refurbished laptops available"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="c-preview" className="text-xs font-semibold text-muted-foreground">
                Preview text
              </label>
              <input
                id="c-preview"
                value={form.previewText ?? ""}
                onChange={(e) => update("previewText", e.target.value)}
                className={FIELD_CLASS}
                placeholder="Shown in the inbox next to the subject"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="c-body" className="text-xs font-semibold text-muted-foreground">
                Body (HTML)
              </label>
              <textarea
                id="c-body"
                value={form.bodyHtml}
                onChange={(e) => update("bodyHtml", e.target.value)}
                rows={12}
                className="w-full rounded-lg border border-input bg-background/50 p-3.5 font-mono text-xs outline-none transition-colors focus:border-primary"
                placeholder="<p>Hello,</p><p>We have just added...</p>"
              />
              <p className="text-xs text-muted-foreground">
                Basic formatting only. Scripts, iframes and event handlers are stripped
                automatically. The header, footer and unsubscribe link are added for you.
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/80 bg-card p-6 shadow-sm">
            <h2 className="border-b border-border/60 pb-3 text-base font-semibold text-foreground">
              Audience
            </h2>

            <div className="space-y-2">
              {AUDIENCES.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors",
                    form.audience === option.value
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-muted/50",
                  )}
                >
                  <input
                    type="radio"
                    name="audience"
                    value={option.value}
                    checked={form.audience === option.value}
                    onChange={() => update("audience", option.value)}
                    className="mt-0.5 size-4 accent-[#16A34A]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>

            <p className="rounded-lg bg-muted/50 p-3 text-xs font-medium text-foreground">
              {audienceCount === null
                ? "Counting recipients…"
                : `${audienceCount} ${audienceCount === 1 ? "person" : "people"} will receive this.`}
            </p>
          </section>

          <section className="space-y-4 rounded-xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="border-b border-border/60 pb-3">
              <h2 className="text-base font-semibold text-foreground">Featured products</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Optional. Up to 8. Cards show the live name, price and image from the catalogue.
              </p>
            </div>

            <div className="max-h-64 space-y-1.5 overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-xs text-muted-foreground">No published products.</p>
              ) : (
                products.map((product) => {
                  const selected = form.productIds.includes(product.id);
                  return (
                    <label
                      key={product.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-colors",
                        selected ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleProduct(product.id)}
                        className="size-4 accent-[#16A34A]"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                        {product.name}
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                        {(product.priceCents / 100).toFixed(2)} €
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/80 bg-card p-6 shadow-sm">
            <h2 className="border-b border-border/60 pb-3 text-base font-semibold text-foreground">
              Send a test
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                className={cn(FIELD_CLASS, "flex-1")}
                aria-label="Test recipient"
                placeholder="you@rhydm-tech.com"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-input px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>{testing ? "Sending…" : "Send test"}</span>
              </button>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? "Saving…" : "Save draft"}</span>
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={previewing}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-input px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              <span>Preview</span>
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Saving never sends. A campaign only goes out when you press Send on the
            campaigns list and confirm.
          </p>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Preview</h2>
            <div className="flex gap-1 rounded-lg border border-input p-1">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                aria-pressed={previewDevice === "desktop"}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded px-2.5 text-xs font-semibold transition-colors",
                  previewDevice === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                aria-pressed={previewDevice === "mobile"}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded px-2.5 text-xs font-semibold transition-colors",
                  previewDevice === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/80 bg-muted/30 p-3">
            {preview ? (
              <iframe
                // Rendered in a sandboxed frame with no allow-scripts: the body
                // is admin-authored and already sanitised, but a preview pane
                // is not a reason to execute anything inside the admin origin.
                sandbox=""
                srcDoc={preview}
                title="Email preview"
                className={cn(
                  "mx-auto block h-[640px] rounded-lg border border-border/60 bg-white transition-[width]",
                  previewDevice === "mobile" ? "w-[390px] max-w-full" : "w-full",
                )}
              />
            ) : (
              <div className="flex h-[640px] items-center justify-center px-6 text-center text-xs text-muted-foreground">
                Press Preview to render the email exactly as a recipient sees it.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
