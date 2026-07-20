import { PackageSearch } from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import { ButtonLink } from "@/components/ui/button";
import type { ProductCardData } from "@/lib/repositories/store";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
  columns = 3,
}: {
  products: ProductCardData[];
  className?: string;
  columns?: 3 | 4;
}) {
  if (products.length === 0) return <EmptyProducts />;

  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function EmptyProducts({
  title = "No products match those filters",
  description = "Try widening your price range or clearing a filter or two.",
  actionHref = "/refurbished/shop",
  actionLabel = "Browse all products",
}: {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-8 py-20 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <PackageSearch className="size-6" strokeWidth={1.6} />
      </span>
      <h2 className="mt-5 text-lg font-medium">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <ButtonLink href={actionHref} variant="outline" className="mt-7">
        {actionLabel}
      </ButtonLink>
    </div>
  );
}
