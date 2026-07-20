import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  count,
  size = "sm",
  showCount = true,
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  showCount?: boolean;
}) {
  const rounded = Math.round(rating);
  const starClass = size === "md" ? "size-4" : "size-3.5";

  return (
    <div className="flex items-center gap-1.5">
      {/* One accessible label rather than five announced star icons. */}
      <span
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of 5`}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            aria-hidden
            className={cn(
              starClass,
              i < rounded
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/35",
            )}
            strokeWidth={1.8}
          />
        ))}
      </span>

      {showCount && count != null && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
