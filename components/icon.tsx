import {
  Award,
  Clock,
  Eraser,
  HardDrive,
  Leaf,
  Lock,
  Package,
  Recycle,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps icon keys to Lucide components. Data modules and the CMS store icons as
 * plain strings, since React components cannot cross the Server/Client
 * boundary as props and cannot be persisted to the database.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  eraser: Eraser,
  hardDrive: HardDrive,
  recycle: Recycle,
  truck: Truck,
  package: Package,
  certificate: Award,
  clock: Clock,
  leaf: Leaf,
  lock: Lock,
};

export type IconName = keyof typeof ICON_MAP;

export function Icon({
  name,
  className,
  strokeWidth = 1.6,
}: {
  /** Accepts any string: icon names come from the CMS and may not match. */
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  // Unknown keys fall back rather than crashing the page — an editor typing a
  // bad icon name in the admin panel should not take down the site.
  const Component = ICON_MAP[name] ?? ShieldCheck;
  return <Component aria-hidden className={className} strokeWidth={strokeWidth} />;
}
