/**
 * Content for the IT Asset Disposal division.
 *
 * Kept as typed, static data so pages stay Server Components with zero data
 * fetching. When the Prisma-backed Disposal CMS lands, these shapes become the
 * return types of the repository functions — the components consuming them
 * will not need to change.
 */

/** Keys are resolved to Lucide components by the rendering component; React
 *  elements cannot cross the Server/Client boundary as props. */
export type IconKey =
  | "shield"
  | "eraser"
  | "hardDrive"
  | "recycle"
  | "truck"
  | "package"
  | "certificate"
  | "clock"
  | "leaf"
  | "lock";

export type Service = {
  slug: string;
  title: string;
  description: string;
  icon: IconKey;
};

export const SERVICES: Service[] = [
  {
    slug: "secure-data-wiping",
    title: "Secure Data Wiping",
    description:
      "NIST 800-88 compliant erasure across drives, arrays and mobile estates, with a verifiable per-asset audit record.",
    icon: "eraser",
  },
  {
    slug: "hard-drive-destruction",
    title: "Hard Drive Destruction",
    description:
      "On-site or in-facility shredding and degaussing for media that must never leave your chain of custody intact.",
    icon: "hardDrive",
  },
  {
    slug: "it-asset-disposal",
    title: "IT Asset Disposal",
    description:
      "End-to-end decommissioning of laptops, desktops, servers and network gear with full inventory reconciliation.",
    icon: "shield",
  },
  {
    slug: "e-waste-recycling",
    title: "E-Waste Recycling",
    description:
      "Responsible downstream recycling through audited partners, with zero-landfill reporting for your ESG disclosures.",
    icon: "recycle",
  },
  {
    slug: "corporate-pickup",
    title: "Corporate Pickup",
    description:
      "Scheduled, insured collection from single offices or multi-site estates, including packing and secure transport.",
    icon: "truck",
  },
  {
    slug: "asset-recovery",
    title: "Asset Recovery",
    description:
      "Recover residual value from retired hardware through remarketing, with transparent revenue-share reporting.",
    icon: "package",
  },
  {
    slug: "certificates-of-destruction",
    title: "Certificates of Destruction",
    description:
      "Serial-level certificates issued for every asset, ready to hand to auditors and regulators without follow-up.",
    icon: "certificate",
  },
];

export type Feature = {
  title: string;
  description: string;
  icon: IconKey;
};

export const FEATURES: Feature[] = [
  {
    title: "Experience",
    description:
      "Over a decade decommissioning estates for regulated enterprises.",
    icon: "shield",
  },
  {
    title: "Security",
    description:
      "Sealed transport, vetted staff and continuous chain-of-custody tracking.",
    icon: "lock",
  },
  {
    title: "Compliance",
    description:
      "Documentation aligned to GDPR, HIPAA and SOX retention obligations.",
    icon: "certificate",
  },
  {
    title: "Fast Pickup",
    description: "Collection scheduled within 48 hours across major metros.",
    icon: "clock",
  },
  {
    title: "Eco Friendly",
    description: "Zero-landfill policy with audited downstream recyclers.",
    icon: "leaf",
  },
  {
    title: "Certified Disposal",
    description: "Serial-level certificates issued for every processed asset.",
    icon: "recycle",
  },
];

export type Stat = { value: string; label: string };

export const STATS: Stat[] = [
  { value: "2.4M+", label: "Assets processed" },
  { value: "100%", label: "Zero-landfill rate" },
  { value: "48h", label: "Average pickup time" },
  { value: "0", label: "Reported data incidents" },
];

export type ProcessStep = {
  step: number;
  title: string;
  description: string;
};

export const PROCESS: ProcessStep[] = [
  {
    step: 1,
    title: "Assessment",
    description:
      "We scope your estate, compliance obligations and destruction requirements.",
  },
  {
    step: 2,
    title: "Pickup",
    description:
      "Insured, GPS-tracked collection with tamper-evident seals applied on site.",
  },
  {
    step: 3,
    title: "Inventory",
    description:
      "Every asset is scanned, photographed and reconciled against your records.",
  },
  {
    step: 4,
    title: "Data Wiping",
    description:
      "NIST 800-88 erasure with per-device verification and failure quarantine.",
  },
  {
    step: 5,
    title: "Physical Destruction",
    description:
      "Media that cannot be verifiably wiped is shredded or degaussed under CCTV.",
  },
  {
    step: 6,
    title: "Recycling",
    description:
      "Residual materials are routed to audited, zero-landfill downstream partners.",
  },
  {
    step: 7,
    title: "Certification",
    description:
      "Serial-level certificates and an environmental impact report are issued.",
  },
];

export const INDUSTRIES = [
  "Healthcare",
  "Education",
  "Government",
  "Banking",
  "Corporate",
  "IT Companies",
  "Manufacturing",
] as const;
