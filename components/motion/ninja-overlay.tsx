"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { brand, brandAssets } from "@/lib/brand";
import type { TransitionIntensity } from "@/lib/motion/navigation";
import { kageDuration, kageEase, kageEaseSlash, kageEaseStamp } from "@/lib/motion/tokens";

export type NinjaPhase = "idle" | "covering" | "holding" | "revealing";

type NinjaOverlayProps = {
  phase: NinjaPhase;
  intensity: TransitionIntensity;
};

/**
 * Full-viewport transition plate — shadow passage, ink slash, vermilion seal.
 * Decorative only; aria-hidden. Does not trap focus.
 */
export function NinjaOverlay({ phase, intensity }: NinjaOverlayProps) {
  const prefersReducedMotion = useReducedMotion();
  const active = phase !== "idle";
  const reduce = Boolean(prefersReducedMotion);
  const soft = intensity === "soft" || reduce;

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key="ninja-plate"
          className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
          aria-hidden="true"
          data-ninja-phase={phase}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12, ease: kageEase } }}
        >
          {soft ? <SoftPlate phase={phase} /> : <NinjaPlate phase={phase} />}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** A — Shadow Vanish + D — Mist Reveal (restrained atmospheric wash). */
function SoftPlate({ phase }: { phase: NinjaPhase }) {
  const covered = phase === "covering" || phase === "holding";
  return (
    <>
      <motion.div
        className="absolute inset-0 bg-ink"
        initial={{ opacity: 0 }}
        animate={{ opacity: covered ? 1 : 0 }}
        transition={{ duration: kageDuration.softWipe, ease: kageEase }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,226,211,0.08),transparent_62%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: covered ? 1 : 0 }}
        transition={{ duration: kageDuration.softWipe, ease: kageEase, delay: 0.04 }}
      />
    </>
  );
}

function NinjaPlate({ phase }: { phase: NinjaPhase }) {
  const covered = phase === "covering" || phase === "holding";
  const revealing = phase === "revealing";
  return (
    <>
      <motion.div
        className="absolute inset-0 bg-ink"
        initial={{ clipPath: "inset(0 0 0 100%)" }}
        animate={
          covered
            ? { clipPath: "inset(0 0 0 0%)" }
            : revealing
              ? { clipPath: "inset(0 100% 0 0%)" }
              : { clipPath: "inset(0 0 0 100%)" }
        }
        transition={{
          duration: covered ? kageDuration.ninjaCover : kageDuration.ninjaReveal,
          ease: kageEaseSlash,
        }}
      />

      {phase === "covering" ? (
        <motion.div
          className="absolute inset-y-0 w-[38%] text-ivory/10"
          initial={{ x: "120%", opacity: 0 }}
          animate={{ x: "-140%", opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: kageDuration.ninjaCover, ease: kageEaseSlash }}
          style={{ right: 0 }}
        >
          <NinjaSilhouette className="h-full w-full" />
        </motion.div>
      ) : null}

      {(phase === "covering" || phase === "holding") && (
        <motion.div
          className="absolute start-1/2 top-[42%] h-[2px] w-[120%] origin-center -translate-x-1/2 -rotate-[18deg] bg-gradient-to-l from-transparent via-ivory/55 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: [0, 1, 0.35] }}
          transition={{ duration: 0.28, ease: kageEaseSlash, delay: 0.06 }}
        />
      )}

      <motion.div
        className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 1.35, rotate: -8 }}
        animate={covered ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.92, rotate: 4 }}
        transition={{ duration: kageDuration.stamp, ease: kageEaseStamp, delay: covered ? 0.12 : 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brandAssets.emblem}
          alt=""
          width={72}
          height={72}
          className="size-[4.5rem] drop-shadow-[0_0_24px_rgba(141,32,40,0.45)]"
          decoding="async"
        />
        <span className="sr-only">{brand.name}</span>
      </motion.div>

      {phase === "holding" ? (
        <motion.div
          className="absolute inset-x-0 bottom-[18%] mx-auto h-px w-16 bg-seal/70"
          initial={{ scaleX: 0.4, opacity: 0.4 }}
          animate={{ scaleX: [0.4, 1, 0.4], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
        />
      ) : null}
    </>
  );
}

/** Geometric cloak silhouette — no cartoon character, no emoji. */
function NinjaSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 320" className={className} fill="currentColor" aria-hidden="true">
      <path d="M60 8 78 42 72 58 48 58 42 42Z" opacity="0.95" />
      <path d="M38 58h44l18 70-12 16H32l-12-16Z" opacity="0.85" />
      <path d="M28 148h64l22 150H8Z" opacity="0.75" />
      <path d="M20 140c-18 36-28 78-24 120" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.35" />
      <path d="M100 140c18 36 28 78 24 120" fill="none" stroke="currentColor" strokeWidth="6" opacity="0.35" />
    </svg>
  );
}
