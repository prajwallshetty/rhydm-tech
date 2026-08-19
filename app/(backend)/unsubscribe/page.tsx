import Link from "next/link";

import { unsubscribeByToken } from "@/app/(backend)/unsubscribe/actions";
import { COMPANY } from "@/lib/business";

import { UnsubscribeForm } from "./unsubscribe-form";

export const metadata = {
  title: "Unsubscribe",
  // Unsubscribe pages carry a token in the URL and have no business in a
  // search index.
  robots: { index: false, follow: false },
};

/**
 * Unsubscribe landing page.
 *
 * A token in the URL is honoured immediately on load — one click from the email
 * and it is done. Without a valid token the visitor gets a form instead, so a
 * forwarded or truncated link still leads somewhere useful.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;
  const result = token ? await unsubscribeByToken(token) : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {result?.ok ? "You're unsubscribed" : "Unsubscribe"}
          </h1>
          <p className="text-sm text-slate-500">
            {result?.ok
              ? result.alreadyDone
                ? `${result.email} was already opted out of marketing emails.`
                : `${result.email} will no longer receive marketing emails from ${COMPANY.name}.`
              : `Stop receiving marketing emails from ${COMPANY.name}.`}
          </p>
        </div>

        {result?.ok ? (
          <div className="space-y-4">
            <p className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
              You will still receive essential messages about orders, trade-in requests
              and account security. Those are not marketing and cannot be turned off.
            </p>
            <Link
              href="/"
              className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#16A34A] text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Back to the website
            </Link>
          </div>
        ) : (
          <UnsubscribeForm
            defaultEmail={email ?? ""}
            tokenError={result && !result.ok ? result.error : null}
          />
        )}
      </div>
    </main>
  );
}
