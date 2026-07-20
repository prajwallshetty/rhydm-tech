import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/business";

type LogoProps = {
  className?: string;
  /** Hides the wordmark, leaving just the mark. */
  markOnly?: boolean;
};

export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="relative grid size-9 place-items-center rounded-xl bg-linear-to-br from-brand to-brand/70 shadow-sm"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-5 text-brand-foreground"
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

      {!markOnly && (
        <span className="text-[15px] font-semibold tracking-tight">
          {COMPANY.name}
        </span>
      )}
    </span>
  );
}
