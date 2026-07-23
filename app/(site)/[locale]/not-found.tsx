import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("errors.notFound");
  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <Logo />

      <p className="mt-12 text-sm font-medium uppercase tracking-widest text-brand">
        {t("code")}
      </p>
      <h1 className="mt-3 max-w-lg text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md text-pretty text-muted-foreground">
        {t("body")}
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/disposal" size="lg">
          {t("disposal")}
        </ButtonLink>
        <ButtonLink href="/refurbished" variant="outline" size="lg">
          {t("store")}
        </ButtonLink>
      </div>

      <Link
        href="/?switch=1"
        className="mt-8 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        {t("backToSelection")}
      </Link>
    </main>
  );
}
