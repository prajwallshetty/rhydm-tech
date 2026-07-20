/**
 * Catalog taxonomy for the refurbished store.
 *
 * Static for now; these shapes mirror the planned Prisma `Category` model so
 * swapping the source for a database query is a one-file change.
 */

export type Category = {
  slug: string;
  name: string;
  description: string;
  /** Placeholder count until inventory is wired up. */
  itemCount: number;
};

export const CATEGORIES: Category[] = [
  {
    slug: "laptops",
    name: "Laptops",
    description: "Business ultrabooks and mobile workstations, grade A to C.",
    itemCount: 148,
  },
  {
    slug: "desktops",
    name: "Desktops",
    description: "Small-form-factor and tower PCs for office deployments.",
    itemCount: 92,
  },
  {
    slug: "servers",
    name: "Servers",
    description: "Rack and tower servers, tested under load before dispatch.",
    itemCount: 37,
  },
  {
    slug: "networking",
    name: "Networking",
    description: "Switches, routers, firewalls and access points.",
    itemCount: 64,
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Docks, displays, peripherals and spare components.",
    itemCount: 210,
  },
];

export const BUYING_POINTS = [
  {
    title: "Tested and graded",
    description:
      "Every unit passes a 40-point functional test and is graded on a published cosmetic scale.",
  },
  {
    title: "Warranty included",
    description:
      "12-month return-to-base warranty as standard, extendable to 36 months.",
  },
  {
    title: "Data sanitised",
    description:
      "All storage is wiped to NIST 800-88 before a device ever reaches the catalog.",
  },
  {
    title: "Lower total cost",
    description:
      "Typically 40–60% below new, with the same deployment lifecycle.",
  },
] as const;
