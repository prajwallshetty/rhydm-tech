import type { Metadata } from "next";

import { noindexMetadata } from "@/lib/seo/metadata";

// The page itself is a Client Component and cannot export metadata, so the
// noindex lives here. Kept crawlable on purpose — see lib/seo/crawl.ts.
export const metadata: Metadata = noindexMetadata("Cart");

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
