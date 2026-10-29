import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { BrandSeal } from "@/components/brand/brand-seal";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { brandAssets } from "@/lib/brand";
import { formatPrice } from "@/lib/catalog/money";
import { sampleSizeMl } from "@/lib/catalog/samples";
import type { DiscoverySet } from "@/lib/catalog/samples";

type DiscoveryBandProps = {
  discoverySet: DiscoverySet | null;
};

export function DiscoveryBand({ discoverySet }: DiscoveryBandProps) {
  const isPublished = discoverySet?.isPublished === true;
  const canOrder = isPublished && (discoverySet?.stockCount ?? 0) > 0;
  const vials = discoverySet?.vials ?? [];
  return (
    <section className="relative overflow-hidden border-y border-border bg-panel text-ivory">
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src={brandAssets.campaigns.discovery}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.38]"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-panel via-panel/92 to-panel/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_50%,rgba(184,178,167,0.1),transparent_55%)]" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-stretch md:gap-12 md:px-8 md:py-24">
        <Reveal variant="rise" className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <BrandSeal size={28} tone="photo" className="rounded-sm" />
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.38em] text-brass">Discovery</p>
          </div>
          <h2 className="mt-4 font-arabic-display text-5xl leading-tight text-ivory md:text-6xl">مجموعة الاكتشاف</h2>
          <p className="mt-6 max-w-xl leading-8 text-mist">
            عيّنة {sampleSizeMl} مل تُرتدى على الجلد قبل اختيار الحجم. مجموعة الاكتشاف تجمع العيّنات المنشورة في طلب
            واحد، ومخزونها مستقل عن عيّنات العطور المفردة.
          </p>
          <div className="mt-8">
            <MagneticButton href="/discovery">
              صفحة الاكتشاف
              <ArrowLeft className="size-4" />
            </MagneticButton>
          </div>
        </Reveal>
        <Reveal variant="fade" delay={0.1} className="relative border border-ink/10 bg-ivory p-7 text-ink md:p-10">
          <span aria-hidden="true" className="pointer-events-none absolute inset-3 border border-ink/8" />
          {isPublished && discoverySet ? (
            <>
              <p className="text-sm text-ink/70">{sampleSizeMl} مل لكل قارورة</p>
              <p className="mt-3 font-arabic-display text-4xl">{discoverySet.nameAr}</p>
              <p className="mt-2 font-display text-2xl italic text-ink/75">{discoverySet.nameEn}</p>
              <div className="mt-6 flex items-end justify-between gap-4 border-t border-ink/10 pt-5">
                <p dir="ltr" className="font-display text-5xl text-ink">
                  {formatPrice(discoverySet.priceSar)}
                </p>
                <p className="text-sm text-ink/70">{canOrder ? "متاحة الآن" : "نفدت حاليًا"}</p>
              </div>
              {vials.length > 0 ? (
                <ul className="mt-7 space-y-3">
                  {vials.map((vial) => (
                    <li key={vial.productId} className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="font-arabic-display text-2xl">{vial.nameAr}</span>
                      <span className="text-ink/65">{sampleSizeMl} مل</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-sm leading-7 text-ink/70">لا عيّنات داخل المجموعة الآن.</p>
              )}
            </>
          ) : (
            <p className="leading-8 text-ink/70">
              مجموعة الاكتشاف غير منشورة حاليًا. عيّنات {sampleSizeMl} مل تبقى في صفحة كل عطر حين يكون لها مخزون.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
