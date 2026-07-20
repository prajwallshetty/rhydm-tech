import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/business";

type LogoProps = {
  className?: string;
  /** Hides the wordmark, leaving just the mark. */
  markOnly?: boolean;
  /** Whether to show the shield checkmark badge in front of the brand name. */
  showShield?: boolean;
};

export function Logo({ className, markOnly = false, showShield = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showShield && (
        <span
          aria-hidden
          className="relative grid size-9 place-items-center rounded-xl bg-[#2E6F40] text-white shadow-sm"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-5 text-white"
          >
            <path
              d="M12 2.5 20 6v6.2c0 4.6-3.2 8-8 9.3-4.8-1.3-8-4.7-8-9.3V6l8-3.5Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="m8.6 12.1 2.3 2.3 4.5-4.6"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      {!markOnly && (
        <span className="text-[16px] font-extrabold tracking-tight text-slate-900">
          {COMPANY.name}
        </span>
      )}
    </span>
  );
}
