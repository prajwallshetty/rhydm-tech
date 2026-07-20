import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { FadeIn } from "@/components/motion/fade-in";

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-brand-muted/50 to-transparent"
      />
      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <FadeIn>
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          {eyebrow && (
            <p className="mt-6 text-sm font-medium uppercase tracking-widest text-brand">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
              {description}
            </p>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
