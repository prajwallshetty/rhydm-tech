import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Server-rendered pagination — each page is a real link, so results are
 * crawlable and the browser's back button behaves as expected.
 */
export function Pagination({
  page,
  pageCount,
  buildHref,
}: {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  // Window of pages around the current one, so long catalogs don't render
  // hundreds of links.
  const windowSize = 2;
  const pages: (number | "gap")[] = [];

  for (let i = 1; i <= pageCount; i += 1) {
    const withinWindow = Math.abs(i - page) <= windowSize;
    const isEdge = i === 1 || i === pageCount;

    if (withinWindow || isEdge) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "gap") {
      pages.push("gap");
    }
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <PageLink
        href={buildHref(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </PageLink>

      {pages.map((entry, index) =>
        entry === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <PageLink
            key={entry}
            href={buildHref(entry)}
            current={entry === page}
            aria-label={`Page ${entry}`}
          >
            {entry}
          </PageLink>
        ),
      )}

      <PageLink
        href={buildHref(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  current,
  disabled,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
} & React.ComponentProps<"a">) {
  const className = cn(
    "grid h-11 min-w-11 sm:h-9 sm:min-w-9 place-items-center rounded-lg border px-2.5 text-sm transition-colors",
    current
      ? "border-brand bg-brand text-brand-foreground"
      : "border-border hover:bg-accent",
    disabled && "pointer-events-none opacity-40",
  );

  if (disabled) {
    return (
      <span aria-disabled className={className} {...props}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      aria-current={current ? "page" : undefined}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}
