import Image from "next/image";
import Link from "next/link";
import { SealStamp } from "@/components/brand/seal-stamp";
import { Reveal } from "@/components/motion/reveal";
import { brand, brandAssets } from "@/lib/brand";

export function BrandStory() {
  return (
    <section className="washi relative overflow-hidden px-5 py-20 text-ink md:px-8 md:py-28">
      <div className="pointer-events-none absolute inset-y-0 end-0 hidden w-[42%] md:block" aria-hidden="true">
        <Image
          src={brandAssets.heroNightWide}
          alt=""
          fill
          sizes="40vw"
          className="object-cover object-[70%_center] opacity-[0.14]"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-ivory/80 to-ivory" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 end-0 w-1/3 opacity-[0.06] md:opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 28px, #111211 28px, #111211 29px)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 md:grid-cols-[auto_1fr_1.1fr] md:items-end">
        <SealStamp size={72} tone="photo" whileInView />
        <Reveal variant="ink">
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.35em] text-seal">{brand.taglineEn}</p>
          <h2 className="mt-3 font-arabic-display text-4xl leading-tight md:text-5xl">فلسفة الظل</h2>
        </Reveal>
        <Reveal variant="fade" delay={0.06}>
          <p className="max-w-xl leading-8 text-ink/80">{brand.conceptLine}</p>
          <p className="mt-4 max-w-xl leading-8 text-ink/80">
            نستوحي من الدقة والهدوء لا من الزخرفة. العطر حضور يُحسّ قبل أن يُسمّى — دون ادّعاء منشأ أو مكونات لا نثبتها.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex min-h-11 items-center text-sm text-seal transition-colors hover:text-ink"
          >
            تصفّح العطور
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
