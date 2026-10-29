"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import type { RevealPreset } from "@/lib/motion/presets";
import { kageDistance, kageDuration, kageEase } from "@/lib/motion/tokens";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealPreset;
  once?: boolean;
};

const variants: Record<
  RevealPreset,
  {
    initial: { opacity: number; y?: number; scale?: number; clipPath?: string };
    animate: { opacity: number; y?: number; scale?: number; clipPath?: string };
  }
> = {
  /** F1 Editorial Fade (+ small rise) */
  rise: {
    initial: { opacity: 0, y: kageDistance.riseY },
    animate: { opacity: 1, y: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  /** F4 Ink Reveal */
  ink: {
    initial: { opacity: 0, y: kageDistance.microY, clipPath: "inset(0 0 88% 0)" },
    animate: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" },
  },
  /** F3 Masked Reveal */
  mask: {
    initial: { opacity: 0, clipPath: "inset(0 12% 0 12%)" },
    animate: { opacity: 1, clipPath: "inset(0 0% 0 0%)" },
  },
  /** F5 Depth Entrance */
  depth: {
    initial: { opacity: 0, y: kageDistance.microY, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
  },
};

export function Reveal({
  children,
  className,
  delay = 0,
  variant = "rise",
  once = true,
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }
  const motionVariant = variants[variant];
  const duration =
    variant === "ink" || variant === "mask" ? kageDuration.section : kageDuration.settle;
  return (
    <motion.div
      className={className}
      initial={motionVariant.initial}
      whileInView={motionVariant.animate}
      viewport={{ once, margin: "-10% 0px" }}
      transition={{
        duration,
        ease: kageEase,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
