"use client";

import { useActionState, useState } from "react";
import { Shield, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { loginAdminAction } from "@/app/admin/actions";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fillDemo = () => {
    setEmail("admin@rhydm.tech");
    setPassword("admin123");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Decorative ambient gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-border/80 bg-card/70 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Portal</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage Disposal & Store operations</p>
        </div>

        {/* Demo credentials hint */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-primary">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Demo Admin Access
            </span>
            <button
              type="button"
              onClick={fillDemo}
              className="text-xs underline hover:text-primary/80 font-medium cursor-pointer"
            >
              Auto-fill
            </button>
          </div>
          <div className="text-muted-foreground space-y-0.5">
            <p><span className="font-mono text-foreground">admin@rhydm.tech</span></p>
            <p><span className="font-mono text-foreground">admin123</span></p>
          </div>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rhydm.tech"
                className="w-full rounded-lg border border-input bg-background/50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-input bg-background/50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <span>Signing in…</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          Protected route · Role-based access control
        </div>
      </div>
    </div>
  );
}
