"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { unsubscribeByEmail } from "@/app/(backend)/unsubscribe/actions";

/**
 * Manual opt-out.
 *
 * The fallback when a token is missing, expired or mangled by a mail client.
 * Never reports whether the address was on the list — see the action.
 */
export function UnsubscribeForm({
  defaultEmail,
  tokenError,
}: {
  defaultEmail: string;
  tokenError: string | null;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p role="status" className="flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          If {email} was subscribed, it has been removed from our marketing list.
        </span>
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await unsubscribeByEmail(email);
          if (result.ok) setDone(true);
          else setError(result.error);
        });
      }}
    >
      {tokenError && (
        <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{tokenError}</span>
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="unsub-email" className="text-xs font-bold text-slate-700">
          Email address
        </label>
        <input
          id="unsub-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-base outline-none transition-colors focus:border-[#16A34A] focus:bg-white sm:text-sm"
        />
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2 text-xs font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{pending ? "Unsubscribing…" : "Unsubscribe"}</span>
      </button>
    </form>
  );
}
