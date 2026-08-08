import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PublishStatus } from "@/lib/generated/prisma/client";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import React from "react";
import { Link } from "@/i18n/navigation";
import { createPageMetadata } from "@/lib/seo/metadata";
import { Calendar, Clock, ArrowLeft, User, Tag, ShieldCheck } from "lucide-react";
import { blogPostSchema } from "@/lib/seo/schemas";
import { JsonLd } from "@/components/seo/json-ld";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const posts = await db.post.findMany({
    where: { status: PublishStatus.PUBLISHED },
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await db.post.findUnique({
    where: { slug },
  });

  if (!post) {
    return { title: "Article Not Found" };
  }

  return createPageMetadata({
    title: post.title,
    description: post.excerpt ?? "",
    path: `/blog/${post.slug}`,
  });
}

// Calculate estimated reading time
function getReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Custom Markdown Parser to JSX
function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let inTable = false;
  let tableRows: string[][] = [];

  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="bg-slate-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 px-1 py-0.5 rounded font-mono text-xs">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    // 1. Table parsing
    if (line.trim().startsWith("|")) {
      inTable = true;
      if (line.includes("---")) {
        return;
      }
      const cols = line.split("|").map(c => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1);
      tableRows.push(cols);
      return;
    } else if (inTable) {
      inTable = false;
      const rows = [...tableRows];
      tableRows = [];
      elements.push(
        <div key={`table-${index}`} className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-800 text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900">
              <tr>
                {rows[0]?.map((col, cIdx) => (
                  <th key={cIdx} className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {parseInline(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
              {rows.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                  {row.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {parseInline(col)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 2. Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (inList) inList = false;
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

      if (level === 1) {
        elements.push(
          <h1 key={index} id={id} className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-100 dark:border-zinc-800 pb-3">
            {parseInline(text)}
          </h1>
        );
      } else if (level === 2) {
        elements.push(
          <h2 key={index} id={id} className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
            {parseInline(text)}
          </h2>
        );
      } else {
        elements.push(
          <h3 key={index} id={id} className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">
            {parseInline(text)}
          </h3>
        );
      }
      return;
    }

    // 3. Blockquotes
    if (line.trim().startsWith(">")) {
      if (inList) inList = false;
      const text = line.replace(/^>\s+/, "").trim();
      elements.push(
        <blockquote key={index} className="border-l-4 border-[#16A34A] pl-4 my-6 italic text-slate-600 dark:text-slate-400 text-xs bg-slate-50 dark:bg-zinc-900/50 py-3 pr-3 rounded-r-xl">
          {parseInline(text)}
        </blockquote>
      );
      return;
    }

    // 4. Checklist items
    const checklistMatch = line.match(/^-\s+\[\s*\]\s+(.*)$/);
    if (checklistMatch) {
      if (inList) inList = false;
      const text = checklistMatch[1];
      elements.push(
        <div key={index} className="flex items-start gap-2.5 my-2.5 text-xs">
          <input type="checkbox" readOnly checked={false} className="mt-0.5 rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A]" />
          <span className="text-slate-600 dark:text-slate-400">{parseInline(text)}</span>
        </div>
      );
      return;
    }

    // 5. Standard list items
    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      const text = listMatch[1];
      if (!inList) inList = true;
      elements.push(
        <li key={index} className="ml-5 list-disc text-xs text-slate-600 dark:text-slate-400 leading-relaxed my-1.5">
          {parseInline(text)}
        </li>
      );
      return;
    }

    // 6. Blank line
    if (line.trim() === "") {
      if (inList) inList = false;
      return;
    }

    // 7. Paragraph
    if (inList) inList = false;
    elements.push(
      <p key={index} className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 my-4">
        {parseInline(line)}
      </p>
    );
  });

  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Fetch the article details
  const post = await db.post.findUnique({
    where: { slug },
    include: {
      category: true,
      author: { select: { name: true } },
      tags: true,
    },
  });

  if (!post || post.status !== PublishStatus.PUBLISHED) {
    notFound();
  }

  const readTime = getReadingTime(post.content);

  // Prepare schema org data
  const jsonLdData = blogPostSchema({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    authorName: post.author?.name || "Rhydm Admin",
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
  });

  return (
    <>
      <JsonLd data={jsonLdData} />

      <div className="bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 min-h-screen py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          {/* Breadcrumb / Back button */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4 mb-8">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>{locale === "de" ? "Zurück zur Übersicht" : "Back to Articles"}</span>
            </Link>

            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {post.category?.name || "KNOWLEDGE BASE"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Article Body */}
            <article className="lg:col-span-8 space-y-8">
              
              {/* Heading */}
              <div className="space-y-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {post.title}
                </h1>
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="size-4 text-[#16A34A]" />
                    <span>{post.author?.name || "Rhydm Admin"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-4 text-[#16A34A]" />
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : null}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-4 text-[#16A34A]" />
                    <span>{readTime} {locale === "de" ? "Min. Lesezeit" : "min read"}</span>
                  </div>
                </div>
              </div>

              {/* Rendered content */}
              <div className="prose prose-emerald max-w-none dark:prose-invert">
                {renderMarkdown(post.content)}
              </div>
            </article>

            {/* Right Column: Sticky Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="lg:sticky lg:top-28 space-y-6">
                
                {/* Meta Data Box */}
                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {locale === "de" ? "Kategorie & Schlagworte" : "Article Metadata"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{locale === "de" ? "Kategorie:" : "Category:"}</span>
                      <span className="font-bold text-[#16A34A]">{post.category?.name}</span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs text-slate-500 block">{locale === "de" ? "Tags:" : "Tags:"}</span>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map((tag) => (
                            <span key={tag.id} className="inline-flex items-center rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trust Information */}
                <div className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/50 p-6 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-[#16A34A]" />
                    <span>{locale === "de" ? "Zertifizierter Partner" : "Certified ITAD Partner"}</span>
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {locale === "de" 
                      ? "Rhydm Tech bietet sichere IT-Asset-Entsorgung und zirkuläre IT-Dienstleistungen für Unternehmen in Deutschland, geprüft und zertifiziert."
                      : "Rhydm Tech offers secure IT asset disposition and circular IT recycling services for businesses across Germany, fully certified."
                    }
                  </p>
                </div>

              </div>
            </aside>

          </div>
        </div>
      </div>
    </>
  );
}
