"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, ShieldCheck, Loader2, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { forgotPasswordAction } from "@/app/(auth)/actions";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await forgotPasswordAction(null, formData);

    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else if (res?.message) {
      setMessage(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
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
            Reset your password
          </h1>
          <p className="text-xs font-semibold text-muted-foreground">
            Enter your account email and we&rsquo;ll generate a secure 15-minute reset token.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-border dark:bg-card space-y-6">
          {message ? (
            <div className="space-y-4 text-center">
              <div className="flex size-12 mx-auto items-center justify-center rounded-full bg-emerald-100 text-[#2E6F40] dark:bg-emerald-950/50">
                <CheckCircle2 className="size-6" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {message}
              </p>

              {resetToken && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30 text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#2E6F40]">
                    <KeyRound className="size-4" />
                    <span>Security Reset Token Active (Expires in 15 mins)</span>
                  </div>
                  <Link
                    href={`/reset-password?token=${resetToken}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E6F40] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#255833] transition-colors"
                  >
                    Proceed to Reset Password
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 pt-2"
              >
                <ArrowLeft className="size-3.5" />
                <span>Return to login</span>
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
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@company.com"
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
                    <span>Generating token...</span>
                  </>
                ) : (
                  <span>Send Password Reset Link</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back to sign in</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
