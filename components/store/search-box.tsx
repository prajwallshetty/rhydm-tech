"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Search, TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { searchAction, type SearchHit } from "@/app/(refurbished)/refurbished/search-action";
import { conditionShort, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const RECENT_KEY = "rhydm.recentSearches";
const MAX_RECENT = 5;

const TRENDING = [
  "ThinkPad X1",
  "Dell UltraSharp",
  "PowerEdge",
  "MacBook Pro",
  "Thunderbolt dock",
];

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce so keystrokes don't fire a query each. Short terms simply skip
  // the request — stale hits are filtered out below rather than cleared here,
  // which would mean a setState cascade inside the effect.
  useEffect(() => {
    if (term.trim().length < 2) return;

    const timer = setTimeout(() => {
      startTransition(async () => {
        setHits(await searchAction(term));
      });
    }, 220);

    return () => clearTimeout(timer);
  }, [term]);

  // Derived rather than stored, so it can never lag behind `term`.
  const visibleHits = term.trim().length >= 2 ? hits : [];

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function commit(value: string) {
    const query = value.trim();
    if (!query) return;

    const next = [query, ...recent.filter((r) => r !== query)].slice(
      0,
      MAX_RECENT,
    );
    setRecent(next);
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // Storage may be blocked; searching still works without history.
    }

    setOpen(false);
    router.push(`/refurbished/search?q=${encodeURIComponent(query)}`);
  }

  const showSuggestions = open && term.trim().length < 2;
  const showResults = open && term.trim().length >= 2;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          commit(term);
        }}
      >
        <label htmlFor="store-search" className="sr-only">
          Search products
        </label>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id="store-search"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => {
            setRecent(readRecent());
            setOpen(true);
          }}
          placeholder="Search laptops, servers, docks…"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-results"
          className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand"
        />
        {term && (
          <button
            type="button"
            onClick={() => {
              setTerm("");
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      {(showSuggestions || showResults) && (
        <div
          id="search-results"
          className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-border/80 bg-popover shadow-xl"
        >
          {showSuggestions && (
            <div className="p-2">
              {recent.length > 0 && (
                <>
                  <p className="px-3 py-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Recent
                  </p>
                  {recent.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => commit(item)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <Search aria-hidden className="size-3.5 text-muted-foreground" />
                      {item}
                    </button>
                  ))}
                </>
              )}

              <p className="px-3 py-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Trending
              </p>
              {TRENDING.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => commit(item)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  <TrendingUp aria-hidden className="size-3.5 text-brand" />
                  {item}
                </button>
              ))}
            </div>
          )}

          {showResults && (
            <div className="p-2">
              {isPending && visibleHits.length === 0 && (
                <p className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Searching…
                </p>
              )}

              {!isPending && visibleHits.length === 0 && (
                <div className="px-3 py-6 text-center">
                  <p className="text-sm font-medium">No matches for “{term}”</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a broader term, or browse all products.
                  </p>
                  <Link
                    href="/refurbished/shop"
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-block text-sm font-medium text-brand"
                  >
                    Browse the shop →
                  </Link>
                </div>
              )}

              {visibleHits.map((hit) => (
                <Link
                  key={hit.slug}
                  href={`/refurbished/products/${hit.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {hit.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {hit.brandName ? `${hit.brandName} · ` : ""}
                      {hit.categoryName} · {conditionShort(hit.condition)}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium">
                    {formatPrice(hit.priceCents)}
                  </span>
                </Link>
              ))}

              {visibleHits.length > 0 && (
                <button
                  type="button"
                  onClick={() => commit(term)}
                  className="mt-1 w-full rounded-lg px-3 py-2.5 text-center text-sm font-medium text-brand transition-colors hover:bg-accent"
                >
                  See all results for “{term}”
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
