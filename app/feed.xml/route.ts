import { BRAND, COMPANY, SITE_URL } from "@/lib/business";
import { db } from "@/lib/db";
import { PublishStatus } from "@/lib/generated/prisma/client";
import { routing } from "@/i18n/routing";

/**
 * RSS 2.0 feed of published blog posts.
 *
 * The site's metadata has advertised `/feed.xml` as an `application/rss+xml`
 * alternate for a while, but the route did not exist — every reader and
 * crawler that followed the hint got a 404.
 */
export const revalidate = 3600;

/** Escapes the five XML predefined entities. */
function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const posts = await db.post.findMany({
    where: { status: PublishStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  const self = `${SITE_URL}/feed.xml`;
  const blogUrl = `${SITE_URL}/${routing.defaultLocale}/blog`;

  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/${routing.defaultLocale}/blog/${post.slug}`;
      const date = (post.publishedAt ?? post.updatedAt).toUTCString();
      return `    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(link)}</guid>
      <pubDate>${date}</pubDate>
      ${post.excerpt ? `<description>${xmlEscape(post.excerpt)}</description>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(`${BRAND} — Insights`)}</title>
    <link>${xmlEscape(blogUrl)}</link>
    <description>${xmlEscape(COMPANY.description)}</description>
    <language>${routing.defaultLocale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${xmlEscape(self)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
