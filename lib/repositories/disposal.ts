import "server-only";

import { db } from "@/lib/db";
import { PublishStatus } from "@/lib/generated/prisma/enums";

/**
 * Data access for the disposal division.
 *
 * Pages import from here rather than touching `db` directly, so the query
 * shape stays in one place and `server-only` guarantees none of it is ever
 * bundled into a Client Component.
 */

export async function getServices() {
  return db.disposalService.findMany({
    where: { status: PublishStatus.PUBLISHED },
    orderBy: { position: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      icon: true,
    },
  });
}

export async function getServiceBySlug(slug: string) {
  return db.disposalService.findFirst({
    where: { slug, status: PublishStatus.PUBLISHED },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      body: true,
      icon: true,
    },
  });
}

/** Slugs for `generateStaticParams` on the service detail route. */
export async function getServiceSlugs() {
  const rows = await db.disposalService.findMany({
    where: { status: PublishStatus.PUBLISHED },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

export async function getProcessSteps() {
  return db.processStep.findMany({
    orderBy: { step: "asc" },
    select: { id: true, step: true, title: true, description: true },
  });
}

export async function getIndustries() {
  return db.industry.findMany({
    orderBy: { position: "asc" },
    select: { id: true, slug: true, name: true, description: true },
  });
}

export async function getCertifications() {
  return db.certification.findMany({
    orderBy: { position: "asc" },
    select: { id: true, name: true, issuer: true, description: true },
  });
}

export async function getFaqs() {
  return db.faq.findMany({
    where: { division: "DISPOSAL", status: PublishStatus.PUBLISHED },
    orderBy: { position: "asc" },
    select: { id: true, question: true, answer: true },
  });
}

export async function getTestimonials() {
  return db.testimonial.findMany({
    where: { division: "DISPOSAL", status: PublishStatus.PUBLISHED },
    orderBy: [{ featured: "desc" }, { position: "asc" }],
    select: {
      id: true,
      quote: true,
      author: true,
      role: true,
      company: true,
      rating: true,
    },
  });
}

/** Editable hero copy, keyed by `PageSection.key`. */
export type HeroContent = {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export async function getHero(key = "disposal.hero") {
  const section = await db.pageSection.findUnique({
    where: { key },
    select: { content: true },
  });

  return (section?.content ?? null) as HeroContent | null;
}
