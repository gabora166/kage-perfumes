"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { SealStamp } from "@/components/brand/seal-stamp";
import { Wordmark } from "@/components/brand/wordmark";
import { brand, brandAssets } from "@/lib/brand";
import type { Product } from "@/lib/catalog/types";
import { kageDuration, kageEase } from "@/lib/motion/tokens";

type HeroProps = {
  /** Featured product for a text-only path — never shown as a second bottle over campaign art */
  product: Product | null;
};

const ease = kageEase;

/**
 * Campaign plate already includes atmospheric bottle artwork.
 * HTML carries all readable copy. Do not stack ProductVisual on top.
 */
export function Hero({ product }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const instant = Boolean(prefersReducedMotion);

  return (
    <section className="relative isolate min-h-[min(100svh,48rem)] overflow-hidden bg-ink text-ivory md:min-h-[min(100svh,52rem)]">
      <div className="absolute inset-0" aria-hidden="true">
        <motion.div
          className="absolute inset-0"
          initial={instant ? false : { opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: instant ? 0 : kageDuration.cinematic, ease }}
        >
          <div className="absolute inset-0 hero-scene-plate">
            <Image
              src={brandAssets.heroWide}
              alt=""
              fill
              priority
              sizes="100vw"
              className="hidden object-cover object-[72%_center] md:block"
            />
            <Image
              src={brandAssets.heroPortrait}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_58%] md:hidden"
            />
          </div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute -top-[8%] start-[4%] size-[42vmin] md:start-[12%] md:size-[34vmin]"
          initial={instant ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: instant ? 0 : 0.9, ease, delay: instant ? 0 : 0.08 }}
        >
          <div className="moon-bloom size-full rounded-full bg-[radial-gradient(circle,rgba(234,226,211,0.22)_0%,rgba(141,32,40,0.08)_38%,transparent_68%)]" />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={instant ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: instant ? 0 : 0.75, ease, delay: instant ? 0 : 0.14 }}
        >
          <div className="absolute inset-x-[-10%] bottom-[-6%] h-[52%] bg-gradient-to-t from-ink via-ink/55 to-transparent mist-drift" />
          <div className="absolute inset-x-[-16%] top-[18%] h-[38%] bg-gradient-to-b from-transparent via-ivory/[0.04] to-transparent mist-drift-slow" />
        </motion.div>

        {/* RTL text lives on the start edge; bottle lives on the end / lower frame */}
        <div className="absolute inset-0 bg-gradient-to-l from-ink/95 via-ink/55 to-ink/15 md:from-ink/92 md:via-ink/42 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/55 md:via-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink via-ink/80 to-transparent md:h-36" />

        {!instant ? (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[1] bg-ink"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.65, ease }}
          />
        ) : null}
      </div>

      <div className="relative z-[2] mx-auto flex min-h-[min(100svh,48rem)] max-w-7xl flex-col justify-end px-5 pb-12 pt-28 md:min-h-[min(100svh,52rem)] md:px-8 md:pb-20 md:pt-36">
        <div className="max-w-xl lg:max-w-2xl">
          <motion.div
            className="flex items-center gap-3"
            initial={instant ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: instant ? 0 : kageDuration.settle, ease, delay: instant ? 0 : 0.28 }}
          >
            <SealStamp size={48} tone="photo" delay={instant ? 0 : 0.24} />
            <Wordmark className="text-2xl tracking-[0.34em] md:text-3xl" />
          </motion.div>

          <motion.p
            className="mt-7 font-sans text-[0.72rem] uppercase tracking-[0.38em] text-brass"
            initial={instant ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: instant ? 0 : kageDuration.settle, ease, delay: instant ? 0 : 0.4 }}
          >
            {brand.taglineEn}
          </motion.p>

          <motion.h1
            className="mt-4 max-w-[18ch] font-arabic-display text-[1.95rem] leading-[1.38] text-ivory drop-shadow-[0_2px_28px_rgba(0,0,0,0.7)] sm:text-[2.2rem] md:max-w-xl md:text-5xl lg:text-[3.35rem]"
            initial={instant ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: instant ? 0 : kageDuration.cinematic, ease, delay: instant ? 0 : 0.46 }}
          >
            {brand.tagline}
          </motion.h1>

          <motion.p
            className="mt-4 max-w-md text-[0.95rem] leading-8 text-ivory/85 md:mt-5 md:text-lg"
            initial={instant ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: instant ? 0 : kageDuration.settle, ease, delay: instant ? 0 : 0.56 }}
          >
            {brand.supportLine}
          </motion.p>

          <motion.div
            className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center"
            initial={instant ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: instant ? 0 : kageDuration.quick, ease, delay: instant ? 0 : 0.6 }}
          >
            <Link
              href="/catalog"
              className="cta-shine pressable relative inline-flex h-12 min-w-[11rem] items-center justify-center gap-2 overflow-hidden bg-seal px-7 text-sm text-ivory shadow-[0_12px_40px_rgba(141,32,40,0.35)]"
            >
              اكتشف العطور
              <ArrowLeft className="size-4" />
            </Link>
            <Link
              href="/discovery"
              className="pressable inline-flex h-12 items-center justify-center border border-ivory/30 bg-ink/25 px-6 text-sm text-ivory/90 transition-colors hover:border-ivory/50 hover:bg-ink/45 hover:text-ivory"
            >
              مجموعة الاكتشاف
            </Link>
          </motion.div>

          {product ? (
            <motion.p
              className="mt-6 border-t border-ivory/15 pt-4 text-sm text-mist"
              initial={instant ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: instant ? 0 : kageDuration.quick, ease, delay: instant ? 0 : 0.72 }}
            >
              من المختارات ·{" "}
              <Link href={`/catalog/${product.slug}`} className="text-ivory transition-colors hover:text-brass">
                {product.nameAr}
              </Link>
              <span className="mx-2 text-ivory/25" aria-hidden="true">
                ·
              </span>
              <span className="text-mist/80">العمل الفني خلفي — ليس صورة للمنتج</span>
            </motion.p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
