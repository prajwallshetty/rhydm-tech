/**
 * Catalog seed content for the refurbished store.
 *
 * Kept separate from seed.ts so the product data stays readable and can be
 * regenerated or replaced without touching the seeding logic.
 *
 * Prices are in minor units (cents) — see the note on Product.priceCents.
 */

export type SeedSpec = { group: string; name: string; value: string };

export type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  parentSlug?: string;
};

export type SeedProduct = {
  slug: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  priceCents: number;
  compareAtCents?: number;
  condition: "GRADE_A" | "GRADE_B" | "GRADE_C" | "OPEN_BOX";
  conditionNotes: string;
  warrantyMonths: number;
  shortDescription: string;
  description: string;
  stock: number;
  featured?: boolean;
  bestSeller?: boolean;
  specs: SeedSpec[];
};

export const SEED_CATEGORIES: SeedCategory[] = [
  // Parent Categories
  { slug: "laptops", name: "Laptops", description: "Business ultrabooks and mobile workstations, tested and graded." },
  { slug: "desktops", name: "Desktops", description: "Small-form-factor and tower PCs for office deployments." },
  { slug: "servers", name: "Servers", description: "Rack and tower servers, burn-in tested under load before dispatch." },
  // Subcategories
  { slug: "business-laptop", name: "Business Laptop", description: "Professional business-grade laptops for office and remote work.", parentSlug: "laptops" },
  { slug: "small-form-factor", name: "Small Form Factor", description: "Space-saving desktop computers for enterprise environments.", parentSlug: "desktops" },
  { slug: "mini-pc", name: "Mini PC", description: "Ultra-compact mini desktop PCs with small footprints.", parentSlug: "desktops" },
  { slug: "blade-chassis", name: "Blade / Chassis", description: "Blade server chassis and modular server nodes.", parentSlug: "servers" },
];

export const SEED_BRANDS = [
  "HP",
  "Dell",
  "Lenovo",
];

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "hp-prodesk-600-g4-sff-desktop-512hdd",
    name: "HP ProDesk 600 G4 SFF Desktop",
    sku: "RH-HP-PD600G4-512HDD",
    brand: "HP",
    category: "small-form-factor",
    priceCents: 9500,
    condition: "GRADE_B",
    conditionNotes: "Refurbished / condition details should be confirmed from listing",
    warrantyMonths: 12,
    shortDescription: "HP ProDesk 600 G4 SFF Desktop PC with Intel Core i3-8100, 8GB RAM, 512GB HDD, and Windows 11 Pro.",
    description: "HP ProDesk 600 G4 SFF Desktop. Sourced from corporate fleet refreshes. Fully tested, cleaned, and updated. Built for productivity and daily workloads in office or home environments.",
    stock: 0,
    specs: [
      { group: "Processor", name: "CPU", value: "Intel Core i3-8100" },
      { group: "Memory", name: "RAM", value: "8 GB" },
      { group: "Storage", name: "Drive", value: "512 GB HDD" },
      { group: "Software", name: "OS", value: "Windows 11 Pro" },
      { group: "Physical", name: "Model Number", value: "HP ProDesk 600 G4" },
      { group: "Listing", name: "Shipping", value: "Free delivery" },
      { group: "Listing", name: "Pickup", value: "Available at pickup station" },
      { group: "Listing", name: "eBay Link", value: "https://www.ebay.de/sch/i.html?_dkr=1&iconV2Request=true&_blrs=recall_filtering&_ssn=rhydm-technologies-ug&_oac=1" },
      { group: "Listing", name: "Notes", value: "Current store listing. Direct gallery image URLs were not exposed reliably by the public store-page extraction." },
    ],
  },
  {
    slug: "hp-260-g3-mini-desktop-pc-1tb-8gb",
    name: "HP 260 G3 Mini Desktop PC",
    sku: "RH-HP-260G3-1TB-8GB",
    brand: "HP",
    category: "mini-pc",
    priceCents: 8000,
    condition: "GRADE_B",
    conditionNotes: "Used - Refurbished and fully tested.",
    warrantyMonths: 12,
    shortDescription: "HP 260 G3 Mini Desktop PC with 8GB RAM, 1TB HDD, and Windows 11 Pro.",
    description: "HP 260 G3 Mini Desktop PC. Clean, space-saving design. Sourced from corporate environments, audited, and tested. Ideal for light office work or standard media streaming.",
    stock: 0,
    specs: [
      { group: "Memory", name: "RAM", value: "8 GB (expandable)" },
      { group: "Storage", name: "Drive", value: "1 TB HDD" },
      { group: "Software", name: "OS", value: "Windows 11 Pro" },
      { group: "Physical", name: "Model Number", value: "HP 260 G3" },
      { group: "Listing", name: "Shipping", value: "Free delivery" },
      { group: "Listing", name: "Pickup", value: "Available at pickup station" },
      { group: "Listing", name: "eBay Link", value: "https://www.ebay.de/sch/i.html?_dkr=1&iconV2Request=true&_blrs=recall_filtering&_ssn=rhydm-technologies-ug&_oac=1" },
      { group: "Listing", name: "Notes", value: "Current store listing." },
    ],
  },
  {
    slug: "hp-probook-645-g4-laptop-16gb",
    name: "HP ProBook 645 G4 Laptop",
    sku: "RH-HP-PB645G4-16GB",
    brand: "HP",
    category: "business-laptop",
    priceCents: 15000,
    condition: "GRADE_B",
    conditionNotes: "Used - Refurbished and fully tested.",
    warrantyMonths: 12,
    shortDescription: "HP ProBook 645 G4 business laptop with 16GB RAM, 128GB SSD + 500GB HDD, and Windows 11 Pro.",
    description: "HP ProBook 645 G4 Laptop. Sturdy business companion, featuring high-speed dual storage. Audited, cleaned, and verified for enterprise-level use.",
    stock: 0,
    specs: [
      { group: "Memory", name: "RAM", value: "16 GB" },
      { group: "Storage", name: "Drive", value: "128 GB SSD + 500 GB HDD" },
      { group: "Software", name: "OS", value: "Windows 11 Pro" },
      { group: "Physical", name: "Model Number", value: "HP ProBook 645 G4" },
      { group: "Listing", name: "Shipping", value: "Free delivery" },
      { group: "Listing", name: "Pickup", value: "Available at pickup station" },
      { group: "Listing", name: "eBay Link", value: "https://www.ebay.de/sch/i.html?_dkr=1&iconV2Request=true&_blrs=recall_filtering&_ssn=rhydm-technologies-ug&_oac=1" },
      { group: "Listing", name: "Notes", value: "Current store listing." },
    ],
  },
  {
    slug: "hp-probook-640-g5",
    name: "HP ProBook 640 G5",
    sku: "RH-HP-PB640G5-I5-16-512",
    brand: "HP",
    category: "business-laptop",
    priceCents: 18000,
    condition: "GRADE_B",
    conditionNotes: "Very Good - Refurbished",
    warrantyMonths: 12,
    shortDescription: "HP ProBook 640 G5 with Intel Core i5-8365U, 16GB RAM, 512GB SSD, 14\" FHD display, and Windows 11 Pro.",
    description: "HP ProBook 640 G5. High-quality business laptop in very good cosmetic condition. Fully cleaned, sanitized, and functionally verified.",
    stock: 6,
    specs: [
      { group: "Processor", name: "CPU", value: "Intel Core i5-8365U" },
      { group: "Memory", name: "RAM", value: "16 GB" },
      { group: "Storage", name: "Drive", value: "512 GB SSD / NVMe (listing title); detailed indexed listing states 500 GB SSD capacity" },
      { group: "Display", name: "Screen", value: "14 inch" },
      { group: "Graphics", name: "GPU", value: "Integrated / On-board graphics" },
      { group: "Software", name: "OS", value: "Windows 11 Pro" },
      { group: "Display", name: "Resolution", value: "1920 x 1080" },
      { group: "Physical", name: "Color", value: "Silver" },
      { group: "Physical", name: "Model Number", value: "HP ProBook 640 G5" },
      { group: "Listing", name: "Shipping", value: "Free delivery" },
      { group: "Listing", name: "Pickup", value: "Available at pickup station" },
      { group: "Listing", name: "Quantity Discount", value: "2+ units: €156.75 each" },
      { group: "Listing", name: "eBay Link", value: "https://www.ebay.de/itm/177413073076" },
      { group: "Listing", name: "Notes", value: "Current seller store shows EUR 180. A separately indexed listing for the same model shows EUR 165, 6 available, 1 sold and four gallery images." },
    ],
  },
  {
    slug: "dell-latitude-5450",
    name: "Dell Latitude 5450",
    sku: "RH-DELL-LAT5450-16-512",
    brand: "Dell",
    category: "business-laptop",
    priceCents: 68000,
    condition: "GRADE_B",
    conditionNotes: "Used - Refurbished and fully tested.",
    warrantyMonths: 12,
    shortDescription: "Dell Latitude 5450 with Intel Core Ultra, 16GB RAM, 512GB SSD, and Windows 11 Pro.",
    description: "Dell Latitude 5450. Modern corporate laptop featuring Intel Core Ultra. Audited and sanitised, offering high speed and productivity.",
    stock: 0,
    specs: [
      { group: "Processor", name: "CPU", value: "Intel Core Ultra" },
      { group: "Memory", name: "RAM", value: "16 GB" },
      { group: "Storage", name: "Drive", value: "512 GB SSD" },
      { group: "Software", name: "OS", value: "Windows 11 Pro" },
      { group: "Physical", name: "Model Number", value: "Dell Latitude 5450" },
      { group: "Listing", name: "Shipping", value: "Free delivery" },
      { group: "Listing", name: "Pickup", value: "Available at pickup station" },
      { group: "Listing", name: "eBay Link", value: "https://www.ebay.de/sch/i.html?_dkr=1&iconV2Request=true&_blrs=recall_filtering&_ssn=rhydm-technologies-ug&_oac=1" },
      { group: "Listing", name: "Notes", value: "Current store listing; exact Core Ultra SKU is not exposed on the store grid." },
    ],
  },
  {
    slug: "hp-probook-445r-g6",
    name: "HP ProBook 445R G6",
    sku: "RH-HP-PB445RG6-R5-16-256",
    brand: "HP",
    category: "business-laptop",
    priceCents: 23900,
    compareAtCents: 24900,
    condition: "GRADE_B",
    conditionNotes: "Used - Refurbished and fully tested.",
    warrantyMonths: 12,
    shortDescription: "HP ProBook 445R G6 with AMD Ryzen 5 3500U, 16GB RAM, 256GB SSD, 14\" FHD display, and Windows 11 Pro.",
    description: "HP ProBook 445R G6. Elegant and reliable business-grade laptop, powered by AMD Ryzen 5 processor. Fully audited, sanitised, and tested.",
    stock: 0,
    specs: [
      { group: "Processor", name: "CPU", value: "AMD Ryzen 5 3500U" },
      { group: "Memory", name: "RAM", value: "16 GB DDR4" },
      { group: "Storage", name: "Drive", value: "256 GB NVMe" },
      { group: "Display", name: "Screen", value: "14 inch" },
      { group: "Software", name: "OS", value: "Windows 11 Pro" },
      { group: "Display", name: "Resolution", value: "Full HD" },
      { group: "Physical", name: "Model Number", value: "HP ProBook 445R G6" },
      { group: "Listing", name: "Shipping", value: "Free delivery" },
      { group: "Listing", name: "Pickup", value: "Available at pickup station" },
      { group: "Listing", name: "eBay Link", value: "https://www.ebay.de/sch/i.html?_dkr=1&iconV2Request=true&_blrs=recall_filtering&_ssn=rhydm-technologies-ug&_oac=1" },
      { group: "Listing", name: "Notes", value: "Current store listing. EUR 239 is shown as a coupon price." },
    ],
  },
  {
    slug: "lenovo-thinkpad-l14-gen-1",
    name: "Lenovo ThinkPad L14 Gen 1",
    sku: "RH-LEN-L14G1-I5-16-512",
    brand: "Lenovo",
    category: "business-laptop",
    priceCents: 28900,
    compareAtCents: 29900,
    condition: "GRADE_B",
    conditionNotes: "Used - Refurbished and fully tested.",
    warrantyMonths: 12,
    shortDescription: "Lenovo ThinkPad L14 Gen 1 with Intel Core i5 10th Gen, 16GB RAM, 512GB SSD, 14\" FHD display, and Windows 11 Pro.",
    description: "Lenovo ThinkPad L14 Gen 1. Durable enterprise laptop, tested for compliance and productivity. Features signature ThinkPad durability and typing comfort.",
    stock: 0,
    specs: [
      { group: "Processor", name: "CPU", value: "Intel Core i5 10th Gen" },
      { group: "Memory", name: "RAM", value: "16 GB" },
      { group: "Storage", name: "Drive", value: "512 GB SSD" },
      { group: "Display", name: "Screen", value: "14 inch" },
      { group: "Software", name: "OS", value: "Windows 11 Pro" },
      { group: "Display", name: "Resolution", value: "Full HD" },
      { group: "Physical", name: "Model Number", value: "ThinkPad L14 Gen 1" },
      { group: "Listing", name: "Shipping", value: "Free delivery" },
      { group: "Listing", name: "Pickup", value: "Available at pickup station" },
      { group: "Listing", name: "eBay Link", value: "https://www.ebay.de/sch/i.html?_dkr=1&iconV2Request=true&_blrs=recall_filtering&_ssn=rhydm-technologies-ug&_oac=1" },
      { group: "Listing", name: "Notes", value: "Current store listing. EUR 289 is shown as a coupon price." },
    ],
  },
  {
    slug: "lenovo-thinkpad-e-series-14",
    name: "Lenovo ThinkPad E Series 14",
    sku: "RH-LEN-TPE14-R7-24-512",
    brand: "Lenovo",
    category: "business-laptop",
    priceCents: 34000,
    condition: "GRADE_B",
    conditionNotes: "Used - Refurbished and fully tested.",
    warrantyMonths: 12,
    shortDescription: "Lenovo ThinkPad E Series 14 with AMD Ryzen 7 3700U, 24GB RAM, 512GB SSD, 14\" screen, and Windows 11 Pro.",
    description: "Lenovo ThinkPad E Series 14. Excellent performance laptop with upgraded 24GB RAM, built for reliable everyday business work.",
    stock: 0,
    specs: [
      { group: "Processor", name: "CPU", value: "AMD Ryzen 7 3700U" },
      { group: "Memory", name: "RAM", value: "24 GB" },
      { group: "Storage", name: "Drive", value: "512 GB SSD" },
      { group: "Display", name: "Screen", value: "14 inch" },
      { group: "Software", name: "OS", value: "Windows 11 Pro" },
      { group: "Physical", name: "Model Number", value: "ThinkPad E Series 14" },
      { group: "Listing", name: "Shipping", value: "Free delivery" },
      { group: "Listing", name: "Pickup", value: "Available at pickup station" },
      { group: "Listing", name: "eBay Link", value: "https://www.ebay.de/sch/i.html?_dkr=1&iconV2Request=true&_blrs=recall_filtering&_ssn=rhydm-technologies-ug&_oac=1" },
      { group: "Listing", name: "Notes", value: "Current store listing." },
    ],
  },
  {
    slug: "hp-prodesk-600-g4-sff-desktop-256nvme",
    name: "HP ProDesk 600 G4 SFF Desktop",
    sku: "RH-HP-PD600G4-256NVME",
    brand: "HP",
    category: "small-form-factor",
    priceCents: 12500,
    condition: "GRADE_B",
    conditionNotes: "Used - Refurbished and fully tested.",
    warrantyMonths: 12,
    shortDescription: "HP ProDesk 600 G4 SFF Desktop with Intel Core i3-8100, 8GB RAM, 256GB SSD, and Windows 11 Pro.",
    description: "HP ProDesk 600 G4 SFF Desktop. Audited and refurbished. Upgraded to a superfast 256GB NVMe SSD for fast boot times and daily productivity.",
    stock: 0,
    specs: [
      { group: "Processor", name: "CPU", value: "Intel Core i3-8100" },
      { group: "Memory", name: "RAM", value: "8 GB" },
      { group: "Storage", name: "Drive", value: "256 GB NVMe SSD" },
      { group: "Software", name: "OS", value: "Windows 11 Pro" },
      { group: "Physical", name: "Model Number", value: "HP ProDesk 600 G4" },
      { group: "Listing", name: "Shipping", value: "Free delivery" },
      { group: "Listing", name: "Pickup", value: "Available at pickup station" },
      { group: "Listing", name: "eBay Link", value: "https://www.ebay.de/sch/i.html?_dkr=1&iconV2Request=true&_blrs=recall_filtering&_ssn=rhydm-technologies-ug&_oac=1" },
      { group: "Listing", name: "Notes", value: "Current store listing." },
    ],
  },
  {
    slug: "dell-poweredge-vrtx-server-chassis",
    name: "Dell PowerEdge VRTX Server Chassis with 2 x M630 Blade Servers",
    sku: "RH-DELL-VRTX-M630-2",
    brand: "Dell",
    category: "blade-chassis",
    priceCents: 400000,
    condition: "GRADE_B",
    conditionNotes: "Used - Refurbished and fully tested.",
    warrantyMonths: 12,
    shortDescription: "Dell PowerEdge VRTX Server Chassis configured with 2 x M630 Blade Servers.",
    description: "Dell PowerEdge VRTX Server Chassis. Modular infrastructure solution designed for office environments. Features integrated shared storage, networking, and includes 2 x PowerEdge M630 blade servers.",
    stock: 0,
    specs: [
      { group: "Physical", name: "Model Number", value: "PowerEdge VRTX" },
      { group: "Listing", name: "Shipping", value: "Pickup only shown on store grid" },
      { group: "Listing", name: "Pickup", value: "Available" },
      { group: "System", name: "Blade Servers", value: "2 x M630" },
      { group: "Listing", name: "eBay Link", value: "https://www.ebay.de/b/Computerserver-in-Berlin/11211/bn_7121857204" },
      { group: "Listing", name: "Notes", value: "Current store listing. Search results also confirm the EUR 4,000 listing." },
    ],
  },
];

/** Review copy pooled and distributed across products during seeding. */
export const REVIEW_POOL = [
  { author: "Marcus Webb", rating: 5, title: "Indistinguishable from new", body: "Ordered six for our support team. Every one arrived immaculate and the battery reports matched what was advertised. The grading is honest, which is rarer than it should be." },
  { author: "Anika Sharma", rating: 5, title: "Exactly as described", body: "The condition report was accurate down to the small mark it mentioned. Shipping was quick and it came properly packed rather than rattling around in a box." },
  { author: "Tom Ferreira", rating: 4, title: "Great value, minor cosmetics", body: "A couple of scuffs the listing warned about, so no surprises. Performance is spot on and it saved us a significant amount against buying new." },
  { author: "Rachel Nwosu", rating: 5, title: "Second order from these", body: "Bought a batch last year and came back for more. Consistent quality and the warranty gives our finance team something to point at." },
  { author: "David Lindholm", rating: 4, title: "Solid, quick dispatch", body: "Arrived two days after ordering. Wiped and reimaged cleanly, no leftover software from the previous owner." },
  { author: "Priya Raman", rating: 5, title: "Sensible procurement choice", body: "We now default to refurbished for standard desk builds. The audit documentation satisfied our compliance review without any back-and-forth." },
  { author: "James Okonkwo", rating: 4, title: "Does the job well", body: "Not the newest generation but far more machine than we needed at the price. Would buy again." },
  { author: "Elena Vasquez", rating: 5, title: "Impressive turnaround", body: "Needed twelve units at short notice and they were dispatched same-day. All tested and ready to deploy." },
];
