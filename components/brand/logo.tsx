"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/business";

/**
 * Brand assets are pre-trimmed of the transparent margin the original
 * `/logo.png` carried (2172x724 canvas around 1925x593 of artwork), so the
 * logo optically fills the height it is given instead of floating inside it.
 *
 * The wordmark's second line ("Technologies") sits at ~24% of the lockup's
 * height, so it needs roughly 40px of lockup height to stay legible. Below
 * that — and on viewports too narrow to fit a 130px lockup next to the nav
 * actions — `variant="auto"` swaps in the emblem instead of shrinking the
 * lockup into an unreadable smudge.
 */
import { useLogo } from "./logo-provider";

const LOCKUP = { src: "/brand/rhydm-logo.png", width: 1200, height: 370 };
const MARK = { src: "/brand/rhydm-mark.png", width: 256, height: 256 };

type LogoProps = {
  /** Height utilities go here (e.g. `h-10`); width is derived from the aspect. */
  className?: string;
  /**
   * `auto` — emblem under 400px, full lockup above (the navbar default).
   * `lockup` — always the full horizontal logo.
   * `mark` — always the emblem.
   */
  variant?: "auto" | "lockup" | "mark";
  /** Set on above-the-fold headers so the logo is not lazy-loaded. */
  priority?: boolean;
  /**
   * Pass `""` where the surrounding link already carries a visible or
   * screen-reader label, so the name is not announced twice.
   */
  alt?: string;
};

export function Logo({
  className,
  variant = "lockup",
  priority = false,
  alt = COMPANY.name,
}: LogoProps) {
  const logoUrl = useLogo();

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={alt}
        className={cn("h-10 w-auto object-contain", className)}
      />
    );
  }

  if (variant === "mark") {
    return (
      <Image
        {...MARK}
        alt={alt}
        priority={priority}
        sizes="64px"
        className={cn("h-10 w-auto object-contain", className)}
      />
    );
  }

  if (variant === "lockup") {
    return (
      <Image
        {...LOCKUP}
        alt={alt}
        priority={priority}
        sizes="300px"
        className={cn("h-10 w-auto object-contain", className)}
      />
    );
  }

  // auto — both are in the tree but each is `display:none` outside its
  // breakpoint, which also takes it out of the accessibility tree, so the
  // shared alt text is announced exactly once. The visibility utilities are
  // merged last so a caller's `className` cannot clobber them.
  return (
    <>
      <Image
        {...MARK}
        alt={alt}
        priority={priority}
        sizes="64px"
        className={cn("h-9 w-auto object-contain", className, "xs:hidden")}
      />
      <Image
        {...LOCKUP}
        alt={alt}
        priority={priority}
        sizes="300px"
        className={cn("h-10 w-auto object-contain", className, "hidden xs:block")}
      />
    </>
  );
}
