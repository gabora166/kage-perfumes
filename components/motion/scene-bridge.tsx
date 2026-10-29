import { SealStamp } from "@/components/brand/seal-stamp";
import { cn } from "@/lib/cn";

type SceneBridgeProps = {
  /** Night cinematic → washi ivory, or the reverse */
  from: "night" | "washi";
  to: "night" | "washi";
  /** Place a single stamped 影 at the bridge midpoint */
  withSeal?: boolean;
  className?: string;
};

/**
 * Art-directed environment join between dark and ivory surfaces.
 * CSS gradients only — not a duplicated hero image.
 */
export function SceneBridge({ from, to, withSeal = false, className }: SceneBridgeProps) {
  const nightToWashi = from === "night" && to === "washi";
  const washiToNight = from === "washi" && to === "night";

  return (
    <div
      aria-hidden="true"
      className={cn("relative isolate h-14 w-full overflow-hidden md:h-20", className)}
    >
      {nightToWashi ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/80 to-ivory" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 washi opacity-90" />
          <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-l from-transparent via-seal/40 to-transparent" />
        </>
      ) : null}
      {washiToNight ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ink/40 to-ink" />
          <div className="absolute inset-x-0 top-0 h-1/2 washi opacity-80" />
          <div className="absolute inset-x-0 bottom-1/3 h-px bg-gradient-to-l from-transparent via-brass/35 to-transparent" />
        </>
      ) : null}
      {!nightToWashi && !washiToNight ? (
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-l from-transparent via-border to-transparent" />
      ) : null}
      {withSeal ? (
        <div className="absolute inset-0 grid place-items-center">
          <SealStamp size={28} tone="photo" decorative whileInView delay={0.05} />
        </div>
      ) : null}
    </div>
  );
}
