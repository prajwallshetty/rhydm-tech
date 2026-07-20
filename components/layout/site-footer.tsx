import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { DIVISION_META, COMPANY, type Division } from "@/lib/business";
import { NAV } from "@/lib/navigation";

export function SiteFooter({ division }: { division: Division }) {
  const meta = DIVISION_META[division];
  const other =
    DIVISION_META[division === "disposal" ? "refurbished" : "disposal"];

  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {COMPANY.description}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium">{meta.name}</h3>
          <ul className="mt-4 space-y-2.5">
            {NAV[division].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <a
                href={`mailto:${COMPANY.email}`}
                className="transition-colors hover:text-foreground"
              >
                {COMPANY.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${COMPANY.phone.replace(/[^+\d]/g, "")}`}
                className="transition-colors hover:text-foreground"
              >
                {COMPANY.phone}
              </a>
            </li>
            <li className="pt-1">
              {COMPANY.address.street}
              <br />
              {COMPANY.address.city}, {COMPANY.address.region}{" "}
              {COMPANY.address.postalCode}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {COMPANY.legalName}. All rights
            reserved.
          </p>
          <Link
            href={other.href}
            className="transition-colors hover:text-foreground"
          >
            {meta.crossLinkLabel} &rarr;
          </Link>
        </div>
      </div>
    </footer>
  );
}
