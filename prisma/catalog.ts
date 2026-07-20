/**
 * Catalog seed content for the refurbished store.
 *
 * Kept separate from seed.ts so the product data stays readable and can be
 * regenerated or replaced without touching the seeding logic.
 *
 * Prices are in minor units (cents) — see the note on Product.priceCents.
 */

export type SeedSpec = { group: string; name: string; value: string };

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

export const SEED_CATEGORIES = [
  { slug: "laptops", name: "Laptops", description: "Business ultrabooks and mobile workstations, tested and graded." },
  { slug: "desktops", name: "Desktops", description: "Small-form-factor and tower PCs for office deployments." },
  { slug: "servers", name: "Servers", description: "Rack and tower servers, burn-in tested under load before dispatch." },
  { slug: "networking", name: "Networking", description: "Switches, routers, firewalls and access points." },
  { slug: "monitors", name: "Monitors", description: "Colour-calibrated business and professional displays." },
  { slug: "storage", name: "Storage", description: "Enterprise SSDs, HDDs and NAS enclosures with health reports." },
  { slug: "components", name: "Components", description: "Memory, processors and expansion cards, individually tested." },
  { slug: "accessories", name: "Accessories", description: "Docks, peripherals and power adapters." },
];

export const SEED_BRANDS = [
  "Dell",
  "HP",
  "Lenovo",
  "Apple",
  "ASUS",
  "Acer",
  "Cisco",
  "Intel",
];

export const SEED_PRODUCTS: SeedProduct[] = [
  // --- Laptops -------------------------------------------------------------
  {
    slug: "dell-latitude-7440-i7-16gb",
    name: "Dell Latitude 7440",
    sku: "LAT7440-I7-16-512",
    brand: "Dell",
    category: "laptops",
    priceCents: 74900,
    compareAtCents: 129900,
    condition: "GRADE_A",
    conditionNotes:
      "Chassis is near-flawless with no visible scuffs. Battery health verified above 90% of original capacity.",
    warrantyMonths: 12,
    shortDescription: "14-inch business ultrabook, 13th-gen i7, 16GB RAM.",
    description:
      "A corporate-fleet Latitude 7440 returned at the end of a three-year refresh cycle. Fully sanitised to NIST 800-88, reimaged with a clean OS install, and put through a 40-point functional test covering keyboard, trackpad, ports, wireless, camera and thermals.",
    stock: 24,
    featured: true,
    bestSeller: true,
    specs: [
      { group: "Processor", name: "CPU", value: "Intel Core i7-1365U" },
      { group: "Processor", name: "Cores / Threads", value: "10 / 12" },
      { group: "Memory", name: "RAM", value: "16GB LPDDR5" },
      { group: "Storage", name: "Drive", value: "512GB NVMe SSD" },
      { group: "Display", name: "Screen", value: '14" FHD+ (1920×1200) IPS' },
      { group: "Connectivity", name: "Wireless", value: "Wi-Fi 6E, Bluetooth 5.3" },
      { group: "Physical", name: "Weight", value: "1.36 kg" },
    ],
  },
  {
    slug: "lenovo-thinkpad-x1-carbon-g11",
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    sku: "X1C11-I7-32-1TB",
    brand: "Lenovo",
    category: "laptops",
    priceCents: 109900,
    compareAtCents: 189900,
    condition: "GRADE_A",
    conditionNotes:
      "Light wear on the palm rest, visible only at an angle. Battery health above 88%.",
    warrantyMonths: 24,
    shortDescription: "Flagship 14-inch ThinkPad, i7, 32GB RAM, 1TB SSD.",
    description:
      "The X1 Carbon remains the reference business ultrabook: magnesium-carbon chassis, the best keyboard in the category, and a display that holds up in a bright office. This unit came from a single-owner corporate lease.",
    stock: 11,
    featured: true,
    bestSeller: true,
    specs: [
      { group: "Processor", name: "CPU", value: "Intel Core i7-1355U" },
      { group: "Memory", name: "RAM", value: "32GB LPDDR5" },
      { group: "Storage", name: "Drive", value: "1TB NVMe SSD" },
      { group: "Display", name: "Screen", value: '14" WUXGA (1920×1200) IPS, 400 nits' },
      { group: "Connectivity", name: "Ports", value: "2× Thunderbolt 4, 2× USB-A, HDMI 2.1" },
      { group: "Physical", name: "Weight", value: "1.12 kg" },
    ],
  },
  {
    slug: "apple-macbook-pro-14-m3",
    name: 'Apple MacBook Pro 14" (M3)',
    sku: "MBP14-M3-18-512",
    brand: "Apple",
    category: "laptops",
    priceCents: 149900,
    compareAtCents: 199900,
    condition: "GRADE_A",
    conditionNotes:
      "Cosmetically excellent. Battery cycle count under 120. Includes original 70W adapter.",
    warrantyMonths: 12,
    shortDescription: "M3 chip, 18GB unified memory, Liquid Retina XDR.",
    description:
      "A 14-inch MacBook Pro with the M3 chip, returned from a design studio refresh. The Liquid Retina XDR display has been colour-verified, and the battery replaced where cycle counts exceeded our threshold.",
    stock: 7,
    featured: true,
    specs: [
      { group: "Processor", name: "Chip", value: "Apple M3 (8-core CPU, 10-core GPU)" },
      { group: "Memory", name: "Unified Memory", value: "18GB" },
      { group: "Storage", name: "Drive", value: "512GB SSD" },
      { group: "Display", name: "Screen", value: '14.2" Liquid Retina XDR, 120Hz' },
      { group: "Physical", name: "Weight", value: "1.55 kg" },
    ],
  },
  {
    slug: "hp-elitebook-840-g9",
    name: "HP EliteBook 840 G9",
    sku: "EB840G9-I5-16-256",
    brand: "HP",
    category: "laptops",
    priceCents: 54900,
    compareAtCents: 99900,
    condition: "GRADE_B",
    conditionNotes:
      "Minor scuffing on the lid and a faint mark near the trackpad. Fully functional; battery health above 85%.",
    warrantyMonths: 12,
    shortDescription: "14-inch business laptop, i5, 16GB RAM.",
    description:
      "A dependable fleet machine at a sharp price. Grade B cosmetics keep the cost down without affecting function — every port, hinge and key was tested.",
    stock: 42,
    bestSeller: true,
    specs: [
      { group: "Processor", name: "CPU", value: "Intel Core i5-1235U" },
      { group: "Memory", name: "RAM", value: "16GB DDR5" },
      { group: "Storage", name: "Drive", value: "256GB NVMe SSD" },
      { group: "Display", name: "Screen", value: '14" FHD (1920×1080) IPS' },
      { group: "Physical", name: "Weight", value: "1.36 kg" },
    ],
  },
  {
    slug: "asus-zenbook-14-oled",
    name: "ASUS Zenbook 14 OLED",
    sku: "ZB14-R7-16-512",
    brand: "ASUS",
    category: "laptops",
    priceCents: 62900,
    compareAtCents: 109900,
    condition: "OPEN_BOX",
    conditionNotes:
      "Open-box return, never deployed. Original packaging and accessories included.",
    warrantyMonths: 24,
    shortDescription: "14-inch OLED ultrabook, Ryzen 7, 16GB RAM.",
    description:
      "An open-box unit returned within the retailer's window and never put into service. Functionally new, at a meaningful discount.",
    stock: 5,
    specs: [
      { group: "Processor", name: "CPU", value: "AMD Ryzen 7 7730U" },
      { group: "Memory", name: "RAM", value: "16GB LPDDR5" },
      { group: "Storage", name: "Drive", value: "512GB NVMe SSD" },
      { group: "Display", name: "Screen", value: '14" 2.8K OLED, 90Hz' },
      { group: "Physical", name: "Weight", value: "1.28 kg" },
    ],
  },

  // --- Desktops ------------------------------------------------------------
  {
    slug: "dell-optiplex-7010-sff",
    name: "Dell OptiPlex 7010 SFF",
    sku: "OPX7010-I5-16-512",
    brand: "Dell",
    category: "desktops",
    priceCents: 38900,
    compareAtCents: 74900,
    condition: "GRADE_A",
    conditionNotes: "Excellent cosmetic condition. Chassis cleaned and re-pasted.",
    warrantyMonths: 12,
    shortDescription: "Small-form-factor office desktop, i5, 16GB RAM.",
    description:
      "The workhorse of corporate desk estates. Compact enough to mount behind a monitor, quiet under load, and trivially serviceable.",
    stock: 63,
    bestSeller: true,
    specs: [
      { group: "Processor", name: "CPU", value: "Intel Core i5-13500" },
      { group: "Memory", name: "RAM", value: "16GB DDR4" },
      { group: "Storage", name: "Drive", value: "512GB NVMe SSD" },
      { group: "Connectivity", name: "Ports", value: "6× USB, DisplayPort, HDMI, RJ-45" },
    ],
  },
  {
    slug: "hp-z2-tower-g9-workstation",
    name: "HP Z2 Tower G9 Workstation",
    sku: "Z2G9-I9-64-2TB",
    brand: "HP",
    category: "desktops",
    priceCents: 149900,
    compareAtCents: 289900,
    condition: "GRADE_A",
    conditionNotes: "Minimal wear. Burn-in tested for 24 hours under sustained load.",
    warrantyMonths: 24,
    shortDescription: "Workstation tower, i9, 64GB ECC, RTX A2000.",
    description:
      "A CAD and simulation workstation retired from an engineering practice. ECC memory, a professional GPU, and a power supply rated for continuous full load.",
    stock: 4,
    featured: true,
    specs: [
      { group: "Processor", name: "CPU", value: "Intel Core i9-13900K" },
      { group: "Memory", name: "RAM", value: "64GB DDR5 ECC" },
      { group: "Storage", name: "Drive", value: "2TB NVMe SSD" },
      { group: "Graphics", name: "GPU", value: "NVIDIA RTX A2000 12GB" },
    ],
  },
  {
    slug: "apple-mac-mini-m2",
    name: "Apple Mac mini (M2)",
    sku: "MACMINI-M2-16-512",
    brand: "Apple",
    category: "desktops",
    priceCents: 64900,
    compareAtCents: 99900,
    condition: "GRADE_A",
    conditionNotes: "Near-new condition with original power cable.",
    warrantyMonths: 12,
    shortDescription: "M2 chip, 16GB unified memory, 512GB SSD.",
    description:
      "Silent, compact and quick. A popular choice for build agents and small-footprint desk setups.",
    stock: 18,
    specs: [
      { group: "Processor", name: "Chip", value: "Apple M2 (8-core CPU, 10-core GPU)" },
      { group: "Memory", name: "Unified Memory", value: "16GB" },
      { group: "Storage", name: "Drive", value: "512GB SSD" },
    ],
  },

  // --- Servers -------------------------------------------------------------
  {
    slug: "dell-poweredge-r650",
    name: "Dell PowerEdge R650",
    sku: "PE-R650-2X6338-256",
    brand: "Dell",
    category: "servers",
    priceCents: 489900,
    compareAtCents: 899900,
    condition: "GRADE_A",
    conditionNotes:
      "Rack ears and rails included. All drive caddies present. 48-hour burn-in completed.",
    warrantyMonths: 24,
    shortDescription: "1U rack server, dual Xeon Gold, 256GB RAM.",
    description:
      "A dual-socket 1U server from a data-centre consolidation. iDRAC reset to factory, firmware updated to the latest stable release, and every DIMM slot verified.",
    stock: 6,
    featured: true,
    specs: [
      { group: "Processor", name: "CPU", value: "2× Intel Xeon Gold 6338 (32C each)" },
      { group: "Memory", name: "RAM", value: "256GB DDR4 ECC RDIMM" },
      { group: "Storage", name: "Bays", value: "8× 2.5\" SAS/SATA hot-swap" },
      { group: "Management", name: "Remote", value: "iDRAC9 Enterprise" },
      { group: "Power", name: "PSU", value: "2× 800W redundant" },
    ],
  },
  {
    slug: "hpe-proliant-dl380-gen10",
    name: "HPE ProLiant DL380 Gen10",
    sku: "DL380G10-2X6248-192",
    brand: "HP",
    category: "servers",
    priceCents: 329900,
    compareAtCents: 649900,
    condition: "GRADE_B",
    conditionNotes:
      "Rack rash on the front bezel from previous mounting. Mechanically and electrically sound.",
    warrantyMonths: 12,
    shortDescription: "2U rack server, dual Xeon, 192GB RAM.",
    description:
      "The most widely deployed 2U server of its generation, which makes spares plentiful and support straightforward.",
    stock: 9,
    specs: [
      { group: "Processor", name: "CPU", value: "2× Intel Xeon Gold 6248 (20C each)" },
      { group: "Memory", name: "RAM", value: "192GB DDR4 ECC" },
      { group: "Storage", name: "Bays", value: "12× LFF hot-swap" },
      { group: "Power", name: "PSU", value: "2× 800W redundant" },
    ],
  },

  // --- Networking ----------------------------------------------------------
  {
    slug: "cisco-catalyst-9300-48p",
    name: "Cisco Catalyst 9300-48P",
    sku: "C9300-48P",
    brand: "Cisco",
    category: "networking",
    priceCents: 189900,
    compareAtCents: 449900,
    condition: "GRADE_A",
    conditionNotes: "Configuration wiped to factory defaults. Stacking cables included.",
    warrantyMonths: 24,
    shortDescription: "48-port PoE+ managed switch, stackable.",
    description:
      "An enterprise access-layer switch with full PoE+ across all 48 ports. Reset to factory configuration with the latest recommended IOS-XE release.",
    stock: 14,
    bestSeller: true,
    specs: [
      { group: "Ports", name: "Access", value: "48× 1GbE PoE+ (740W budget)" },
      { group: "Ports", name: "Uplink", value: "4× 10G SFP+ module" },
      { group: "Stacking", name: "Bandwidth", value: "480 Gbps StackWise" },
    ],
  },
  {
    slug: "cisco-meraki-mr46-ap",
    name: "Cisco Meraki MR46 Access Point",
    sku: "MR46-HW",
    brand: "Cisco",
    category: "networking",
    priceCents: 39900,
    compareAtCents: 89900,
    condition: "GRADE_A",
    conditionNotes:
      "Unclaimed from previous dashboard organisation. Mounting bracket included.",
    warrantyMonths: 12,
    shortDescription: "Wi-Fi 6 access point, 4×4 MU-MIMO.",
    description:
      "A Wi-Fi 6 access point for dense office deployments. Note that Meraki hardware requires an active licence, which is not included.",
    stock: 27,
    specs: [
      { group: "Wireless", name: "Standard", value: "Wi-Fi 6 (802.11ax)" },
      { group: "Wireless", name: "Streams", value: "4×4:4 MU-MIMO" },
      { group: "Power", name: "PoE", value: "802.3at PoE+" },
    ],
  },

  // --- Monitors ------------------------------------------------------------
  {
    slug: "dell-ultrasharp-u2723qe",
    name: "Dell UltraSharp U2723QE",
    sku: "U2723QE",
    brand: "Dell",
    category: "monitors",
    priceCents: 34900,
    compareAtCents: 64900,
    condition: "GRADE_A",
    conditionNotes: "No dead pixels. Colour verified against factory profile. Stand included.",
    warrantyMonths: 12,
    shortDescription: '27" 4K IPS Black monitor with USB-C hub.',
    description:
      "A 27-inch 4K panel with a 90W USB-C hub, so a laptop docks with a single cable. IPS Black delivers noticeably deeper contrast than standard IPS.",
    stock: 31,
    featured: true,
    bestSeller: true,
    specs: [
      { group: "Display", name: "Panel", value: '27" IPS Black, 3840×2160' },
      { group: "Display", name: "Colour", value: "98% DCI-P3, factory calibrated" },
      { group: "Connectivity", name: "Hub", value: "USB-C 90W PD, RJ-45, 4× USB-A" },
    ],
  },
  {
    slug: "lg-ultrafine-27-4k",
    name: "LG UltraFine 27UN880",
    sku: "27UN880-B",
    brand: "HP",
    category: "monitors",
    priceCents: 27900,
    compareAtCents: 54900,
    condition: "GRADE_B",
    conditionNotes: "Light scuffing on the rear housing. Panel is unmarked.",
    warrantyMonths: 12,
    shortDescription: '27" 4K IPS with ergonomic arm stand.',
    description:
      "A 4K display with an integrated arm stand that clamps to the desk, freeing the footprint underneath.",
    stock: 16,
    specs: [
      { group: "Display", name: "Panel", value: '27" IPS, 3840×2160' },
      { group: "Display", name: "Colour", value: "99% sRGB, HDR10" },
      { group: "Connectivity", name: "Ports", value: "USB-C 60W, 2× HDMI, DisplayPort" },
    ],
  },

  // --- Storage -------------------------------------------------------------
  {
    slug: "samsung-pm9a3-1-92tb-nvme",
    name: "Samsung PM9A3 1.92TB NVMe",
    sku: "PM9A3-1920",
    brand: "Intel",
    category: "storage",
    priceCents: 21900,
    compareAtCents: 39900,
    condition: "GRADE_A",
    conditionNotes:
      "SMART report included; remaining endurance above 95%. Secure-erased before dispatch.",
    warrantyMonths: 12,
    shortDescription: "Enterprise U.2 NVMe SSD, 1.92TB.",
    description:
      "A data-centre NVMe drive with power-loss protection. Every unit ships with its full SMART health report so you can see exactly what you're buying.",
    stock: 48,
    bestSeller: true,
    specs: [
      { group: "Capacity", name: "Size", value: "1.92TB" },
      { group: "Interface", name: "Bus", value: "PCIe 4.0 ×4, U.2" },
      { group: "Performance", name: "Sequential Read", value: "6,800 MB/s" },
      { group: "Endurance", name: "DWPD", value: "1 DWPD over 5 years" },
    ],
  },
  {
    slug: "synology-ds1522-plus-nas",
    name: "Synology DiskStation DS1522+",
    sku: "DS1522PLUS",
    brand: "Intel",
    category: "storage",
    priceCents: 59900,
    compareAtCents: 89900,
    condition: "GRADE_A",
    conditionNotes: "Chassis excellent. Drive bays empty — drives sold separately.",
    warrantyMonths: 12,
    shortDescription: "5-bay NAS enclosure, expandable to 15 bays.",
    description:
      "A five-bay NAS for team file storage and backup targets. Reset to factory with the latest DSM release.",
    stock: 8,
    specs: [
      { group: "Capacity", name: "Bays", value: "5× 3.5\"/2.5\" SATA" },
      { group: "Memory", name: "RAM", value: "8GB DDR4 ECC" },
      { group: "Connectivity", name: "Network", value: "4× 1GbE, 2× eSATA expansion" },
    ],
  },

  // --- Components ----------------------------------------------------------
  {
    slug: "intel-xeon-gold-6338",
    name: "Intel Xeon Gold 6338",
    sku: "CPU-XG6338",
    brand: "Intel",
    category: "components",
    priceCents: 89900,
    compareAtCents: 219900,
    condition: "GRADE_A",
    conditionNotes: "Pins inspected under magnification. Tested in a reference board.",
    warrantyMonths: 12,
    shortDescription: "32-core server processor, LGA4189.",
    description:
      "A 32-core Ice Lake-SP processor pulled from decommissioned servers, individually tested in a reference platform before listing.",
    stock: 12,
    specs: [
      { group: "Processor", name: "Cores / Threads", value: "32 / 64" },
      { group: "Processor", name: "Base / Turbo", value: "2.0 GHz / 3.2 GHz" },
      { group: "Processor", name: "TDP", value: "205W" },
      { group: "Socket", name: "Type", value: "LGA4189" },
    ],
  },
  {
    slug: "kingston-64gb-ddr4-ecc-kit",
    name: "Kingston 64GB DDR4 ECC Kit",
    sku: "KSM32RD4-64",
    brand: "Intel",
    category: "components",
    priceCents: 17900,
    compareAtCents: 34900,
    condition: "GRADE_A",
    conditionNotes: "Memtest86 clean across 4 full passes.",
    warrantyMonths: 24,
    shortDescription: "2× 32GB DDR4-3200 ECC RDIMM.",
    description:
      "A matched pair of registered ECC modules, validated with four complete Memtest86 passes before listing.",
    stock: 35,
    specs: [
      { group: "Memory", name: "Capacity", value: "64GB (2× 32GB)" },
      { group: "Memory", name: "Speed", value: "DDR4-3200 CL22" },
      { group: "Memory", name: "Type", value: "ECC Registered (RDIMM)" },
    ],
  },

  // --- Accessories ---------------------------------------------------------
  {
    slug: "dell-wd19tbs-thunderbolt-dock",
    name: "Dell WD19TBS Thunderbolt Dock",
    sku: "WD19TBS-180W",
    brand: "Dell",
    category: "accessories",
    priceCents: 12900,
    compareAtCents: 28900,
    condition: "GRADE_B",
    conditionNotes: "Cosmetic marks on the housing. Includes 180W power adapter.",
    warrantyMonths: 12,
    shortDescription: "Thunderbolt 3 dock, 180W, triple display.",
    description:
      "Drives up to three displays over a single Thunderbolt cable while charging the laptop at 130W.",
    stock: 54,
    bestSeller: true,
    specs: [
      { group: "Connectivity", name: "Host", value: "Thunderbolt 3" },
      { group: "Display", name: "Outputs", value: "2× DisplayPort, 1× HDMI, 1× USB-C" },
      { group: "Power", name: "Delivery", value: "130W to host" },
    ],
  },
  {
    slug: "logitech-mx-keys-combo",
    name: "Logitech MX Keys + MX Master 3S",
    sku: "MX-COMBO-3S",
    brand: "Acer",
    category: "accessories",
    priceCents: 9900,
    compareAtCents: 19900,
    condition: "GRADE_B",
    conditionNotes: "Light key shine on the most-used keys. Fully sanitised.",
    warrantyMonths: 6,
    shortDescription: "Wireless keyboard and mouse productivity set.",
    description:
      "The standard productivity pairing for multi-machine desks — both devices switch between three paired computers.",
    stock: 72,
    specs: [
      { group: "Connectivity", name: "Wireless", value: "Bluetooth + Logi Bolt receiver" },
      { group: "Battery", name: "Life", value: "Up to 10 days (keyboard, backlit)" },
    ],
  },
  {
    slug: "acer-usb-c-travel-hub",
    name: "Acer 7-in-1 USB-C Travel Hub",
    sku: "ACR-HUB7",
    brand: "Acer",
    category: "accessories",
    priceCents: 3900,
    compareAtCents: 7900,
    condition: "OPEN_BOX",
    conditionNotes: "Open-box, unused. Original packaging included.",
    warrantyMonths: 12,
    shortDescription: "Compact USB-C hub with HDMI and card reader.",
    description:
      "A pocket-sized hub covering HDMI, USB-A, SD and pass-through charging for travel setups.",
    stock: 96,
    specs: [
      { group: "Ports", name: "Video", value: "HDMI 4K@30Hz" },
      { group: "Ports", name: "Data", value: "2× USB-A 3.0, SD, microSD" },
      { group: "Power", name: "Pass-through", value: "100W USB-C PD" },
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
