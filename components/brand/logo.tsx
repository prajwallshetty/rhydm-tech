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
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {showShield && (
        <img
          src="/icon.png"
          alt={COMPANY.name}
          className="size-10 sm:size-12 object-contain shrink-0"
        />
      )}

      {!markOnly && (
        <span className="text-xl sm:text-2xl font-black tracking-tight text-[#2E6F40]">
          {COMPANY.name}
        </span>
      )}
    </span>
  );
}
