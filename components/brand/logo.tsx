import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/business";

type LogoProps = {
  className?: string;
  /** Hides the wordmark, leaving just the mark. */
  markOnly?: boolean;
  /** Whether to show the icon badge in front of the brand name. */
  showShield?: boolean;
};

export function Logo({ className, markOnly = false, showShield = true }: LogoProps) {
  if (markOnly) {
    return (
      <img
        src="/favicon.svg"
        alt={COMPANY.name}
        className={cn("size-10 sm:size-12 object-contain shrink-0", className)}
      />
    );
  }

  return (
    <img
      src="/logo.png"
      alt={COMPANY.name}
      className={cn("h-14 sm:h-16 w-auto object-contain shrink-0", className)}
    />
  );
}
