/**
 * Infinite grayscale logo marquee. Placeholder wordmarks until real client
 * logos exist — text set in heavy tracking reads as a logo wall without
 * shipping fake image assets. Uses the shared `.animate-marquee` keyframes.
 */
const LOGOS = [
  "Microsoft",
  "Shopify",
  "Airbnb",
  "Embraer",
  "Pleo",
  "Remote",
  "Canva",
  "Dell",
];

export function ItadTrustMarquee() {
  return (
    <section
      aria-label="Trusted by global enterprises"
      className="border-y border-gray-200 bg-slate-50 py-12"
    >
      <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
        Trusted by Global Enterprises
      </p>

      <div
        className="relative mt-8 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div className="animate-marquee flex w-max items-center gap-16 pr-16">
          {/* List rendered twice so the loop is seamless. */}
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <span
              key={`${logo}-${i}`}
              aria-hidden={i >= LOGOS.length}
              className="text-2xl font-extrabold tracking-tight text-gray-400 transition-colors hover:text-gray-600"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
