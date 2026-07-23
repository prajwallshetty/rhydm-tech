"use client";

import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string; count?: number };

const CONDITIONS: FilterOption[] = [
  { value: "GRADE_A", label: "Grade A — Excellent" },
  { value: "GRADE_B", label: "Grade B — Good" },
  { value: "GRADE_C", label: "Grade C — Fair" },
  { value: "OPEN_BOX", label: "Open Box" },
];

const WARRANTIES: FilterOption[] = [
  { value: "12", label: "12 months or more" },
  { value: "24", label: "24 months or more" },
];

/**
 * Filters are held in the URL rather than component state: results stay
 * shareable and bookmarkable, and the listing can be rendered on the server.
 */
export function ProductFilters({
  brands,
  categories,
  priceBounds,
  /** Hidden when the page is already scoped to one category. */
  showCategories = true,
}: {
  brands: FilterOption[];
  categories: FilterOption[];
  priceBounds: { minCents: number; maxCents: number };
  showCategories?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const selected = (key: string) => searchParams.getAll(key);

  function update(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    // Any filter change invalidates the current page number.
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggle(key: string, value: string) {
    update((params) => {
      const current = params.getAll(key);
      params.delete(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      next.forEach((v) => params.append(key, v));
    });
  }

  function setSingle(key: string, value: string | null) {
    update((params) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
  }

  const activeCount =
    selected("brand").length +
    selected("condition").length +
    selected("category").length +
    (searchParams.get("maxPrice") ? 1 : 0) +
    (searchParams.get("warranty") ? 1 : 0) +
    (searchParams.get("inStock") ? 1 : 0);

  const maxPrice = searchParams.get("maxPrice");

  const panel = (
    <div className="space-y-7">
      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand"
        >
          <X className="size-3.5" />
          Clear all filters ({activeCount})
        </button>
      )}

      {showCategories && categories.length > 0 && (
        <Group title="Category">
          {categories.map((option) => (
            <Check
              key={option.value}
              label={option.label}
              count={option.count}
              checked={selected("category").includes(option.value)}
              onChange={() => toggle("category", option.value)}
            />
          ))}
        </Group>
      )}

      <Group title="Brand">
        {brands.map((option) => (
          <Check
            key={option.value}
            label={option.label}
            count={option.count}
            checked={selected("brand").includes(option.value)}
            onChange={() => toggle("brand", option.value)}
          />
        ))}
      </Group>

      <Group title="Condition">
        {CONDITIONS.map((option) => (
          <Check
            key={option.value}
            label={option.label}
            checked={selected("condition").includes(option.value)}
            onChange={() => toggle("condition", option.value)}
          />
        ))}
      </Group>

      <Group title="Max price">
        <input
          type="range"
          min={priceBounds.minCents}
          max={priceBounds.maxCents}
          step={1000}
          value={maxPrice ?? priceBounds.maxCents}
          onChange={(e) => setSingle("maxPrice", e.target.value)}
          aria-label="Maximum price"
          className="w-full accent-[var(--brand)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(priceBounds.minCents)}</span>
          <span className="font-medium text-foreground">
            up to {formatPrice(Number(maxPrice ?? priceBounds.maxCents))}
          </span>
        </div>
      </Group>

      <Group title="Warranty">
        {WARRANTIES.map((option) => (
          <Check
            key={option.value}
            label={option.label}
            checked={searchParams.get("warranty") === option.value}
            onChange={() =>
              setSingle(
                "warranty",
                searchParams.get("warranty") === option.value
                  ? null
                  : option.value,
              )
            }
          />
        ))}
      </Group>

      <Group title="Availability">
        <Check
          label="In stock only"
          checked={searchParams.get("inStock") === "1"}
          onChange={() =>
            setSingle("inStock", searchParams.get("inStock") === "1" ? null : "1")
          }
        />
      </Group>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium lg:hidden"
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-brand px-1.5 text-xs text-brand-foreground">
            {activeCount}
          </span>
        )}
      </button>

      <aside className="hidden lg:block">{panel}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Filters"
            className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-background p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-medium">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close filters"
                className="grid size-9 place-items-center rounded-lg border border-border/70"
              >
                <X className="size-4" />
              </button>
            </div>
            {panel}
          </div>
        </div>
      )}
    </>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

function Check({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded border-input accent-[var(--brand)]"
      />
      <span className={cn("flex-1", checked && "text-foreground")}>{label}</span>
      {count != null && <span className="text-xs opacity-70">{count}</span>}
    </label>
  );
}
