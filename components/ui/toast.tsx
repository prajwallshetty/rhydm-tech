"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Heart, X, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { create } from "zustand";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Toast = {
  id: number;
  message: string;
  icon?: "check" | "heart" | "info" | "warning" | "error";
};

type ToastState = {
  toasts: Toast[];
  push: (message: string, icon?: Toast["icon"]) => void;
  dismiss: (id: number) => void;
};

let nextId = 0;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, icon = "check") =>
    set((state) => {
      const id = (nextId += 1);
      // Auto-dismiss; the timer is cleared implicitly when the id is gone.
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, 3500);
      return { toasts: [...state.toasts, { id, message, icon }] };
    }),
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);
  const t = useTranslations("common");

  return (
    <div
      // aria-live so screen readers announce additions without stealing focus.
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-5 right-5 z-100 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2.5"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border/80 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-xl"
          >
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full",
                toast.icon === "heart" && "bg-rose-50 dark:bg-rose-950/35 text-rose-500",
                toast.icon === "check" && "bg-emerald-50 dark:bg-emerald-950/35 text-[#16A34A]",
                toast.icon === "info" && "bg-blue-50 dark:bg-blue-950/35 text-blue-500",
                toast.icon === "warning" && "bg-amber-50 dark:bg-amber-950/35 text-amber-500",
                toast.icon === "error" && "bg-red-50 dark:bg-red-950/35 text-red-500"
              )}
            >
              {toast.icon === "heart" && <Heart className="size-3.5" strokeWidth={2.2} />}
              {toast.icon === "check" && <Check className="size-3.5" strokeWidth={2.6} />}
              {toast.icon === "info" && <Info className="size-3.5" strokeWidth={2.2} />}
              {toast.icon === "warning" && <AlertTriangle className="size-3.5" strokeWidth={2.2} />}
              {toast.icon === "error" && <AlertCircle className="size-3.5" strokeWidth={2.2} />}
            </span>
            <p className="flex-1 text-sm">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label={t("dismiss")}
              className="text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
