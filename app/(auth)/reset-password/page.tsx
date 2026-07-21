"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { resetPasswordAction } from "@/app/(auth)/actions";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = use(searchParams);
  const router = useRouter();
  const token = params.token || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    const res = await resetPasswordAction(null, formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else if (res?.redirectUrl) {
      router.push(res.redirectUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background px-4 py-12 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[36rem] rounded-full bg-[#2E6F40]/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#2E6F40] text-white shadow-lg shadow-[#2E6F40]/25 transition-transform group-hover:scale-105">
              <ShieldCheck className="size-6" />
            </div>
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-xl">
              Rhydm Tech
            </span>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Set new password
          </h1>
          <p className="text-xs font-semibold text-muted-foreground">
            Enter your new password below to update your account credentials.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-border dark:bg-card space-y-6">
          {!token ? (
            <div className="space-y-4 text-center">
              <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600">
                <AlertCircle className="size-4 shrink-0" />
                <span>Invalid or missing reset token.</span>
              </div>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center rounded-2xl bg-[#2E6F40] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#255833]"
              >
                Request New Password Reset Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-600">
                  <AlertCircle className="size-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="password"
                    name="newPassword"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-border dark:bg-muted/40 pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-[#2E6F40] focus:bg-white dark:focus:bg-card transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-border dark:bg-muted/40 pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-[#2E6F40] focus:bg-white dark:focus:bg-card transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2E6F40] hover:bg-[#255833] py-3 text-xs font-extrabold text-white shadow-lg shadow-[#2E6F40]/25 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
