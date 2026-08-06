import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";

import { ThemeProvider } from "@/components/theme-provider";
import { BackToTop } from "@/components/layout/back-to-top";
import { JsonLd } from "@/components/seo/json-ld";
import { Analytics } from "@/components/seo/analytics";
import { routing } from "@/i18n/routing";
import { COMPANY, SITE_URL } from "@/lib/business";
import { KEYWORDS_GLOBAL, VERIFICATION } from "@/lib/seo/constants";
import {
  organizationSchema,
  websiteSchema,
  graphSchema,
} from "@/lib/seo/schemas";
import "../../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${COMPANY.name} — Secure IT Asset Disposal & Refurbished Electronics`,
    template: `%s | ${COMPANY.name}`,
  },
  description: COMPANY.description,
  keywords: [...KEYWORDS_GLOBAL],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: COMPANY.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  verification: {
    google: VERIFICATION.google,
    yandex: VERIFICATION.yandex,
    other: {
      ...(VERIFICATION.bing ? { "msvalidate.01": VERIFICATION.bing } : {}),
    },
  },
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  other: {
    "msapplication-TileColor": "#0f172a",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0f12" },
  ],
};

/** Both locales are prerendered — no runtime locale resolution on the page. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function SiteLocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Next 16: params is a Promise.
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering under next-intl.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    // `suppressHydrationWarning` is required by next-themes, which writes the
    // theme class onto <html> before React hydrates.
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect to external origins for faster resource loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* OpenSearch description for browser search-engine integration */}
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          title={COMPANY.name}
          href="/opensearch.xml"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Global structured data: Organization + WebSite */}
        <JsonLd
          data={graphSchema(organizationSchema(), websiteSchema())}
        />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            forcedTheme="light"
            disableTransitionOnChange
          >
            {children}
            <BackToTop />
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
