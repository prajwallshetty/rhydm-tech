"use client";

import { Maximize2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { ProductThumb } from "@/components/store/product-thumb";
import { cn } from "@/lib/utils";

/**
 * Gallery with zoom-on-hover. Views are placeholder renders until real
 * photography exists — see ProductThumb. Each entry maps to a `common.view*`
 * label.
 */
const VIEW_KEYS = ["viewFront", "viewAngle", "viewPorts", "viewDetail"] as const;

export function ProductGallery({
  slug,
  category,
  name,
  overrideImages,
}: {
  slug: string;
  category: string;
  name: string;
  overrideImages?: string[];
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const t = useTranslations("common");

  return (
    <div className="space-y-4">
      <div
        className="group relative aspect-square overflow-hidden rounded-2xl border border-border/80 bg-muted/40 p-6"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          setOrigin(`${x}% ${y}%`);
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <ProductThumb
          slug={`${slug}-${active}`}
          category={category}
          name={t("viewSuffix", { name, view: t(VIEW_KEYS[active]) })}
          variant={active % 2 === 0 ? "primary" : "hover"}
          className={cn(
            "absolute inset-6 transition-transform duration-300",
            zoomed && "scale-150",
          )}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-6"
          style={{ transformOrigin: origin }}
        />

        <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-3" />
          {t("hoverToZoom")}
        </span>

        {/* 360° placeholder, per the brief — not yet wired to a spin sequence. */}
        <button
          type="button"
          className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur transition-colors hover:text-brand"
          title="360° view coming soon"
        >
          <RotateCcw className="size-3" />
          360°
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {VIEW_KEYS.map((viewKey, index) => (
          <button
            key={viewKey}
            type="button"
            onClick={() => setActive(index)}
            aria-label={t("showView", { view: t(viewKey) })}
            aria-pressed={active === index}
            className={cn(
              "relative aspect-square overflow-hidden rounded-xl border p-2 transition-colors",
              active === index
                ? "border-brand"
                : "border-border/80 hover:border-brand/40",
            )}
          >
            <ProductThumb
              slug={`${slug}-${index}`}
              category={category}
              name={`${name} — ${t(viewKey)}`}
              variant={index % 2 === 0 ? "primary" : "hover"}
              className="absolute inset-2"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
