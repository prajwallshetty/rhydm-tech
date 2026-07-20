import { cn } from "@/lib/utils";

/**
 * Placeholder product imagery.
 *
 * The catalog has no photography yet, so rather than shipping broken <img>
 * tags this renders a deterministic gradient and device silhouette derived
 * from the product's category and slug. It reads as intentional art direction
 * instead of a missing asset, and costs no network requests.
 *
 * Replace with <Image> once ProductImage rows carry real URLs.
 */

const GLYPHS: Record<string, React.ReactNode> = {
  laptops: (
    <>
      <rect x="14" y="16" width="44" height="29" rx="2.5" />
      <path d="M8 49h56l-3.5 5.5H11.5L8 49Z" />
    </>
  ),
  desktops: (
    <>
      <rect x="20" y="12" width="24" height="40" rx="2.5" />
      <circle cx="32" cy="20" r="1.6" />
      <path d="M50 22h10M50 30h10M50 38h10" />
    </>
  ),
  servers: (
    <>
      <rect x="12" y="14" width="48" height="12" rx="2" />
      <rect x="12" y="30" width="48" height="12" rx="2" />
      <rect x="12" y="46" width="48" height="12" rx="2" />
      <circle cx="19" cy="20" r="1.4" />
      <circle cx="19" cy="36" r="1.4" />
      <circle cx="19" cy="52" r="1.4" />
    </>
  ),
  networking: (
    <>
      <rect x="10" y="26" width="52" height="18" rx="2.5" />
      <path d="M17 33h5M26 33h5M35 33h5M44 33h5M17 38h5M26 38h5M35 38h5M44 38h5" />
      <circle cx="55" cy="35" r="2" />
    </>
  ),
  monitors: (
    <>
      <rect x="10" y="14" width="52" height="33" rx="2.5" />
      <path d="M30 47v7M42 47v7M26 54h20" />
    </>
  ),
  storage: (
    <>
      <rect x="16" y="18" width="40" height="36" rx="3" />
      <circle cx="36" cy="36" r="10" />
      <circle cx="36" cy="36" r="2.4" />
    </>
  ),
  components: (
    <>
      <rect x="20" y="20" width="32" height="32" rx="2.5" />
      <rect x="28" y="28" width="16" height="16" rx="1.5" />
      <path d="M26 14v6M36 14v6M46 14v6M26 52v6M36 52v6M46 52v6M14 26h6M14 36h6M14 46h6M52 26h6M52 36h6M52 46h6" />
    </>
  ),
  accessories: (
    <>
      <rect x="10" y="24" width="38" height="24" rx="3" />
      <path d="M17 31h4M25 31h4M33 31h4M17 39h20" />
      <circle cx="58" cy="36" r="6" />
    </>
  ),
};

/** Hue pairs per category, kept in the same family as the store's indigo. */
const PALETTES: Record<string, [number, number]> = {
  laptops: [285, 250],
  desktops: [250, 220],
  servers: [265, 300],
  networking: [200, 250],
  monitors: [285, 320],
  storage: [230, 265],
  components: [300, 270],
  accessories: [255, 210],
};

function hashSlug(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 1000;
  }
  return hash;
}

export function ProductThumb({
  slug,
  category,
  name,
  className,
  /** Subtle shift used for the card's hover ("second angle") image. */
  variant = "primary",
}: {
  slug: string;
  category: string;
  name: string;
  className?: string;
  variant?: "primary" | "hover";
}) {
  const [hueA, hueB] = PALETTES[category] ?? PALETTES.laptops;
  const drift = hashSlug(slug) % 24;
  const shift = variant === "hover" ? 18 : 0;

  const from = `oklch(0.62 0.13 ${hueA + drift + shift})`;
  const to = `oklch(0.48 0.16 ${hueB + drift + shift})`;

  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-xl",
        className,
      )}
      style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
    >
      {/* Soft highlight so the flat gradient reads as a lit surface. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 30% 22%, rgba(255,255,255,0.28), transparent 70%)",
        }}
      />

      <svg
        viewBox="0 0 72 72"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label={name}
        className={cn(
          "relative w-[52%] max-w-[180px] opacity-90 transition-transform duration-500",
          variant === "hover" && "scale-105",
        )}
      >
        {GLYPHS[category] ?? GLYPHS.laptops}
      </svg>
    </div>
  );
}
