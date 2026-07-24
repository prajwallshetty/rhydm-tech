"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

/**
 * Both icons are rendered and CSS picks one via the `dark` variant. This
 * avoids the usual `mounted` flag — the server cannot know the resolved theme,
 * and toggling on it in an effect causes a cascading render (and a visible
 * icon flash on first paint).
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={t("toggleTheme")}
      className="grid size-9 place-items-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Moon className="size-4 dark:hidden" strokeWidth={1.8} />
      <Sun className="hidden size-4 dark:block" strokeWidth={1.8} />
    </button>
  );
}
