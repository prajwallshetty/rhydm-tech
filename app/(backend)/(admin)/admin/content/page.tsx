import Link from "next/link";

import { SiteContentManager } from "@/components/admin/site-content-manager";
import { getSectionContent } from "@/lib/cms/content";
import { SECTION_DEFS } from "@/lib/cms/registry";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default async function AdminSiteContentPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const params = await searchParams;
  const locale = routing.locales.includes(params.locale as never)
    ? (params.locale as string)
    : "en";

  // Merged (defaults + en + locale) content for every registered section.
  const sections = await Promise.all(
    SECTION_DEFS.map(async (def) => ({
      def,
      content: await getSectionContent(def.key, locale),
    })),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Site Content
          </h1>
          <p className="text-sm text-muted-foreground">
            Page copy that isn&rsquo;t structured data — heroes, comparison
            lists, CTAs, footer links. Saving publishes immediately; clearing a
            field falls back to English, then to the built-in default.
          </p>
        </div>

        {/* Locale tabs — each language is edited and stored independently. */}
        <div className="flex rounded-xl border border-slate-200 p-1 dark:border-border">
          {routing.locales.map((l) => (
            <Link
              key={l}
              href={l === "en" ? "/admin/content" : `/admin/content?locale=${l}`}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-bold uppercase transition-colors",
                l === locale
                  ? "bg-[#2E6F40] text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l}
            </Link>
          ))}
        </div>
      </div>

      <SiteContentManager key={locale} sections={sections} locale={locale} />
    </div>
  );
}
