"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { loginAction } from "@/app/(backend)/(auth)/actions";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await loginAction(null, formData);

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        setError("Sign in failed. Please check your credentials.");
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection error. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[36rem] rounded-full bg-[#2E6F40]/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link href="/" className="inline-block group transition-transform hover:scale-105">
            <Logo className="h-20 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-xs font-semibold text-muted-foreground">
            Sign in to manage your orders, wishlist, and enterprise services.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-border dark:bg-card space-y-6">
          {/* Google OAuth Button */}
          <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-all dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted cursor-pointer"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </a>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-border" />
            <span className="absolute bg-white dark:bg-card px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Or continue with email
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 rounded-2xl bg-red-50 dark:bg-red-950/40 p-3.5 border border-red-200 dark:border-red-900 text-xs font-bold text-red-600 dark:text-red-400"
            >
              <AlertCircle className="size-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-[#2E6F40] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-border dark:bg-muted/40 pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-[#2E6F40] focus:bg-white dark:focus:bg-card transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                className="size-4 rounded border-slate-300 text-[#2E6F40] focus:ring-[#2E6F40]"
              />
              <label htmlFor="rememberMe" className="text-xs font-bold text-slate-600 dark:text-muted-foreground select-none cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2E6F40] hover:bg-[#255833] py-3 text-xs font-extrabold text-white shadow-lg shadow-[#2E6F40]/25 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs font-semibold text-muted-foreground">
            Don&rsquo;t have an account?{" "}
            <Link href="/signup" className="font-extrabold text-[#2E6F40] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
