/**
 * Ambient background for the gateway. Pure CSS (no JS, no client boundary) so
 * it costs nothing on the critical path.
 */
export function GatewayBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft drifting colour fields. */}
      <div className="animate-drift-slow absolute -left-40 -top-40 size-[38rem] rounded-full bg-[oklch(0.52_0.11_195/0.16)] blur-3xl" />
      <div className="animate-drift-slower absolute -right-40 top-20 size-[34rem] rounded-full bg-[oklch(0.52_0.19_285/0.14)] blur-3xl" />
      <div className="animate-drift-slow absolute bottom-[-18rem] left-1/3 size-[32rem] rounded-full bg-[oklch(0.6_0.12_250/0.12)] blur-3xl" />

      {/* Fine grid, faded out toward the edges. */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
