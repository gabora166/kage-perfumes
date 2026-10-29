import { InkCircleMotif } from "@/components/brand/ink-circle-motif";
import { Reveal } from "@/components/motion/reveal";
import { brand } from "@/lib/brand";

type CatalogHeroProps = {
  title?: string;
  description?: string;
};

export function CatalogHero({
  title = "عطور الدار",
  description = "شرقية، خشبية، وزهرية — كل عطر باسمه والحجم والسعر كما تحسبه الدار.",
}: CatalogHeroProps) {
  return (
    <header className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[min(52vw,26rem)] max-md:top-0 max-md:h-32 max-md:w-full md:-left-4"
      >
        <InkCircleMotif className="absolute left-[-6%] top-[42%] h-[min(42vh,19rem)] w-auto -translate-y-1/2 text-seal opacity-[0.38] max-md:left-1/2 max-md:top-4 max-md:h-28 max-md:-translate-x-1/2 max-md:translate-y-0 max-md:opacity-[0.22]" />
        <LeafSilhouette className="absolute left-[8%] top-[22%] h-40 w-40 text-seal/45 max-md:left-1/2 max-md:top-2 max-md:h-24 max-md:w-24 max-md:-translate-x-1/2" />
        <LeafSilhouette className="absolute left-[22%] top-[48%] h-28 w-28 rotate-12 text-seal/28 max-md:hidden" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0e0f0e]/40 to-[#0e0f0e] max-md:bg-gradient-to-b max-md:from-transparent max-md:to-[#0e0f0e]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 pb-3 pt-[6.75rem] md:px-8 md:pb-3.5 md:pt-[7.25rem]">
        <Reveal variant="rise" className="flex items-start gap-3 text-start md:gap-4">
          <span className="mt-1 hidden shrink-0 flex-col items-center gap-1.5 sm:flex" aria-hidden="true">
            <span className="h-9 w-px bg-gradient-to-b from-brass/80 via-brass/30 to-transparent" />
            <span className="size-1 rotate-45 border border-brass/70" />
            <span
              className="mt-0.5 font-jp text-[0.58rem] leading-none tracking-[0.32em] text-brass/70"
              style={{ writingMode: "vertical-rl" }}
            >
              カゲ
            </span>
          </span>
          <div className="min-w-0 max-w-2xl">
            <p className="text-[0.72rem] tracking-wide text-brass">
              مجموعة {brand.name} · {brand.city}
            </p>
            <h1 className="mt-2 max-w-2xl font-arabic-display text-[2.05rem] leading-[1.15] text-ivory md:text-[2.85rem]">
              {title}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-7 text-mist">{description}</p>
          </div>
        </Reveal>
      </div>
    </header>
  );
}

function LeafSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="currentColor" aria-hidden="true">
      <path d="M78 18c22 18 38 42 42 72-18 8-40 10-58 4 4-26 10-52 16-76Z" opacity="0.55" />
      <path d="M52 46c18 14 28 34 30 56-16 4-32 2-46-6 6-18 10-34 16-50Z" opacity="0.4" />
      <path d="M108 54c12 16 18 34 16 52-14 2-28-2-40-10 8-14 16-28 24-42Z" opacity="0.35" />
    </svg>
  );
}
