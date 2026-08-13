"use client";

import type { ComponentProps } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

type LoadingButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    success?: boolean;
    error?: boolean;
    loadingText?: string;
    successText?: string;
    errorText?: string;
  };

export function LoadingButton({
  children,
  loading = false,
  success = false,
  error = false,
  loadingText = "Processing...",
  successText = "Saved",
  errorText = "Failed",
  variant,
  size,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  // Determine active state
  let state: "idle" | "loading" | "success" | "error" = "idle";
  if (loading) state = "loading";
  else if (success) state = "success";
  else if (error) state = "error";

  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        "relative overflow-hidden transition-all duration-200",
        state !== "idle" && "pointer-events-none select-none",
        className
      )}
      disabled={disabled || loading || success || error}
      {...props}
    >
      <span className="grid grid-cols-1 grid-rows-1 items-center justify-center w-full">
        {/* Idle State */}
        <span
          className={cn(
            "col-start-1 row-start-1 flex items-center justify-center gap-2 transition-all duration-200",
            state === "idle" ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
          )}
        >
          {children}
        </span>

        {/* Loading State */}
        <span
          className={cn(
            "col-start-1 row-start-1 flex items-center justify-center gap-2 transition-all duration-200",
            state === "loading" ? "opacity-100 scale-100 animate-pulse" : "opacity-0 scale-90 pointer-events-none"
          )}
        >
          <Loader2 className="size-4 animate-spin shrink-0" />
          <span>{loadingText}</span>
        </span>

        {/* Success State */}
        <span
          className={cn(
            "col-start-1 row-start-1 flex items-center justify-center gap-2 transition-all duration-200 text-emerald-600 dark:text-emerald-400 font-semibold",
            state === "success" ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
          )}
        >
          <Check className="size-4 shrink-0 stroke-[3]" />
          <span>{successText}</span>
        </span>

        {/* Error State */}
        <span
          className={cn(
            "col-start-1 row-start-1 flex items-center justify-center gap-2 transition-all duration-200 text-rose-600 dark:text-rose-400 font-semibold",
            state === "error" ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
          )}
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorText}</span>
        </span>
      </span>
    </button>
  );
}
