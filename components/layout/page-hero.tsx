import type { ReactNode } from "react";
import { SealStamp } from "@/components/brand/seal-stamp";
import { Reveal } from "@/components/motion/reveal";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Tighter vertical rhythm for utility pages such as the catalog. */
  compact?: boolean;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, description, compact = false, children }: PageHeroProps) {
  return (
    <header
      className={
        compact
          ? "relative overflow-hidden px-5 pb-6 pt-28 md:px-8 md:pb-8 md:pt-32"
          : "relative overflow-hidden px-5 pb-10 pt-28 md:px-8 md:pb-12 md:pt-32"
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(141,32,40,0.12),transparent_52%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-border to-transparent"
      />
      <div className="relative mx-auto flex max-w-7xl items-start gap-4">
        <SealStamp size={compact ? 32 : 36} className="mt-1 hidden sm:block" whileInView />
        <Reveal variant="rise" className="min-w-0 flex-1">
          <p className="text-sm text-brass">{eyebrow}</p>
          <h1
            className={
              compact
                ? "mt-2 max-w-3xl font-arabic-display text-4xl leading-[1.3] text-ivory md:text-5xl"
                : "mt-3 max-w-3xl font-arabic-display text-4xl leading-[1.35] text-ivory md:text-6xl"
            }
          >
            {title}
          </h1>
          <p className={compact ? "mt-3 max-w-xl leading-7 text-mist" : "mt-4 max-w-xl leading-8 text-mist"}>
            {description}
          </p>
          {children}
        </Reveal>
      </div>
    </header>
  );
}
