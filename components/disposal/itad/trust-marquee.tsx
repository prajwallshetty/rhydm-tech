"use client";

const LOGOS = [
  "DELL TECHNOLOGIES",
  "Hewlett Packard Enterprise",
  "CISCO",
  "Lenovo",
  "IBM",
  "HITACHI",
  "accenture",
];

export function ItadTrustMarquee() {
  return (
    <section
      aria-label="Trusted by global enterprises"
      className="border-y border-slate-200/80 bg-white py-10"
    >
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-400">
          Trusted by Fortune 500 & Global Enterprise IT Teams
        </p>
      </div>

      <div
        className="relative mt-7 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <div className="animate-marquee flex w-max items-center gap-20 pr-20">
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <span
              key={`${logo}-${i}`}
              aria-hidden={i >= LOGOS.length}
              className="text-base font-extrabold tracking-wider text-slate-400 transition-colors duration-300 hover:text-slate-800 cursor-pointer select-none"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
