"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Locale selector. Switching replaces only the locale segment of the current
 * URL (client navigation, no full reload) and next-intl persists the choice
 * in the NEXT_LOCALE cookie via the middleware.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("switcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function select(next: AppLocale) {
    setOpen(false);
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;SameSite=Lax`;
    startTransition(() => {
      // Same pathname, different locale — dynamic params pass through.
      router.replace(
        // @ts-expect-error — pathname+params match the current route.
        { pathname, params },
        { locale: next },
      );
    });
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={isPending}
        className="flex h-11 items-center gap-1.5 rounded-full px-3 text-xs font-bold uppercase text-foreground/80 transition-colors hover:bg-muted hover:text-foreground sm:h-9 disabled:opacity-60"
      >
        <Globe className="size-4" strokeWidth={1.8} />
        <span className="sr-only">{t("label")}: </span>
        <span>{locale}</span>
        <ChevronDown
          className={cn("size-3 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          className="absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-xl border border-border/80 bg-popover p-1 shadow-xl"
        >
          {routing.locales.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={option === locale}
                onClick={() => select(option)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted",
                  option === locale
                    ? "font-bold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {t(option)}
                {option === locale && (
                  <Check className="size-4 text-[#16A34A]" strokeWidth={2.4} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
