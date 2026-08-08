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
  localizedDefaults?: Record<string, SectionContent>;
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
  imageUrl: string;
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
  imageUrl: string;
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
      { type: "text", key: "imageUrl", label: "Hero Image URL" },
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
      imageUrl: "/disposalhero.png",
    },
    localizedDefaults: {
      de: {
        eyebrow: "Enterprise ITAD & Datenvernichtung",
        headingMain: "Globale IT-Asset-Disposition.",
        headingAccent: "Vereinfacht.",
        description:
          "Sicherer Abbau, Löschung, Aufarbeitung, Recycling, Bereitstellung und Rückgewinnung von IT-Systemen in über 120 Ländern mit vollständiger Audit-Bereitschaft.",
        primaryLabel: "30-Minuten-Demo buchen",
        primaryHref: "/disposal/contact",
        secondaryLabel: "Ablauf ansehen",
        secondaryHref: "#itad-process",
        badges: [
          { label: "NIST 800-88 Löschung" },
          { label: "Seriennummern-Zertifikate" },
          { label: "120+ Länder" },
        ],
        imageUrl: "/disposalhero.png",
      },
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
      { type: "text", key: "imageUrl", label: "Hero Image URL" },
    ],
    defaults: {
      badge: "",
      headingMain: "Next-Gen Refurbished Tech.",
      headingAccent: "Built for Professionals.",
      description:
        "Professionally tested enterprise laptops & workstations. Complete with 12-month warranty & carbon-neutral delivery.",
      primaryLabel: "Explore Collection",
      primaryHref: "/refurbished/shop",
      secondaryLabel: "View Best Sellers",
      secondaryHref: "/refurbished/shop?sort=best-selling",
      imageUrl: "/hero.png",
    },
    localizedDefaults: {
      de: {
        badge: "",
        headingMain: "Refurbished Tech der nächsten Generation.",
        headingAccent: "Für Profis gebaut.",
        description:
          "Professionell getestete Business-Laptops & Workstations. Komplett mit 12 Monaten Garantie & klimaneutraler Lieferung.",
        primaryLabel: "Kollektion entdecken",
        primaryHref: "/refurbished/shop",
        secondaryLabel: "Bestseller ansehen",
        secondaryHref: "/refurbished/shop?sort=best-selling",
        imageUrl: "/hero.png",
      },
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
  {
    key: "site.legal.privacy",
    division: "DISPOSAL",
    label: "Legal — Privacy Policy",
    renderedOn: "/privacy-policy",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status (PUBLISHED/DRAFT)" },
    ],
    defaults: {
      title: "Privacy Policy",
      seoTitle: "Privacy Policy | Rhydm Tech",
      seoDescription: "Learn how Rhydm Tech collects, processes, and protects your personal data in compliance with GDPR.",
      publishStatus: "PUBLISHED",
      content: `# Privacy Policy

## 1. Data Controller
The responsible data controller for this website under the General Data Protection Regulation (GDPR) is:
Rhydm Tech GmbH
Müllerstraße 12, 13353 Berlin, Germany
Email: privacy@rhydm.tech

## 2. Personal Information Collected
We collect personal information to provide our B2B ITAD services and B2C Refurbished Store sales:
- **Contact Info**: Name, email, phone, company name, shipping/billing address.
- **Order Details**: Purchase history, payment status, asset serial numbers.
- **Technical Data**: IP address, browser type, server log files, and cookies.

## 3. Third-Party Services
We use trusted third-party integrations to operate securely:
- **Analytics & Tracking**: Google Analytics, Google Tag Manager, Microsoft Clarity, Meta Pixel.
- **Media & Hosting**: Cloudinary (image hosting).
- **Payment Processing**: PayPal (compliant checkout).

## 4. Your Rights
Under GDPR, you have the following rights:
- **Right to Access**: Request a copy of your stored personal data.
- **Right to Erasure (Delete)**: Request deletion of your personal account.
- **Right to Rectification**: Correct any inaccurate information.
- **Right to Withdraw Consent**: Revoke cookie or marketing consent anytime.`,
    },
    localizedDefaults: {
      de: {
        title: "Datenschutzerklärung",
        seoTitle: "Datenschutzerklärung | Rhydm Tech",
        seoDescription: "Erfahren Sie, wie Rhydm Tech Ihre personenbezogenen Daten gemäß der DSGVO erhebt, verarbeitet und schützt.",
        publishStatus: "PUBLISHED",
        content: `# Datenschutzerklärung

## 1. Verantwortlicher
Verantwortlicher für die Datenverarbeitung gemäß DSGVO ist:
Rhydm Tech GmbH
Müllerstraße 12, 13353 Berlin, Deutschland
E-Mail: privacy@rhydm.tech

## 2. Erhobene Daten
Wir erheben personenbezogene Daten zur Bereitstellung unserer B2B-ITAD-Dienstleistungen und B2C-Refurbished-Verkäufe:
- **Kontaktdaten**: Name, E-Mail, Telefonnummer, Firmenname, Versand- und Rechnungsadresse.
- **Bestelldetails**: Kaufhistorie, Zahlungsstatus, Seriennummern von Geräten.
- **Technische Daten**: IP-Adresse, Browser-Typ, Server-Logdateien und Cookies.

## 3. Drittanbieter-Dienste
Wir nutzen vertrauenswürdige Drittanbieter-Integrationen:
- **Analysen & Tracking**: Google Analytics, Google Tag Manager, Microsoft Clarity, Meta Pixel.
- **Medien & Hosting**: Cloudinary.
- **Zahlungsabwicklung**: PayPal.

## 4. Ihre Rechte
Nach der DSGVO haben Sie folgende Rechte:
- **Recht auf Auskunft**: Kopie Ihrer gespeicherten Daten anfordern.
- **Recht auf Löschung**: Löschung Ihres Kontos anfordern.
- **Recht auf Berichtigung**: Korrektur unrichtiger Informationen.
- **Recht auf Widerruf**: Einwilligung jederzeit widerrufen.`,
      },
    },
  },
  {
    key: "site.legal.cookies",
    division: "DISPOSAL",
    label: "Legal — Cookie Policy",
    renderedOn: "/cookie-policy",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Cookie Policy",
      seoTitle: "Cookie Policy | Rhydm Tech",
      seoDescription: "Read about the essential, functional, and marketing cookies we use at Rhydm Tech.",
      publishStatus: "PUBLISHED",
      content: `# Cookie Policy

## 1. What Are Cookies
Cookies are small text files placed on your device to optimize site performance, remember login details, and track marketing analytics.

## 2. Cookie Classification
We categorize our cookies into five distinct types:
- **Essential Cookies**: Necessary for fundamental page routing, cart persistence, and secure PayPal payments.
- **Functional Cookies**: Remember user preferences, languages, and settings.
- **Performance Cookies**: Monitor page load speeds, response status codes, and UI rendering diagnostics.
- **Analytics Cookies**: Gather aggregated traffic insights via Google Analytics and Microsoft Clarity.
- **Marketing Cookies**: Enable Meta Pixel retargeting ads and conversion tracking.

## 3. Third-Party Cookie Ownership
Certain components (e.g. PayPal, Cloudinary, Google) set third-party cookies on your browser.

## 4. Managing Preferences
You can modify your consent settings anytime using our GDPR Cookie Banner or by adjusting your browser's cookie blocking preferences.`,
    },
    localizedDefaults: {
      de: {
        title: "Cookie-Richtlinie",
        seoTitle: "Cookie-Richtlinie | Rhydm Tech",
        seoDescription: "Erfahren Sie mehr über die notwendigen, funktionalen und Marketing-Cookies bei Rhydm Tech.",
        publishStatus: "PUBLISHED",
        content: `# Cookie-Richtlinie

## 1. Was sind Cookies
Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, um die Leistung der Website zu optimieren und Marketing-Analysen zu ermöglichen.

## 2. Cookie-Klassen
Wir teilen Cookies in fünf Kategorien ein:
- **Notwendige Cookies**: Erforderlich für die Navigation, den Warenkorb und PayPal-Zahlungen.
- **Funktionale Cookies**: Speichern Präferenzen wie Spracheinstellungen.
- **Performance-Cookies**: Überwachen Ladezeiten und Systemleistung.
- **Analyse-Cookies**: Erfassen Verkehrsdaten über Google Analytics und Microsoft Clarity.
- **Marketing-Cookies**: Ermöglichen Meta Pixel Retargeting.

## 3. Drittanbieter-Cookies
Einige Komponenten (z. B. PayPal, Cloudinary, Google) setzen Cookies von Drittanbietern.

## 4. Verwaltung der Einstellungen
Sie können Ihre Einstellungen jederzeit über unseren Cookie-Banner oder Ihre Browsereinstellungen anpassen.`,
      },
    },
  },
  {
    key: "site.legal.terms",
    division: "DISPOSAL",
    label: "Legal — Terms & Conditions",
    renderedOn: "/terms-and-conditions",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Terms & Conditions",
      seoTitle: "Terms & Conditions | Rhydm Tech",
      seoDescription: "Review the terms governing corporate ITAD services and refurbished hardware sales.",
      publishStatus: "PUBLISHED",
      content: `# Terms & Conditions

## 1. Scope and Company Info
These General Terms and Conditions (AGB) apply to all contracts concluded between Rhydm Tech GmbH and our corporate (B2B) and individual (B2C) clients.
Rhydm Tech GmbH
Müllerstraße 12, 13353 Berlin, Germany
Managing Director: [Placeholder representative]

## 2. Services & Products
- **IT Asset Disposition (ITAD)**: Secure pickup, data sanitisation, drive destruction, and environment-compliant recycling.
- **Refurbished Store**: Professionally tested business laptops, desktops, and network equipment sold with standard warranties.

## 3. Pricing, Taxes & VAT
All store prices are listed in Euros (€) including statutory German VAT. Corporate ITAD quotes exclude VAT until invoicing.

## 4. Payment Terms
Payments are handled securely via PayPal or bank transfer.

## 5. Warranties & Limitation of Liability
Refurbished hardware carries a 12-month quality warranty. Our liability for data breaches during ITAD is limited to gross negligence, provided our standard secure chains of custody are adhered to.

## 6. Applicable Law
Contracts are governed by the laws of the Federal Republic of Germany. For corporate disputes, the place of jurisdiction is Berlin, Germany.`,
    },
    localizedDefaults: {
      de: {
        title: "Allgemeine Geschäftsbedingungen",
        seoTitle: "Allgemeine Geschäftsbedingungen | Rhydm Tech",
        seoDescription: "AGB für B2B-ITAD-Dienstleistungen und B2C-Refurbished-Hardware-Verkäufe.",
        publishStatus: "PUBLISHED",
        content: `# Allgemeine Geschäftsbedingungen

## 1. Geltungsbereich und Firmeninfo
Diese AGB gelten für alle Verträge zwischen der Rhydm Tech GmbH und unseren B2B- und B2C-Kunden.
Rhydm Tech GmbH
Müllerstraße 12, 13353 Berlin, Deutschland
Geschäftsführer: [Platzhalter Vertreter]

## 2. Leistungen & Produkte
- **IT Asset Disposition (ITAD)**: Sichere Abholung, Datenlöschung, Vernichtung und umweltgerechtes Recycling.
- **Refurbished-Shop**: Getestete Laptops, Desktops und Server mit Garantie.

## 3. Preise & Steuern
Alle Shop-Preise verstehen sich in Euro (€) inklusive der gesetzlichen deutschen MwSt. ITAD-Angebote verstehen sich exklusive MwSt.

## 4. Zahlungsbedingungen
Zahlungen erfolgen über PayPal oder Banküberweisung.

## 5. Gewährleistung & Haftung
Refurbished-Hardware wird mit 12 Monaten Garantie geliefert. Unsere Haftung für Datenverluste während des ITAD-Prozesses ist auf grobe Fahrlässigkeit beschränkt.

## 6. Anwendbares Recht
Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand für B2B-Verträge ist Berlin, Deutschland.`,
      },
    },
  },
  {
    key: "site.legal.imprint",
    division: "DISPOSAL",
    label: "Legal — Imprint",
    renderedOn: "/imprint",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Imprint (Impressum)",
      seoTitle: "Imprint | Rhydm Tech",
      seoDescription: "Official legal imprint (Impressum) of Rhydm Tech GmbH under German law.",
      publishStatus: "PUBLISHED",
      content: `# Imprint (Impressum)

## Information according to § 5 TMG (Telemediengesetz)
Rhydm Tech GmbH
Müllerstraße 12
13353 Berlin, Germany

## Represented by (Managing Director)
[Placeholder Director Name]

## Contact Details
Phone: +49 (0) 30 1234 5678
Email: info@rhydm.tech
Website: www.rhydm.tech

## Commercial Register
Register Court: District Court (Amtsgericht) Berlin-Charlottenburg
Registration Number: HRB 99999 B

## VAT Identification Number
VAT ID according to § 27a UStG: DE 123 456 789

## Responsible Person for Editorial Content
According to § 18 Abs. 2 MStV:
[Placeholder Responsible Name]
Müllerstraße 12, 13353 Berlin, Germany`,
    },
    localizedDefaults: {
      de: {
        title: "Impressum",
        seoTitle: "Impressum | Rhydm Tech",
        seoDescription: "Gesetzlich vorgeschriebenes Impressum der Rhydm Tech GmbH gemäß § 5 TMG.",
        publishStatus: "PUBLISHED",
        content: `# Impressum

## Angaben gemäß § 5 TMG
Rhydm Tech GmbH
Müllerstraße 12
13353 Berlin, Deutschland

## Vertreten durch (Geschäftsführer)
[Platzhalter Name Geschäftsführer]

## Kontaktdaten
Telefon: +49 (0) 30 1234 5678
E-Mail: info@rhydm.tech
Website: www.rhydm.tech

## Registereintrag
Registergericht: Amtsgericht Berlin-Charlottenburg
Registernummer: HRB 99999 B

## Umsatzsteuer-Identifikationsnummer
Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE 123 456 789

## Verantwortlich für den journalistisch-redaktionellen Inhalt
Gemäß § 18 Abs. 2 MStV:
[Platzhalter Name Verantwortlicher]
Müllerstraße 12, 13353 Berlin, Deutschland`,
      },
    },
  },
  {
    key: "site.legal.refund",
    division: "DISPOSAL",
    label: "Legal — Refund Policy",
    renderedOn: "/refund-policy",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Refund Policy",
      seoTitle: "Refund Policy | Rhydm Tech",
      seoDescription: "Review the conditions, inspection workflows, and processing timelines for product refunds.",
      publishStatus: "PUBLISHED",
      content: `# Refund Policy

## 1. Refund Eligibility
Refunds apply to certified refurbished devices purchased through the Rhydm Tech Store. Devices must be returned in their original packaging with all sent accessories.

## 2. Inspection Phase
Upon receipt, every device undergoes technical inspection. We check matching serial numbers, component configurations, and physical conditions.

## 3. Non-Refundable Items
- Custom configured hardware variants.
- Software licenses or warranty extensions already registered.
- Devices damaged by user drop, liquid impact, or custom hardware modifications.

## 4. Refund Methods and Timelines
Refunds are processed back to the original payment method (typically PayPal or bank transfer) within 7 business days of successful quality control inspection.`,
    },
    localizedDefaults: {
      de: {
        title: "Rückerstattungsrichtlinie",
        seoTitle: "Rückerstattungsrichtlinie | Rhydm Tech",
        seoDescription: "Bedingungen und Fristen für Rückerstattungen von refurbished Hardware.",
        publishStatus: "PUBLISHED",
        content: `# Rückerstattungsrichtlinie

## 1. Anspruch auf Rückerstattung
Rückerstattungen gelten für refurbished Geräte, die über den Rhydm Tech Store erworben wurden. Geräte müssen in Originalverpackung mit Zubehör zurückgesendet werden.

## 2. Inspektionsphase
Nach Erhalt durchläuft jedes Gerät eine technische Prüfung. Wir überprüfen Seriennummern, Konfigurationen und den Zustand.

## 3. Ausgeschlossene Produkte
- Kundenspezifische Hardware-Konfigurationen.
- Bereits registrierte Softwarelizenzen oder Garantieerweiterungen.
- Geräte mit Wasserschaden oder Gehäusebeschädigungen durch den Benutzer.

## 4. Erstattungsverfahren & Fristen
Rückerstattungen werden innerhalb von 7 Werktagen nach erfolgreicher Qualitätsprüfung auf das ursprüngliche Zahlungsmittel (PayPal oder Banküberweisung) verbucht.`,
      },
    },
  },
  {
    key: "site.legal.return",
    division: "DISPOSAL",
    label: "Legal — Return Policy",
    renderedOn: "/return-policy",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Return Policy",
      seoTitle: "Return Policy | Rhydm Tech",
      seoDescription: "Instructions and returns windows for refurbished products.",
      publishStatus: "PUBLISHED",
      content: `# Return Policy

## 1. Return Window
Individual B2C consumers have a standard 30-day window to return refurbished electronics for any reason (matching our return satisfaction guarantee).

## 2. Returning Requirements
- Devices must be restored to factory settings.
- Remove all personal accounts (e.g. Google Accounts, Apple IDs, BitLocker locks).
- Pack securely inside sturdy cardboard boxes to prevent transit damages.

## 3. Shipping Costs
B2C return shipping for defective devices is free (pre-paid return labels provided). For change-of-mind returns, the buyer handles shipping costs.

## 4. Return Address
Rhydm Tech Returns Center
Müllerstraße 12, 13353 Berlin, Germany`,
    },
    localizedDefaults: {
      de: {
        title: "Rückgaberichtlinie",
        seoTitle: "Rückgaberichtlinie | Rhydm Tech",
        seoDescription: "Rückgabefristen und Anweisungen für refurbished Hardware.",
        publishStatus: "PUBLISHED",
        content: `# Rückgaberichtlinie

## 1. Rückgabefrist
B2C-Verbraucher haben ein 30-tägiges Rückgaberecht für refurbished Elektronik ohne Angabe von Gründen.

## 2. Voraussetzungen für die Rückgabe
- Geräte müssen auf Werkseinstellungen zurückgesetzt sein.
- Alle persönlichen Konten (z. B. Google, Apple ID) und Sperren müssen entfernt werden.
- Sichere Verpackung gegen Transportschäden.

## 3. Rücksendekosten
Kosten für defekte Rücksendungen tragen wir. Bei einfachem Nichtgefallen trägt der Käufer die Versandkosten.

## 4. Rücksendeadresse
Rhydm Tech Returns Center
Müllerstraße 12, 13353 Berlin, Deutschland`,
      },
    },
  },
  {
    key: "site.legal.shipping",
    division: "DISPOSAL",
    label: "Legal — Shipping Policy",
    renderedOn: "/shipping-policy",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Shipping Policy",
      seoTitle: "Shipping Policy | Rhydm Tech",
      seoDescription: "Shipping times, tracking, insurance, and international shipping for refurbished products.",
      publishStatus: "PUBLISHED",
      content: `# Shipping Policy

## 1. Shipping Destinations
We ship refurbished devices to customers across Germany and the European Union (EU).

## 2. Order Processing Times
Orders are processed within 1-2 business days. If custom variant modifications are requested, processing may take up to 3 business days.

## 3. Shipping Options & Delivery Times
- **Standard Shipping**: 2-4 business days (DHL/DPD). Free for orders above the threshold.
- **Express Shipping**: 1-2 business days (UPS/DHL Express). Express surcharge applies.

## 4. Tracking and Shipping Insurance
All packages are fully insured against loss or damage in transit. You will receive a tracking link via email as soon as the shipping label is created.`,
    },
    localizedDefaults: {
      de: {
        title: "Versandrichtlinie",
        seoTitle: "Versandrichtlinie | Rhydm Tech",
        seoDescription: "Versandzeiten, Versicherung und Tracking für refurbished Hardware.",
        publishStatus: "PUBLISHED",
        content: `# Versandrichtlinie

## 1. Versandziele
Wir versenden refurbished Geräte an Kunden in Deutschland und der Europäischen Union (EU).

## 2. Bearbeitungszeit
Bestellungen werden innerhalb von 1-2 Werktagen bearbeitet. Bei kundenspezifischen Upgrades bis zu 3 Werktage.

## 3. Versandoptionen & Lieferzeiten
- **Standardversand**: 2-4 Werktage (DHL/DPD). Kostenfrei ab Mindestbestellwert.
- **Expressversand**: 1-2 Werktage (UPS/DHL Express). Aufpreis erforderlich.

## 4. Sendungsverfolgung und Versicherung
Alle Sendungen sind gegen Verlust oder Beschädigung versichert. Sie erhalten nach dem Versand eine Sendungsverfolgung per E-Mail.`,
      },
    },
  },
  {
    key: "site.legal.withdrawal",
    division: "DISPOSAL",
    label: "Legal — Withdrawal Policy",
    renderedOn: "/withdrawal-policy",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Withdrawal Policy (Widerrufsbelehrung)",
      seoTitle: "Withdrawal Policy | Rhydm Tech",
      seoDescription: "Understand your EU consumer right of withdrawal (Widerrufsrecht) within 14 days.",
      publishStatus: "PUBLISHED",
      content: `# Withdrawal Policy (Widerrufsbelehrung)

## 1. Right of Withdrawal
You have the right to withdraw from this contract within 14 days without giving any reason.
The withdrawal period is 14 days from the day on which you or a third party named by you, who is not the carrier, has taken possession of the goods.

To exercise your right of withdrawal, you must inform us of your decision:
Rhydm Tech GmbH
Müllerstraße 12, 13353 Berlin, Germany
Email: support@rhydm.tech
Phone: +49 (0) 30 1234 5678

## 2. Consequences of Withdrawal
If you withdraw from this contract, we will refund all payments received from you, including delivery costs (except for additional costs resulting from choosing a non-standard delivery option), within 14 days from the day we receive your withdrawal notice. We may withhold the refund until we receive the goods back.

## 3. Model Withdrawal Form
(If you wish to withdraw from the contract, please fill out this form and return it to us)
- To: Rhydm Tech GmbH, Müllerstraße 12, 13353 Berlin, Germany (support@rhydm.tech)
- I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*):
- Ordered on (*)/received on (*):
- Name of consumer(s):
- Address of consumer(s):
- Signature of consumer(s) (only if notified on paper):
- Date:`,
    },
    localizedDefaults: {
      de: {
        title: "Widerrufsbelehrung",
        seoTitle: "Widerrufsbelehrung | Rhydm Tech",
        seoDescription: "Informationen zum gesetzlichen Widerrufsrecht für Verbraucher in der EU.",
        publishStatus: "PUBLISHED",
        content: `# Widerrufsbelehrung

## 1. Widerrufsrecht
Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben.

Um Ihr Widerrufsrecht auszuüben, müssen Sie uns informieren:
Rhydm Tech GmbH
Müllerstraße 12, 13353 Berlin, Deutschland
E-Mail: support@rhydm.tech
Telefon: +49 (0) 30 1234 5678

## 2. Folgen des Widerrufs
Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.

## 3. Muster-Widerrufsformular
(Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück)
- An: Rhydm Tech GmbH, Müllerstraße 12, 13353 Berlin, Deutschland (support@rhydm.tech)
- Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*):
- Bestellt am (*)/erhalten am (*):
- Name des/der Verbraucher(s):
- Anschrift des/der Verbraucher(s):
- Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):
- Datum:`,
      },
    },
  },
  {
    key: "site.legal.payment",
    division: "DISPOSAL",
    label: "Legal — Payment Policy",
    renderedOn: "/payment-policy",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Payment Policy",
      seoTitle: "Payment Policy | Rhydm Tech",
      seoDescription: "Available payment methods, payment security, currencies, and invoicing.",
      publishStatus: "PUBLISHED",
      content: `# Payment Policy

## 1. Supported Payment Methods
We support secure online payments to make transactions fast:
- **PayPal**: Connect bank accounts, credit cards, or use your PayPal balance.
- **SEPA Bank Transfer**: Required for invoice-based B2B ITAD billing.

## 2. Currency
All transactions are processed in Euros (€).

## 3. Payment Security
We do not store credit card credentials or payment tokens on our servers. PayPal handles all checkout authentication.

## 4. Invoices and VAT
Every order receives a PDF invoice with the statutory German VAT split listed clearly.`,
    },
    localizedDefaults: {
      de: {
        title: "Zahlungsrichtlinie",
        seoTitle: "Zahlungsrichtlinie | Rhydm Tech",
        seoDescription: "Akzeptierte Zahlungsmethoden, Sicherheit und Rechnungsstellung.",
        publishStatus: "PUBLISHED",
        content: `# Zahlungsrichtlinie

## 1. Unterstützte Zahlungsmethoden
Wir unterstützen folgende Zahlungsmethoden:
- **PayPal**: Über Ihr PayPal-Konto oder Kreditkarte.
- **SEPA-Banküberweisung**: Erforderlich für B2B-ITAD-Rechnungen.

## 2. Währung
Alle Rechnungen werden in Euro (€) ausgestellt und abgewickelt.

## 3. Zahlungssicherheit
Wir speichern keine Kreditkartendaten auf unseren Servern. Die Abrechnung erfolgt über verschlüsselte PayPal-Verbindungen.

## 4. Rechnungsstellung und MwSt
Jede Bestellung erhält eine PDF-Rechnung mit ausgewiesener gesetzlicher deutscher Umsatzsteuer.`,
      },
    },
  },
  {
    key: "site.legal.datadeletion",
    division: "DISPOSAL",
    label: "Legal — Data Deletion Policy",
    renderedOn: "/data-deletion-policy",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Data Deletion Policy",
      seoTitle: "Data Deletion Policy | Rhydm Tech",
      seoDescription: "Learn how to request the deletion of your personal account data.",
      publishStatus: "PUBLISHED",
      content: `# Data Deletion Policy

## 1. Deletion Requests
Under GDPR Article 17, you have the right to request the deletion of your personal data.
To trigger deletion, email us at: **privacy@rhydm.tech** with the subject line "Data Deletion Request".

## 2. Processing Timeline
We verify identity and process account deletion requests within 30 days.

## 3. Backups & Archival Data
Once deleted, your active database record is purged. Backup copies are overwritten within 60 days.

## 4. Legal Retention Overrides
Certain data (such as invoice records and VAT taxation data) must be retained for 10 years under German commercial law (§ 257 HGB).`,
    },
    localizedDefaults: {
      de: {
        title: "Datenlöschungsrichtlinie",
        seoTitle: "Datenlöschungsrichtlinie | Rhydm Tech",
        seoDescription: "Anweisungen zur Beantragung der Löschung Ihrer persönlichen Benutzerdaten.",
        publishStatus: "PUBLISHED",
        content: `# Datenlöschungsrichtlinie

## 1. Löschungsanträge
Gemäß Art. 17 DSGVO haben Sie das Recht auf Löschung Ihrer Daten.
Senden Sie uns hierfür eine E-Mail an: **privacy@rhydm.tech** mit dem Betreff "Löschungsantrag".

## 2. Bearbeitungszeit
Nach Verifizierung Ihrer Identität löschen wir Ihre Daten innerhalb von 30 Tagen.

## 3. Backups & Archivdaten
Löschungen im Hauptsystem erfolgen sofort. Sicherheitskopien (Backups) werden nach 60 Tagen überschrieben.

## 4. Gesetzliche Aufbewahrungsfristen
Bestimmte Daten (z. B. Rechnungen) müssen gem. § 257 HGB 10 Jahre aufbewahrt werden.`,
      },
    },
  },
  {
    key: "site.legal.security",
    division: "DISPOSAL",
    label: "Legal — Security Policy",
    renderedOn: "/security-policy",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Security Policy",
      seoTitle: "Security Policy | Rhydm Tech",
      seoDescription: "Review the encryption, access controls, and data sanitization compliance at Rhydm Tech.",
      publishStatus: "PUBLISHED",
      content: `# Security Policy

## 1. Encryption standards
All site traffic is encrypted using Secure Sockets Layer (SSL/HTTPS). Client passwords are encrypted using bcrypt hashing.

## 2. Physical Facility Security
Our ITAD processing facility features CCTV monitoring, badge access controls, and secure sorting cages.

## 3. Data Sanitisation Protocols
Devices are sanitized following NIST SP 800-88 R1 Guidelines for Media Sanitization (Clear & Purge protocols).

## 4. Software Security
We use third-party packages with automatic vulnerability patching to prevent cross-site scripting (XSS) and SQL injection.`,
    },
    localizedDefaults: {
      de: {
        title: "Sicherheitsrichtlinie",
        seoTitle: "Sicherheitsrichtlinie | Rhydm Tech",
        seoDescription: "Verschlüsselung, physische Sicherheit und Datenschutzstandards bei Rhydm Tech.",
        publishStatus: "PUBLISHED",
        content: `# Sicherheitsrichtlinie

## 1. Verschlüsselungsstandards
Der gesamte Datenverkehr ist über SSL/HTTPS gesichert. Kennwörter werden mittels bcrypt verschlüsselt.

## 2. Physische Objektsicherheit
Unser ITAD-Verarbeitungscenter ist videoüberwacht, zutrittsgeschützt und verfügt über gesicherte Lagerbereiche.

## 3. Datensicherheits-Protokolle
Datenlöschungen erfolgen nach Richtlinien der NIST SP 800-88 R1 (Medien-Sanitisation).

## 4. Softwareschutz
Automatische Sicherheits-Updates schützen unsere Datenbanken vor XSS- und SQL-Injection-Angriffen.`,
      },
    },
  },
  {
    key: "site.legal.accessibility",
    division: "DISPOSAL",
    label: "Legal — Accessibility",
    renderedOn: "/accessibility",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Accessibility",
      seoTitle: "Accessibility Statement | Rhydm Tech",
      seoDescription: "Rhydm Tech's commitment to digital accessibility and WCAG 2.1 compliance.",
      publishStatus: "PUBLISHED",
      content: `# Accessibility Statement

## 1. Commitment
Rhydm Tech is committed to ensuring digital accessibility for individuals with disabilities. We continuously audit our UI styling to align with WCAG 2.1 Level AA requirements.

## 2. Implemented Accessibility Features
- **Aria Labels**: All buttons, links, and forms include explicit labels for screen readers.
- **Keyboard Navigation**: The site can be navigated entirely using standard keyboard focus states.
- **Contrast Ratios**: Body text meets the minimum required contrast ratios against light and dark background panels.

## 3. Contact Support
If you encounter accessibility issues, contact us at: **accessibility@rhydm.tech**.`,
    },
    localizedDefaults: {
      de: {
        title: "Barrierefreiheit",
        seoTitle: "Erklärung zur Barrierefreiheit | Rhydm Tech",
        seoDescription: "Unser Engagement für Barrierefreiheit und die Einhaltung der WCAG 2.1 Richtlinien.",
        publishStatus: "PUBLISHED",
        content: `# Erklärung zur Barrierefreiheit

## 1. Verpflichtung
Rhydm Tech setzt sich für die digitale Barrierefreiheit ein. Wir prüfen unsere Benutzeroberflächen stetig nach WCAG 2.1 Level AA Standards.

## 2. Unterstützte Funktionen
- **ARIA-Labels**: Screenreader-kompatible Beschriftungen für alle interaktiven Elemente.
- **Tastaturnavigation**: Vollständig steuerbar mittels Tabulatortaste.
- **Kontrastverhältnisse**: Kontrastoptimierte Textfarben auf hellen und dunklen Hintergründen.

## 3. Feedback & Kontakt
Melden Sie Barrieren gern an uns unter: **accessibility@rhydm.tech**.`,
      },
    },
  },
  {
    key: "site.legal.sustainability",
    division: "DISPOSAL",
    label: "Legal — Sustainability",
    renderedOn: "/sustainability",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Sustainability",
      seoTitle: "Sustainability Commitment | Rhydm Tech",
      seoDescription: "Explore our Circular IT solutions, carbon reduction initiatives, and responsible recycling.",
      publishStatus: "PUBLISHED",
      content: `# Sustainability Commitment

## 1. Circular IT Strategy
We reduce e-waste by cleaning, refurbishing, and extending the life of enterprise-grade hardware. Over 90% of assets processed are prepared for reuse.

## 2. Eco-Friendly Recycling
Hardware that cannot be refurbished is securely disassembled. Precious metals and components are sorted and recycled following strict European environmental directives.

## 3. Carbon Neutral Shipments
All store standard deliveries are handled by carbon-offset shipping partners (such as DHL GoGreen), reducing overall logistic emissions.

## 4. ESG Audits
We supply corporate B2B clients with environmental offset certificates detailing carbon offsets achieved through their ITAD asset recovery program.`,
    },
    localizedDefaults: {
      de: {
        title: "Nachhaltigkeit",
        seoTitle: "Nachhaltigkeitserklärung | Rhydm Tech",
        seoDescription: "Circular IT, E-Waste-Reduzierung und unser Engagement für CO2-neutrale Logistik.",
        publishStatus: "PUBLISHED",
        content: `# Nachhaltigkeitserklärung

## 1. Circular-IT-Strategie
Wir reduzieren Elektroschrott (E-Waste), indem wir gebrauchte Business-Hardware aufbereiten. Über 90 % der eingegangenen Geräte bereiten wir für die Wiederverwendung vor.

## 2. Umweltgerechtes Recycling
Defekte Hardware wird fachgerecht zerlegt. Wertstoffe und Metalle werden sortenrein nach europäischen Richtlinien recycelt.

## 3. CO2-neutraler Versand
Standard-Shopbestellungen versenden wir über klimaneutrale Programme (z. B. DHL GoGreen), um Transportemissionen zu senken.

## 4. ESG-Berichterstattung
Für B2B-Kunden erstellen wir Umweltzertifikate über die durch die Geräteaufbereitung eingesparten CO2-Emissionen.`,
      },
    },
  },
  {
    key: "site.legal.compliance",
    division: "DISPOSAL",
    label: "Legal — Compliance & Standards",
    renderedOn: "/compliance",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "Compliance & Standards",
      seoTitle: "Compliance & Standards | Rhydm Tech",
      seoDescription: "Overview of ITAD compliance alignments including GDPR, NIST 800-88, and WEEE.",
      publishStatus: "PUBLISHED",
      content: `# Compliance & Standards

## 1. GDPR Aligned Data Erasure
Data erasure workflows are strictly compliant with the European General Data Protection Regulation (GDPR) to prevent corporate data leakage.

## 2. Sanitization Standards
Our drive wiping processes align with **NIST SP 800-88 R1 (Guidelines for Media Sanitization)**. We verify erasure and generate serial-level audit records.

## 3. WEEE Directive Compliance
As an ITAD provider in Germany, our recycling processes conform to the **WEEE Directive (Waste Electrical and Electronic Equipment)**.

## 4. Corporate Certifications
We maintain full audit-ready logs, allowing B2B customers to hand compliance reports directly to legal auditors and regulators.`,
    },
    localizedDefaults: {
      de: {
        title: "Compliance & Standards",
        seoTitle: "Compliance & Standards | Rhydm Tech",
        seoDescription: "Übersicht über ITAD-Compliance-Standards wie DSGVO, NIST 800-88 und ElektroG (WEEE).",
        publishStatus: "PUBLISHED",
        content: `# Compliance & Standards

## 1. DSGVO-konforme Datenlöschung
Unsere Datenlöschprozesse entsprechen den Vorgaben der Datenschutz-Grundverordnung (DSGVO), um Datenlecks bei Unternehmen zu verhindern.

## 2. Löschstandards
Datenlöschungen erfolgen nach **NIST SP 800-88 R1**-Standards und werden lückenlos mit Seriennummern dokumentiert.

## 3. ElektroG / WEEE-Konformität
Unsere Recycling- und IT-Entsorgungsprozesse entsprechen den gesetzlichen Anforderungen der WEEE-Richtlinie (Elektrogesetz).

## 4. Audit-Berichte
Wir stellen B2B-Kunden revisionssichere Berichte bereit, die direkt für Compliance-Prüfungen eingereicht werden können.`,
      },
    },
  },
  {
    key: "site.legal.about",
    division: "DISPOSAL",
    label: "Legal — About Us",
    renderedOn: "/about",
    fields: [
      { type: "text", key: "title", label: "Page Title" },
      { type: "textarea", key: "content", label: "Markdown Content" },
      { type: "text", key: "seoTitle", label: "SEO Title" },
      { type: "text", key: "seoDescription", label: "SEO Description" },
      { type: "text", key: "publishStatus", label: "Publish Status" },
    ],
    defaults: {
      title: "About Rhydm Tech",
      seoTitle: "About Rhydm Tech | Circular IT Solutions",
      seoDescription: "Learn about Rhydm Tech, a Berlin-based technology company specializing in circular IT, ITAD, and refurbished business electronics.",
      publishStatus: "PUBLISHED",
      content: `# About Rhydm Tech

Rhydm Tech is a technology company based in Berlin, Germany, focused on circular IT. The company provides IT asset disposal, secure data destruction, responsible electronics recycling, and refurbished technology solutions.

## Our Mission
We enable enterprises to securely retire their IT assets, verify data destruction, and extend the lifecycle of technology equipment, contributing to a sustainable and circular economy.

## The Brand Name
The name "Rhydm" is a proprietary brand name of Rhydm Tech. It represents our commitment to secondary life cycles for hardware and enterprise IT assets.

## What We Do
* **IT Asset Disposition (ITAD)**: Secure lifecycle management for enterprise IT estates.
* **Data Destruction**: Verified, audit-ready data erasure conforming to standards such as NIST 800-88.
* **Refurbished Technology**: Testing, restoring, and warranting business-grade hardware.
* **Sustainability**: Helping companies achieve zero-landfill ESG recycling goals.`,
    },
    localizedDefaults: {
      de: {
        title: "Über Rhydm Tech",
        seoTitle: "Über Rhydm Tech | Zirkuläre IT-Lösungen",
        seoDescription: "Erfahren Sie mehr über Rhydm Tech, ein Berliner Technologieunternehmen, das auf zirkuläre IT, ITAD und aufbereitete Business-Elektronik spezialisiert ist.",
        publishStatus: "PUBLISHED",
        content: `# Über Rhydm Tech

Rhydm Tech ist ein in Berlin ansässiges Technologieunternehmen, das sich auf zirkuläre IT spezialisiert hat. Das Unternehmen bietet Lösungen für die Entsorgung von IT-Assets, sichere Datenvernichtung, verantwortungsvolles Elektronik-Recycling und hochwertige generalüberholte IT-Geräte.

## Unsere Mission
Wir ermöglichen es Unternehmen, ihre IT-Assets sicher stillzulegen, die Datenlöschung zu zertifizieren und den Lebenszyklus von Technologiegeräten zu verlängern, um einen Beitrag zu einer nachhaltigen Kreislaufwirtschaft zu leisten.

## Der Markenname
Der Name „Rhydm“ ist ein geschützter Markenname der Rhydm Tech. Er repräsentiert unser Engagement für den zweiten Lebenszyklus von Hardware und IT-Infrastruktur.

## Unsere Leistungen
* **IT-Asset-Disposition (ITAD)**: Sicheres Lebenszyklus-Management für die IT von Unternehmen.
* **Datenvernichtung**: Zertifizierte, auditierbare Datenlöschung gemäß Standards wie NIST 800-88.
* **Refurbished IT-Geräte**: Professionelle Aufbereitung und Garantieabdeckung für Business-Hardware.
* **Nachhaltigkeit**: Unterstützung von Unternehmen beim Erreichen von Zero-Landfill- und ESG-Recyclingzielen.`,
      },
    },
  },
];

export function getSectionDef(key: string): SectionDef | undefined {
  return SECTION_DEFS.find((def) => def.key === key);
}
