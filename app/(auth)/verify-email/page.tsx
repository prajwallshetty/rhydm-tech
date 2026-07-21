import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background px-4 py-12 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[36rem] rounded-full bg-[#2E6F40]/10 blur-3xl" />

      <div className="w-full max-w-md space-y-6 relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[#2E6F40] text-white shadow-lg shadow-[#2E6F40]/25 transition-transform group-hover:scale-105">
            <ShieldCheck className="size-6" />
          </div>
          <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-xl">
            Rhydm Tech
          </span>
        </Link>

        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-border dark:bg-card space-y-6">
          <div className="flex size-16 mx-auto items-center justify-center rounded-full bg-emerald-100 text-[#2E6F40] dark:bg-emerald-950/50">
            <CheckCircle2 className="size-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Email Verified Successfully!
            </h1>
            <p className="text-xs font-semibold text-muted-foreground">
              Your email address has been verified. Your account is fully active.
            </p>
          </div>

          <Link
            href="/refurbished/account"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2E6F40] hover:bg-[#255833] py-3 text-xs font-extrabold text-white shadow-lg shadow-[#2E6F40]/25 transition-transform hover:scale-[1.01]"
          >
            <span>Go to My Account</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
