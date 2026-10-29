import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { familyLabels } from "@/lib/catalog/labels";
import type { FragranceFamily } from "@/lib/catalog/types";

const roomClassName: Record<FragranceFamily, string> = {
  oriental: "bg-[#3a2218] text-cream",
  woody: "bg-[#1b2820] text-cream",
  floral: "bg-[#f7e3ea] text-ink",
};

type FamilySectionProps = {
  families: readonly FragranceFamily[];
};

export function FamilySection({ families }: FamilySectionProps) {
  if (families.length === 0) return null;
  return (
    <section id="families" className="scroll-mt-24 px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="max-w-xl font-arabic-display text-5xl leading-tight text-ink md:text-6xl">العائلات العطرية</h2>
          <p className="mt-5 max-w-md leading-8 text-ink/75">كل عائلة تفتح العطور المنشورة تحتها.</p>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {families.map((family) => {
            const label = familyLabels[family];
            const isLight = family === "floral";
            return (
              <Link
                key={family}
                href={`/catalog?family=${family}`}
                className={`card-lift group flex min-h-56 flex-col justify-end p-6 md:min-h-64 md:p-8 ${roomClassName[family]}`}
              >
                <p className={isLight ? "font-display text-lg italic text-bronze" : "font-display text-lg italic text-gold"}>
                  {label.en}
                </p>
                <h3 className="mt-2 font-arabic-display text-5xl">{label.ar}</h3>
                <p className={isLight ? "mt-4 max-w-xs leading-7 text-ink/70" : "mt-4 max-w-xs leading-7 text-cream/75"}>
                  {label.description}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm">
                  المجموعة
                  <ArrowLeft className="size-4 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
