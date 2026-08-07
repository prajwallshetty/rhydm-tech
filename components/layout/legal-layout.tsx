"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Printer, 
  Download, 
  Link as LinkIcon, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  X,
  FileText
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface LegalLayoutProps {
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  locale: string;
  lastUpdated?: string;
}

export function LegalLayout({
  title,
  content,
  seoTitle,
  seoDescription,
  slug,
  locale,
  lastUpdated = new Date().toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}: LegalLayoutProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");

  // Calculate estimated reading time
  const readingTime = useMemo(() => {
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / 200); // 200 words per minute
  }, [content]);

  // Extract headings for Table of Contents
  const headings = useMemo(() => {
    const headingLines = content.split("\n").filter(line => line.startsWith("#"));
    return headingLines.map(line => {
      const level = line.split(" ")[0].length;
      const text = line.replace(/^#+\s+/, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      return { level, text, id };
    });
  }, [content]);

  // Scroll spy to highlight active heading
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height + 100) {
            setActiveHeadingId(heading.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  // Copy current URL
  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Trigger browser print/save-as-PDF
  const triggerPrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Helper to parse markdown headings/lists/paragraphs with search highlighting
  const renderFormattedContent = useMemo(() => {
    const lines = content.split("\n");
    let inList = false;
    const renderedElements: React.ReactNode[] = [];

    const highlightText = (text: string) => {
      if (!searchQuery.trim()) return text;
      const regex = new RegExp(`(${searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
      const parts = text.split(regex);
      return parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 rounded-sm px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      );
    };

    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        if (inList) {
          inList = false;
        }
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");

        if (level === 1) {
          // Render document main title H1
          renderedElements.push(
            <h1 key={index} id={id} className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-100 dark:border-border/60 pb-3">
              {highlightText(text)}
            </h1>
          );
        } else if (level === 2) {
          renderedElements.push(
            <h2 key={index} id={id} className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
              {highlightText(text)}
            </h2>
          );
        } else {
          renderedElements.push(
            <h3 key={index} id={id} className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">
              {highlightText(text)}
            </h3>
          );
        }
        return;
      }

      const listMatch = line.match(/^[-*]\s+(.*)$/);
      if (listMatch) {
        const text = listMatch[1];
        if (!inList) {
          inList = true;
        }
        renderedElements.push(
          <li key={index} className="ml-5 list-disc text-sm text-slate-600 dark:text-slate-300 leading-relaxed my-1">
            {highlightText(text)}
          </li>
        );
        return;
      }

      if (line.trim() === "") {
        if (inList) {
          inList = false;
        }
        return;
      }

      // Default paragraph
      if (inList) {
        inList = false;
      }
      renderedElements.push(
        <p key={index} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 my-4">
          {highlightText(line)}
        </p>
      );
    });

    return renderedElements;
  }, [content, searchQuery]);

  // Schema structured JSON-LD data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `https://rhydm.tech/${locale}/${slug}`,
        "url": `https://rhydm.tech/${locale}/${slug}`,
        "name": seoTitle,
        "description": seoDescription,
        "inLanguage": locale
      },
      {
        "@type": "Article",
        "headline": title,
        "dateModified": new Date().toISOString(),
        "author": {
          "@type": "Organization",
          "name": "Rhydm Tech GmbH",
          "url": "https://rhydm.tech"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Rhydm Tech GmbH",
          "logo": {
            "@type": "ImageObject",
            "url": "https://rhydm.tech/logo.png"
          }
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": locale === "de" ? "Startseite" : "Home",
            "item": `https://rhydm.tech/${locale}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": locale === "de" ? "Rechtliches" : "Legal",
            "item": `https://rhydm.tech/${locale}/${slug}`
          }
        ]
      }
    ]
  };

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 min-h-screen py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          {/* Top Breadcrumb & Go Back */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-border pb-4 mb-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>{locale === "de" ? "Zurück zur Startseite" : "Back to Home"}</span>
            </Link>

            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {locale === "de" ? "Rechtliche Hinweise" : "LEGAL COMPLIANCE"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Policy Header and Content */}
            <article className="lg:col-span-8 space-y-8">
              
              {/* Document Header */}
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                  {title}
                </h1>
                
                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-4 text-[#16A34A]" />
                    <span>{locale === "de" ? "Zuletzt aktualisiert:" : "Last updated:"} {lastUpdated}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-4 text-[#16A34A]" />
                    <span>{readingTime} {locale === "de" ? "Min. Lesezeit" : "min read"}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400 border border-emerald-200/50">
                    <CheckCircle2 className="size-3 text-[#16A34A]" />
                    <span>{locale === "de" ? "Gültiges Dokument" : "Valid Document"}</span>
                  </span>
                </div>
              </div>

              {/* Word Search Inside Document */}
              <div className="relative max-w-md">
                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={locale === "de" ? "In diesem Dokument suchen..." : "Search within document..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-slate-200 dark:border-border bg-white dark:bg-card pl-10 pr-10 py-2.5 text-xs outline-none transition-colors focus:border-[#16A34A]"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Main Content Body */}
              <div className="prose prose-emerald max-w-none dark:prose-invert">
                {renderFormattedContent}
              </div>
            </article>

            {/* Right Column: Sticky Sidebar / Action Panel */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* Sticky Inner Wrap */}
              <div className="lg:sticky lg:top-28 space-y-6">
                
                {/* Actions Widget */}
                <div className="rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {locale === "de" ? "Aktionen" : "DOCUMENT ACTIONS"}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={copyLink}
                      className={cn(
                        "flex items-center justify-between rounded-xl border border-slate-200 dark:border-border px-4 py-3 text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-muted/40 cursor-pointer",
                        copied && "border-emerald-500 bg-emerald-50 text-emerald-800"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <LinkIcon className="size-4" />
                        <span>{locale === "de" ? "Link kopieren" : "Copy Document Link"}</span>
                      </span>
                      {copied && <span className="text-[10px] uppercase font-black">Copied!</span>}
                    </button>

                    <button
                      onClick={triggerPrint}
                      className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-border px-4 py-3 text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-muted/40 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Printer className="size-4" />
                        <span>{locale === "de" ? "Dokument drucken" : "Print Document"}</span>
                      </span>
                      <kbd className="hidden sm:inline-block rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] text-slate-400 font-mono">⌘P</kbd>
                    </button>

                    <button
                      onClick={triggerPrint}
                      className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-border px-4 py-3 text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-muted/40 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="size-4" />
                        <span>{locale === "de" ? "Als PDF herunterladen" : "Download PDF"}</span>
                      </span>
                      <FileText className="size-4 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Table of Contents Widget */}
                {headings.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-card p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {locale === "de" ? "Inhaltsverzeichnis" : "TABLE OF CONTENTS"}
                    </h3>
                    
                    <nav className="space-y-1">
                      {headings.map((heading) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(heading.id)?.scrollIntoView({
                              behavior: "smooth"
                            });
                            setActiveHeadingId(heading.id);
                          }}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-xs font-medium transition-all",
                            heading.level > 2 ? "pl-6 text-slate-400" : "text-slate-600 dark:text-slate-400",
                            activeHeadingId === heading.id 
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-[#16A34A] dark:text-emerald-400 font-bold" 
                              : "hover:bg-slate-50 dark:hover:bg-muted/30 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Trust Information */}
                <div className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/50 p-6 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                    {locale === "de" ? "Rechtliche Sicherheit" : "Legal Compliance Guarantee"}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {locale === "de" 
                      ? "Dieses Dokument entspricht den aktuellen Vorgaben der Datenschutz-Grundverordnung (DSGVO) sowie deutschem Wirtschaftsrecht und wird bei Gesetzesänderungen automatisch angepasst."
                      : "This document is aligned with current GDPR requirements and German corporate guidelines, monitored and updated on a regular schedule."
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
