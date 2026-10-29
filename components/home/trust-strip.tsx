"use client";

import Link from "next/link";
import { ArrowLeft, FlaskConical, ShieldCheck, Truck } from "lucide-react";
import { InkCircleMotif } from "@/components/brand/ink-circle-motif";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { trustOfferBand, trustPolicyPaths } from "@/lib/trust/offers";

const icons = {
  shipping: Truck,
  tester: FlaskConical,
  refund: ShieldCheck,
} as const;

export function TrustStrip() {
  return (
    <section
      aria-labelledby="trust-offer-heading"
      className="trust-obsidian relative overflow-hidden border-y border-ivory/8 text-ivory"
    >
      <TrustBrushMotif />
      <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid items-end gap-10 lg:grid-cols-2 lg:gap-16">
          {/* First in RTL = visual right: editorial copy */}
          <Reveal variant="ink" className="text-start lg:max-w-xl">
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.38em] text-brass">Trust</p>
            <div className="mt-5 h-px w-16 bg-gradient-to-l from-brass/70 to-transparent" aria-hidden="true" />
            <h2
              id="trust-offer-heading"
              className="mt-6 font-arabic-display text-4xl leading-[1.25] text-ivory md:text-5xl lg:text-6xl"
            >
              {trustOfferBand.headline}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-8 text-mist md:text-[0.95rem]">
              {trustOfferBand.support}
            </p>
          </Reveal>
          {/* Visual left column reserves space for the brush motif */}
          <div className="pointer-events-none hidden min-h-44 lg:block" aria-hidden="true" />
        </div>

        <Stagger
          className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-5"
          delay={0.08}
        >
          {trustOfferBand.benefits.map((benefit) => {
            const Icon = icons[benefit.key as keyof typeof icons];
            return (
              <StaggerItem key={benefit.key} className="h-full">
                <Link
                  href={benefit.href}
                  className="trust-benefit group flex h-full min-h-36 flex-col gap-5 border border-ivory/14 bg-ink/35 px-5 py-6 outline-offset-4 transition-[border-color,background-color] duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass md:px-6 md:py-7"
                >
                  <span className="trust-benefit-icon grid size-12 place-items-center rounded-full border border-ivory/20 text-brass transition-transform duration-300 ease-out motion-reduce:transition-none">
                    <Icon className="size-5" aria-hidden="true" strokeWidth={1.35} />
                  </span>
                  <span className="font-arabic-display text-2xl leading-snug text-ivory md:text-[1.65rem]">
                    {benefit.label}
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.16} variant="fade">
          <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-mist/80">
            <span>التفاصيل في</span>
            <Link
              href={trustPolicyPaths.delivery}
              className="inline-flex items-center gap-1.5 text-brass underline-offset-4 transition-colors hover:text-ivory hover:underline"
            >
              التوصيل
              <ArrowLeft className="size-3.5 opacity-70" aria-hidden="true" />
            </Link>
            <span className="text-ivory/25" aria-hidden="true">
              ·
            </span>
            <Link
              href={trustPolicyPaths.returns}
              className="inline-flex items-center gap-1.5 text-brass underline-offset-4 transition-colors hover:text-ivory hover:underline"
            >
              الإرجاع
              <ArrowLeft className="size-3.5 opacity-70" aria-hidden="true" />
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function TrustBrushMotif() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 w-[min(92vw,36rem)] opacity-[0.22] max-lg:inset-x-0 max-lg:top-0 max-lg:h-56 max-lg:w-full max-lg:opacity-[0.14] lg:-left-8"
    >
      <InkCircleMotif className="absolute left-[-8%] top-1/2 h-[min(78vh,34rem)] w-auto -translate-y-1/2 max-lg:left-1/2 max-lg:top-8 max-lg:h-48 max-lg:-translate-x-1/2 max-lg:translate-y-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ink max-lg:bg-gradient-to-b max-lg:from-transparent max-lg:via-ink/40 max-lg:to-ink" />
    </div>
  );
}
