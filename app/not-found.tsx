import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <Logo />

      <p className="mt-12 text-sm font-medium uppercase tracking-widest text-brand">
        404
      </p>
      <h1 className="mt-3 max-w-lg text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        We couldn&rsquo;t find that page
      </h1>
      <p className="mt-4 max-w-md text-pretty text-muted-foreground">
        The link may be out of date, or the page may have moved.
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/disposal" size="lg">
          IT Asset Disposal
        </ButtonLink>
        <ButtonLink href="/refurbished" variant="outline" size="lg">
          Refurbished Store
        </ButtonLink>
      </div>

      <Link
        href="/?switch=1"
        className="mt-8 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        Back to service selection
      </Link>
    </main>
  );
}
