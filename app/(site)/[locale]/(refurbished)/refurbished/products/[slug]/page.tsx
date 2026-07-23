import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Award,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { AddToCart } from "@/components/store/add-to-cart";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductGrid } from "@/components/store/product-grid";
import { RatingStars } from "@/components/store/rating-stars";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Section, SectionHeading } from "@/components/ui/section";
import { FadeIn } from "@/components/motion/fade-in";
import { SITE_URL } from "@/lib/business";
import {
  conditionLabel,
  discountPercent,
  formatPrice,
  stockLabel,
} from "@/lib/format";
import {
  getProductBySlug,
  getProductSlugs,
  getRelatedProducts,
} from "@/lib/repositories/store";

import { getProductWithVariants } from "@/lib/data/variants";
import { VariantConfigurator } from "@/components/store/variant-configurator";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    alternates: { canonical: `/refurbished/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      url: `/refurbished/products/${product.slug}`,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const productWithVariants = await getProductWithVariants(slug);
  const related = await getRelatedProducts(product.categoryId, product.id);

  // Group specs by their `group` label for the specification table.
  const specGroups = product.specs.reduce<Record<string, typeof product.specs>>(
    (groups, spec) => {
      const key = spec.group ?? "General";
      (groups[key] ??= []).push(spec);
      return groups;
    },
    {},
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    sku: product.sku,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand.name }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/refurbished/products/${product.slug}`,
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      itemCondition: "https://schema.org/RefurbishedCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.ratingAvg,
            reviewCount: product.ratingCount,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-6 pt-8">
        <Breadcrumbs
          items={[
            { label: "Store", href: "/refurbished" },
            { label: "Shop", href: "/refurbished/shop" },
            {
              label: product.category.name,
              href: `/refurbished/categories/${product.category.slug}`,
            },
            { label: product.name },
          ]}
        />
      </div>

      {productWithVariants && (
        <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-20 text-center text-slate-400">Loading configurator…</div>}>
          <VariantConfigurator
            product={productWithVariants}
            ratingAvg={product.ratingAvg}
            ratingCount={product.ratingCount}
            brandName={product.brand?.name}
            categoryName={product.category.name}
            categorySlug={product.category.slug}
            specGroups={specGroups}
            conditionNotes={product.conditionNotes}
            description={product.description}
          />
        </Suspense>
      )}

      {/* Condition report */}
      <Section className="border-t border-border/70 bg-muted/30">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Condition report
            </h2>
            <p className="mt-2 text-sm font-medium text-brand">
              {conditionLabel(product.condition)}
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              {product.conditionNotes}
            </p>

            {product.description && (
              <>
                <h3 className="mt-10 text-lg font-medium">About this unit</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </>
            )}

            <h3 className="mt-10 text-lg font-medium">What&rsquo;s included</h3>
            <ul className="mt-3 space-y-2 text-[15px] text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <PackageCheck aria-hidden className="size-4 text-brand" />
                {product.name}
              </li>
              <li className="flex items-center gap-2.5">
                <PackageCheck aria-hidden className="size-4 text-brand" />
                Compatible power adapter
              </li>
              <li className="flex items-center gap-2.5">
                <PackageCheck aria-hidden className="size-4 text-brand" />
                Data sanitisation certificate
              </li>
              <li className="flex items-center gap-2.5">
                <PackageCheck aria-hidden className="size-4 text-brand" />
                {product.warrantyMonths}-month warranty documentation
              </li>
            </ul>
          </div>

          {/* Specifications */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Specifications
            </h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-border/80 bg-card">
              {Object.entries(specGroups).map(([group, specs]) => (
                <div key={group} className="border-b border-border last:border-0">
                  <p className="bg-muted/50 px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {group}
                  </p>
                  <dl>
                    {specs.map((spec) => (
                      <div
                        key={spec.id}
                        className="flex justify-between gap-6 border-b border-border/60 px-5 py-3 text-sm last:border-0"
                      >
                        <dt className="text-muted-foreground">{spec.name}</dt>
                        <dd className="text-right font-medium">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <Section className="border-t border-border/70">
          <SectionHeading
            eyebrow="Reviews"
            title={`${product.ratingAvg.toFixed(1)} out of 5`}
            description={`Based on ${product.ratingCount} verified customer ${
              product.ratingCount === 1 ? "review" : "reviews"
            }.`}
            align="left"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {product.reviews.map((review, i) => (
              <FadeIn key={review.id} onScroll delay={i * 0.04}>
                <article className="h-full rounded-2xl border border-border/80 bg-card p-6">
                  <RatingStars rating={review.rating} showCount={false} />
                  {review.title && (
                    <h3 className="mt-3 font-medium">{review.title}</h3>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                  <footer className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {review.author}
                    </span>
                    {review.verified && (
                      <span className="rounded-full bg-brand-muted px-2 py-0.5 text-brand">
                        Verified purchase
                      </span>
                    )}
                  </footer>
                </article>
              </FadeIn>
            ))}
          </div>
        </Section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <Section className="border-t border-border/70 bg-muted/30">
          <SectionHeading
            eyebrow="Related"
            title={`More in ${product.category.name}`}
            align="left"
          />
          <div className="mt-10">
            <ProductGrid products={related} columns={4} />
          </div>
        </Section>
      )}
    </>
  );
}

function Assurance({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" strokeWidth={1.6} />
      <div>
        <dt className="text-sm font-medium">{title}</dt>
        <dd className="text-xs text-muted-foreground">{detail}</dd>
      </div>
    </div>
  );
}
