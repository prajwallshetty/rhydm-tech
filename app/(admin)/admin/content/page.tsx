import { SiteContentManager } from "@/components/admin/site-content-manager";
import { getSectionContent } from "@/lib/cms/content";
import { SECTION_DEFS } from "@/lib/cms/registry";

export default async function AdminSiteContentPage() {
  // Merged (defaults + saved) content for every registered section.
  const sections = await Promise.all(
    SECTION_DEFS.map(async (def) => ({
      def,
      content: await getSectionContent(def.key),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Site Content
        </h1>
        <p className="text-sm text-muted-foreground">
          Page copy that isn&rsquo;t structured data — heroes, comparison
          lists, CTAs, footer links. Saving publishes immediately; clearing a
          field falls back to the built-in default.
        </p>
      </div>

      <SiteContentManager sections={sections} />
    </div>
  );
}
