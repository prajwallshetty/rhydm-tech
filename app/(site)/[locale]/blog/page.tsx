import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PublishStatus } from "@/lib/generated/prisma/client";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createPageMetadata } from "@/lib/seo/metadata";
import { Calendar, Clock, ArrowRight, BookOpen, Tag } from "lucide-react";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    title: locale === "de" ? "Rhydm Tech Blog — Kreislauf-IT & ITAD Fachwissen" : "Rhydm Tech Blog — Circular IT & ITAD Insights",
    description: "Read the latest news, guides, and compliance resources on IT Asset Disposal (ITAD), secure data destruction, and refurbished technology from Rhydm Tech.",
    path: "/blog",
  });
}

// Calculate estimated reading time
function getReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogListingPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const resolvedSearchParams = await searchParams;
  const activeCategory = resolvedSearchParams?.category ? String(resolvedSearchParams.category) : undefined;

  // Fetch categories and posts
  const [categories, posts] = await Promise.all([
    db.blogCategory.findMany({
      orderBy: { name: "asc" },
    }),
    db.post.findMany({
      where: {
        status: PublishStatus.PUBLISHED,
        ...(activeCategory ? { category: { slug: activeCategory } } : {}),
      },
      orderBy: { publishedAt: "desc" },
      include: {
        category: true,
        author: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Blog Header */}
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#16A34A]">
            {locale === "de" ? "Rhydm Tech Magazin" : "Rhydm Tech Insights"}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            {locale === "de" ? "Kreislauf-IT & ITAD Fachwissen" : "Circular IT & ITAD Knowledge Base"}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-lg mx-auto">
            {locale === "de"
              ? "Erfahren Sie mehr über sichere Datenvernichtung, gesetzliche Compliance, zirkuläre IT-Modelle und IT-Asset-Entsorgung in Deutschland."
              : "Explore compliance guides, data destruction standards, sustainability benchmarks, and value recovery guidelines for enterprise hardware."}
          </p>
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <Link
            href="/blog"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              !activeCategory
                ? "bg-[#16A34A] text-white shadow-sm"
                : "bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            {locale === "de" ? "Alle Beiträge" : "All Articles"}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog?category=${cat.slug}`}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeCategory === cat.slug
                  ? "bg-[#16A34A] text-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Blog Post Cards Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20 space-y-3 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8">
            <BookOpen className="size-12 mx-auto text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {locale === "de" ? "Keine Beiträge gefunden" : "No Articles Found"}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {locale === "de"
                ? "Für diese Kategorie wurden noch keine Artikel veröffentlicht. Bitte versuchen Sie es später erneut."
                : "No articles are currently published in this category. Check back soon for updates."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const readTime = getReadingTime(post.content);
              return (
                <article
                  key={post.id}
                  className="flex flex-col items-start justify-between rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="w-full space-y-4">
                    {/* Category Label */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 text-xs font-bold text-[#16A34A] dark:text-emerald-400 border border-emerald-200/30">
                        <Tag className="size-3" />
                        <span>{post.category?.name}</span>
                      </span>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="size-3.5 text-slate-400" />
                        <span>{readTime} {locale === "de" ? "Min. Lesezeit" : "min read"}</span>
                      </div>
                    </div>

                    {/* Excerpt Copy */}
                    <div className="group relative space-y-2">
                      <h3 className="text-lg font-extrabold leading-snug text-slate-900 dark:text-white group-hover:text-[#16A34A] transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Author/Date */}
                  <div className="w-full mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Calendar className="size-3.5 text-slate-400" />
                      <span>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : null}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#16A34A] hover:text-[#15803d] transition-colors"
                    >
                      <span>{locale === "de" ? "Weiterlesen" : "Read Article"}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
