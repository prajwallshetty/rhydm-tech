/**
 * Site-content section registry — the single source of truth for which page
 * sections are CMS-editable, what fields each one has, and their default
 * content.
 *
 * Design rules:
 * - This module is imported by BOTH server code (pages, actions) and the
 *   client admin form, so it must stay free of Prisma and `server-only`.
 * - Defaults are the exact copy that was previously hardcoded in the
 *   components, so a fresh database renders the site identically — the CMS
 *   only ever *overrides*.
 * - Content is stored in the existing PageSection table (key → JSON), keyed
 *   with a `section.` / `site.` prefix so it can never collide with the
 *   legacy `disposal.hero` / `disposal.feature.*` rows.
 * - Fields are flat scalars or lists of flat objects. That constraint is what
 *   lets one generic admin form edit every section.
 */

export type ScalarFieldDef = {
  type: "text" | "textarea";
  key: string;
  label: string;
};

export type ListItemFieldDef = {
  type: "text" | "textarea";
  key: string;
  label: string;
};

export type ListFieldDef = {
  type: "list";
  key: string;
  label: string;
  /** Label for one entry, e.g. "logo" → "Add logo". */
  itemNoun: string;
  itemFields: ListItemFieldDef[];
};

export type FieldDef = ScalarFieldDef | ListFieldDef;

export type SectionDef = {
  /** PageSection.key */
  key: string;
  division: "DISPOSAL" | "REFURBISHED";
  /** Admin display name. */
  label: string;
  /** Where it renders — shown as a hint in the admin. */
  renderedOn: string;
  fields: FieldDef[];
  defaults: SectionContent;
};

export type SectionContent = Record<
  string,
  string | Array<Record<string, string>>
>;

/* -------------------------------------------------------------------------- */
/* Typed content shapes (what the components consume)                         */
/* -------------------------------------------------------------------------- */

export interface DisposalHeroContent extends SectionContent {
  eyebrow: string;
  headingMain: string;
  headingAccent: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  badges: Array<{ label: string }>;
}

export interface DisposalMarqueeContent extends SectionContent {
  title: string;
  logos: Array<{ name: string }>;
}

export interface DisposalWhyContent extends SectionContent {
  heading: string;
  cards: Array<{ icon: string; stat: string; badge: string; body: string }>;
}

export interface DisposalComparisonContent extends SectionContent {
  eyebrow: string;
  heading: string;
  withoutLabel: string;
  withLabel: string;
  withoutItems: Array<{ text: string }>;
  withItems: Array<{ text: string }>;
}

export interface DisposalFinalCtaContent extends SectionContent {
  eyebrow: string;
  heading: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  trustItems: Array<{ text: string }>;
}

export interface StoreHeroContent extends SectionContent {
  badge: string;
  headingMain: string;
  headingAccent: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface SiteSettingsContent extends SectionContent {
  socials: Array<{ label: string; url: string }>;
}

/* -------------------------------------------------------------------------- */
/* Registry                                                                   */
/* -------------------------------------------------------------------------- */

const ctaFields: FieldDef[] = [
  { type: "text", key: "primaryLabel", label: "Primary button label" },
  { type: "text", key: "primaryHref", label: "Primary button link" },
  { type: "text", key: "secondaryLabel", label: "Secondary button label" },
  { type: "text", key: "secondaryHref", label: "Secondary button link" },
];

export const SECTION_DEFS: SectionDef[] = [
  {
    key: "section.disposal.hero",
    division: "DISPOSAL",
    label: "Hero",
    renderedOn: "/disposal",
    fields: [
      { type: "text", key: "eyebrow", label: "Eyebrow" },
      { type: "text", key: "headingMain", label: "Heading" },
      { type: "text", key: "headingAccent", label: "Heading (green part)" },
      { type: "textarea", key: "description", label: "Description" },
      ...ctaFields,
      {
        type: "list",
        key: "badges",
        label: "Trust badges",
        itemNoun: "badge",
        itemFields: [{ type: "text", key: "label", label: "Label" }],
      },
    ],
    defaults: {
      eyebrow: "Enterprise ITAD & Data Destruction",
      headingMain: "Global IT Asset Disposition.",
      headingAccent: "Simplified.",
      description:
        "Securely retire, wipe, refurbish, recycle, redeploy, and recover maximum residual value from your enterprise IT assets across 120+ countries with full audit readiness.",
      primaryLabel: "Book a 30-Min Demo",
      primaryHref: "/disposal/contact",
      secondaryLabel: "See How It Works",
      secondaryHref: "#itad-process",
      badges: [
        { label: "NIST 800-88 Wiping" },
        { label: "Serial-Level Certificates" },
        { label: "120+ Countries" },
      ],
    },
  },
  {
    key: "section.disposal.why",
    division: "DISPOSAL",
    label: "Why / stat cards",
    renderedOn: "/disposal",
    fields: [
      { type: "text", key: "heading", label: "Heading" },
      {
        type: "list",
        key: "cards",
        label: "Stat cards",
        itemNoun: "card",
        itemFields: [
          { type: "text", key: "icon", label: "Icon (trending / clock / globe / shield / recycle)" },
          { type: "text", key: "stat", label: "Big stat" },
          { type: "text", key: "badge", label: "Badge" },
          { type: "textarea", key: "body", label: "Body" },
        ],
      },
    ],
    defaults: {
      heading: "Trusted by global IT teams to manage 120,000+ devices.",
      cards: [
        {
          icon: "trending",
          stat: "45%",
          badge: "RECOVERY RATE",
          body: "Of original equipment value recovered through certified global resale channels.",
        },
        {
          icon: "clock",
          stat: "80,000+",
          badge: "IT EFFICIENCY",
          body: "Hours saved for enterprise IT managers in automated compliance intake.",
        },
        {
          icon: "globe",
          stat: "120",
          badge: "GLOBAL LOGISTICS",
          body: "Countries covered with unified global logistics and certified data destruction.",
        },
      ],
    },
  },
  {
    key: "section.disposal.comparison",
    division: "DISPOSAL",
    label: "Comparison (old way vs audited way)",
    renderedOn: "/disposal",
    fields: [
      { type: "text", key: "eyebrow", label: "Eyebrow" },
      { type: "text", key: "heading", label: "Heading" },
      { type: "text", key: "withoutLabel", label: "Left column label" },
      { type: "text", key: "withLabel", label: "Right column label" },
      {
        type: "list",
        key: "withoutItems",
        label: "Left column items (without)",
        itemNoun: "item",
        itemFields: [{ type: "text", key: "text", label: "Text" }],
      },
      {
        type: "list",
        key: "withItems",
        label: "Right column items (with)",
        itemNoun: "item",
        itemFields: [{ type: "text", key: "text", label: "Text" }],
      },
    ],
    defaults: {
      eyebrow: "THE DIFFERENCE",
      heading: "Retire Assets the Old Way, or the Audited Way",
      withoutLabel: "Without Modern ITAD",
      withLabel: "With Rhydm Enterprise ITAD",
      withoutItems: [
        { text: "Manual spreadsheets & slow emails" },
        { text: "Multiple unverified regional vendors" },
        { text: "Incomplete or missing audit trails" },
        { text: "No asset resale — 100% written off" },
        { text: "Compliance liability at handoffs" },
        { text: "Risks of data breach on retired drives" },
      ],
      withItems: [
        { text: "Single centralized enterprise platform" },
        { text: "Automated NIST 800-88 sanitization" },
        { text: "Audit-ready serial level certificates" },
        { text: "Maximized revenue share value recovery" },
        { text: "120+ countries full compliance coverage" },
        { text: "Zero-landfill ESG verified recycling" },
      ],
    },
  },
  {
    key: "section.disposal.finalCta",
    division: "DISPOSAL",
    label: "Final CTA",
    renderedOn: "/disposal",
    fields: [
      { type: "text", key: "eyebrow", label: "Eyebrow" },
      { type: "text", key: "heading", label: "Heading" },
      { type: "textarea", key: "description", label: "Description" },
      ...ctaFields,
      {
        type: "list",
        key: "trustItems",
        label: "Trust line items",
        itemNoun: "item",
        itemFields: [{ type: "text", key: "text", label: "Text" }],
      },
    ],
    defaults: {
      eyebrow: "IMMERSIVE SPOTLIGHT",
      heading: "End Every IT Asset’s Lifecycle Securely.",
      description:
        "Protect sensitive data, stay compliant, recover maximum value, and simplify global IT asset disposition from one centralized platform.",
      primaryLabel: "Book Demo",
      primaryHref: "/disposal/contact",
      secondaryLabel: "Talk to an Expert",
      secondaryHref: "/disposal/contact",
      trustItems: [
        { text: "Serial-level certificates" },
        { text: "48-hour pickup" },
        { text: "120+ countries" },
      ],
    },
  },
  {
    key: "section.refurbished.hero",
    division: "REFURBISHED",
    label: "Hero",
    renderedOn: "/refurbished",
    fields: [
      { type: "text", key: "badge", label: "Badge" },
      { type: "text", key: "headingMain", label: "Heading" },
      { type: "text", key: "headingAccent", label: "Heading (green part)" },
      { type: "textarea", key: "description", label: "Description" },
      ...ctaFields,
    ],
    defaults: {
      badge: "ENTERPRISE CERTIFIED REFURBISHED",
      headingMain: "Next-Gen Refurbished Tech.",
      headingAccent: "Built for Professionals.",
      description:
        "Professionally tested enterprise laptops & workstations. Complete with 12-month warranty & carbon-neutral delivery.",
      primaryLabel: "Explore Collection",
      primaryHref: "/refurbished/shop",
      secondaryLabel: "View Best Sellers",
      secondaryHref: "/refurbished/shop?sort=best-selling",
    },
  },
  {
    key: "site.settings",
    division: "DISPOSAL",
    label: "Footer — social links",
    renderedOn: "Footer on every page",
    fields: [
      {
        type: "list",
        key: "socials",
        label: "Social links",
        itemNoun: "link",
        itemFields: [
          { type: "text", key: "label", label: "Label" },
          { type: "text", key: "url", label: "URL" },
        ],
      },
    ],
    defaults: {
      socials: [
        { label: "LinkedIn", url: "https://linkedin.com" },
        { label: "Twitter / X", url: "https://twitter.com" },
        { label: "Facebook", url: "https://facebook.com" },
        { label: "Instagram", url: "https://instagram.com" },
        { label: "YouTube", url: "https://youtube.com" },
      ],
    },
  },
];

export function getSectionDef(key: string): SectionDef | undefined {
  return SECTION_DEFS.find((def) => def.key === key);
}
