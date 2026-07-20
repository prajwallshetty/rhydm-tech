"use client";

import Link from "next/link";
import { Repeat2 } from "lucide-react";

import { SWITCH_PARAM } from "@/lib/business";
import { cn } from "@/lib/utils";

/**
 * Returns the visitor to the gateway. The `?switch=1` flag tells `proxy.ts` to
 * skip the saved-division redirect that would otherwise bounce them straight
 * back here. The stored preference is left intact and simply overwritten when
 * they pick again.
 */
export function SwitchBusiness({ className }: { className?: string }) {
  return (
    <Link
      href={`/?${SWITCH_PARAM}=1`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      <Repeat2 aria-hidden className="size-4" strokeWidth={1.8} />
      Switch Business
    </Link>
  );
}
