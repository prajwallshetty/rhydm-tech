/**
 * Seeds the database from the same static content the site already renders,
 * so there is a single source of truth while pages are migrated off the
 * static modules and onto the database one at a time.
 *
 * Relative imports (not the `@/` alias) — tsx runs this outside Next's
 * module resolution.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, Division, PublishStatus } from "../lib/generated/prisma/client";
import { FEATURES, INDUSTRIES, PROCESS, SERVICES } from "../lib/data/disposal";
import {
  REVIEW_POOL,
  SEED_BRANDS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
} from "./catalog";

// Prisma 7 requires an explicit driver adapter.
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding…");

  // --- Disposal CMS -------------------------------------------------------

  for (const [index, service] of SERVICES.entries()) {
    await db.disposalService.upsert({
      where: { slug: service.slug },
      update: {
        title: service.title,
        summary: service.description,
        icon: service.icon,
        position: index,
      },
      create: {
        slug: service.slug,
        title: service.title,
        summary: service.description,
        icon: service.icon,
        position: index,
        status: PublishStatus.PUBLISHED,
      },
    });
  }

  for (const step of PROCESS) {
    await db.processStep.upsert({
      where: { step: step.step },
      update: { title: step.title, description: step.description },
      create: {
        step: step.step,
        title: step.title,
        description: step.description,
      },
    });
  }

  for (const [index, name] of INDUSTRIES.entries()) {
    await db.industry.upsert({
      where: { slug: slugify(name) },
      update: { name, position: index },
      create: { slug: slugify(name), name, position: index },
    });
  }

  const certifications = [
    { name: "ISO 27001", issuer: "ISO", description: "Information security management." },
    { name: "ISO 14001", issuer: "ISO", description: "Environmental management systems." },
    { name: "R2v3", issuer: "SERI", description: "Responsible electronics recycling." },
    { name: "NIST 800-88", issuer: "NIST", description: "Media sanitization guidelines." },
  ];

  for (const [index, cert] of certifications.entries()) {
    const existing = await db.certification.findFirst({ where: { name: cert.name } });
    if (existing) {
      await db.certification.update({
        where: { id: existing.id },
        data: { ...cert, position: index },
      });
    } else {
      await db.certification.create({ data: { ...cert, position: index } });
    }
  }

  // Hero copy, editable from the Disposal CMS.
  await db.pageSection.upsert({
    where: { key: "disposal.hero" },
    update: {},
    create: {
      key: "disposal.hero",
      division: Division.DISPOSAL,
      content: {
        eyebrow: "ISO 27001 · R2 Certified",
        heading: "Retire IT assets without inheriting the risk",
        subheading:
          "Secure data wiping, certified destruction and zero-landfill recycling — delivered with the audit trail your compliance team actually needs.",
        primaryCta: { label: "Request Pickup", href: "/disposal/contact" },
        secondaryCta: { label: "Explore Services", href: "/disposal/services" },
      },
    },
  });

  for (const [index, feature] of FEATURES.entries()) {
    await db.pageSection.upsert({
      where: { key: `disposal.feature.${slugify(feature.title)}` },
      update: {},
      create: {
        key: `disposal.feature.${slugify(feature.title)}`,
        division: Division.DISPOSAL,
        content: { ...feature, position: index },
      },
    });
  }

  const faqs = [
    {
      question: "How quickly can you collect our assets?",
      answer:
        "Standard collection is scheduled within 48 hours across major metros. Emergency same-day pickup is available for contracted clients.",
    },
    {
      question: "What documentation do we receive?",
      answer:
        "A serial-level Certificate of Destruction for every asset, a full inventory reconciliation report, and an environmental impact summary for ESG reporting.",
    },
    {
      question: "Can data be destroyed on our premises?",
      answer:
        "Yes. On-site shredding and degaussing are available so media never leaves your facility intact.",
    },
    {
      question: "Do you handle multi-site estates?",
      answer:
        "We coordinate collection across multiple locations under a single engagement, with consolidated reporting.",
    },
    {
      question: "What happens to equipment that still has value?",
      answer:
        "Assets that pass testing are remarketed through our refurbished division, and we return a share of the recovered value to you.",
    },
  ];

  for (const [index, faq] of faqs.entries()) {
    const existing = await db.faq.findFirst({
      where: { question: faq.question, division: Division.DISPOSAL },
    });
    if (!existing) {
      await db.faq.create({
        data: { ...faq, division: Division.DISPOSAL, position: index },
      });
    }
  }

  const testimonials = [
    {
      quote:
        "The audit trail was the deciding factor. Our regulators asked for serial-level evidence and we produced it in minutes, not weeks.",
      author: "Priya Raman",
      role: "Head of IT Governance",
      company: "Northbank Financial",
      rating: 5,
    },
    {
      quote:
        "Four sites decommissioned in a single engagement, with one consolidated report. It removed an enormous amount of coordination from my team.",
      author: "Daniel Okafor",
      role: "Infrastructure Director",
      company: "Meridian Health",
      rating: 5,
    },
    {
      quote:
        "Zero-landfill reporting fed straight into our ESG disclosures. That was an unexpected bonus.",
      author: "Sofia Lindqvist",
      role: "Sustainability Lead",
      company: "Arclight Manufacturing",
      rating: 5,
    },
  ];

  for (const [index, testimonial] of testimonials.entries()) {
    const existing = await db.testimonial.findFirst({
      where: { author: testimonial.author, division: Division.DISPOSAL },
    });
    if (!existing) {
      await db.testimonial.create({
        data: { ...testimonial, division: Division.DISPOSAL, position: index },
      });
    }
  }

  // --- Store catalog ------------------------------------------------------

  for (const [index, category] of SEED_CATEGORIES.entries()) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        position: index,
      },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        position: index,
      },
    });
  }

  for (const [index, name] of SEED_BRANDS.entries()) {
    await db.brand.upsert({
      where: { slug: slugify(name) },
      update: { name, position: index },
      create: { slug: slugify(name), name, position: index },
    });
  }

  const categoryIds = new Map(
    (await db.category.findMany({ select: { id: true, slug: true } })).map(
      (c) => [c.slug, c.id],
    ),
  );
  const brandIds = new Map(
    (await db.brand.findMany({ select: { id: true, slug: true } })).map((b) => [
      b.slug,
      b.id,
    ]),
  );

  for (const [index, item] of SEED_PRODUCTS.entries()) {
    const categoryId = categoryIds.get(item.category);
    const brandId = brandIds.get(slugify(item.brand));

    if (!categoryId) {
      throw new Error(
        `Product "${item.slug}" references unknown category "${item.category}".`,
      );
    }

    const data = {
      name: item.name,
      sku: item.sku,
      priceCents: item.priceCents,
      compareAtCents: item.compareAtCents ?? null,
      condition: item.condition,
      conditionNotes: item.conditionNotes,
      warrantyMonths: item.warrantyMonths,
      shortDescription: item.shortDescription,
      description: item.description,
      stock: item.stock,
      featured: item.featured ?? false,
      bestSeller: item.bestSeller ?? false,
      status: PublishStatus.PUBLISHED,
      categoryId,
      brandId: brandId ?? null,
    };

    const product = await db.product.upsert({
      where: { slug: item.slug },
      update: data,
      create: { slug: item.slug, ...data },
    });

    // Specs and reviews are replaced wholesale rather than diffed — the seed
    // is the source of truth and re-running it should be idempotent.
    await db.productSpec.deleteMany({ where: { productId: product.id } });
    await db.productSpec.createMany({
      data: item.specs.map((spec, position) => ({
        productId: product.id,
        group: spec.group,
        name: spec.name,
        value: spec.value,
        position,
      })),
    });

    await db.review.deleteMany({ where: { productId: product.id } });

    // Deterministic slice of the pool so each product gets a stable, varied
    // set of reviews rather than everything looking identical.
    const reviewCount = 2 + (index % 4);
    const reviews = Array.from({ length: reviewCount }, (_, i) => {
      const source = REVIEW_POOL[(index * 3 + i) % REVIEW_POOL.length];
      return {
        productId: product.id,
        author: source.author,
        rating: source.rating,
        title: source.title,
        body: source.body,
        verified: i % 2 === 0,
      };
    });

    await db.review.createMany({ data: reviews });

    const ratingSum = reviews.reduce((total, r) => total + r.rating, 0);
    await db.product.update({
      where: { id: product.id },
      data: {
        ratingCount: reviews.length,
        ratingAvg: Number((ratingSum / reviews.length).toFixed(2)),
      },
    });
  }

  const storeFaqs = [
    {
      question: "What does 'refurbished' actually mean here?",
      answer:
        "Every unit is functionally tested across roughly 40 checkpoints, has its storage sanitised to NIST 800-88, is cleaned, and is then graded on a published cosmetic scale. Nothing is listed on appearance alone.",
    },
    {
      question: "How do the condition grades work?",
      answer:
        "Grade A is near-flawless, Grade B has light cosmetic wear that does not affect function, and Grade C shows visible wear at a lower price. Open Box units are unused returns. Each listing also carries a specific condition note.",
    },
    {
      question: "What warranty is included?",
      answer:
        "Twelve months return-to-base as standard, with some items carrying 24 months. The exact term is shown on every product page and can be extended to 36 months at checkout once payments are live.",
    },
    {
      question: "Can I return something that isn't right?",
      answer:
        "Yes — 30 days from delivery, with no restocking fee. The item needs to come back in the condition it arrived in.",
    },
    {
      question: "Do you supply in bulk for company rollouts?",
      answer:
        "We do. For orders above roughly ten units we can match specifications across a batch and stage delivery to your schedule. Contact us before ordering so we can reserve stock.",
    },
    {
      question: "Is the previous owner's data really gone?",
      answer:
        "Yes. All storage is erased to NIST 800-88 standards before a device enters the catalog, and drives that fail verification are physically destroyed rather than resold.",
    },
  ];

  for (const [index, faq] of storeFaqs.entries()) {
    const existing = await db.faq.findFirst({
      where: { question: faq.question, division: Division.REFURBISHED },
    });
    if (!existing) {
      await db.faq.create({
        data: { ...faq, division: Division.REFURBISHED, position: index },
      });
    }
  }

  console.log(
    `Seed complete. ${SEED_PRODUCTS.length} products across ${SEED_CATEGORIES.length} categories.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
