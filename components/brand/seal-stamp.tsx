"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BrandSeal } from "@/components/brand/brand-seal";
import { cn } from "@/lib/cn";
import { kageDuration, kageEaseStamp } from "@/lib/motion/tokens";

type SealStampProps = {
  size?: number;
  tone?: "red" | "light" | "photo";
  className?: string;
  /** Decorative seal — hides from assistive tech when true */
  decorative?: boolean;
  delay?: number;
  /** When true, only stamps once in view (for section bridges) */
  whileInView?: boolean;
};

/**
 * Tactile 影 hanko: brief scale+opacity stamp.
 * Keeps the seal crisp — no paper-grain filters on the glyph.
 */
export function SealStamp({
  size = 48,
  tone = "photo",
  className,
  decorative = false,
  delay = 0,
  whileInView = false,
}: SealStampProps) {
  const prefersReducedMotion = useReducedMotion();
  const seal = (
    <BrandSeal
      size={size}
      tone={tone}
      className={cn("rounded-sm", className)}
    />
  );

  if (prefersReducedMotion) {
    return decorative ? <div aria-hidden="true">{seal}</div> : seal;
  }

  const motionProps = whileInView
    ? {
        initial: { opacity: 0, scale: 1.18 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { once: true, margin: "-12% 0px" },
      }
    : {
        initial: { opacity: 0, scale: 1.18 },
        animate: { opacity: 1, scale: 1 },
      };

  return (
    <motion.div
      aria-hidden={decorative || undefined}
      className="relative inline-grid place-items-center"
      {...motionProps}
      transition={{
        duration: kageDuration.stamp,
        ease: kageEaseStamp,
        delay,
      }}
    >
      {/* Brief vermilion contact flash — opacity only, no blur */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-12%] rounded-sm bg-seal/25"
        initial={{ opacity: 0.55, scale: 0.92 }}
        {...(whileInView
          ? { whileInView: { opacity: 0, scale: 1.35 }, viewport: { once: true, margin: "-12% 0px" } }
          : { animate: { opacity: 0, scale: 1.35 } })}
        transition={{ duration: kageDuration.settle, ease: kageEaseStamp, delay: delay + 0.08 }}
      />
      {seal}
    </motion.div>
  );
}
