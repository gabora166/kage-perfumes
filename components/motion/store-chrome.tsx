"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { kageDuration, kageEase } from "@/lib/motion/tokens";

/**
 * S1 scroll progress + S6 back-to-top — lightweight, passive scroll listeners,
 * disabled under reduced motion for continuous progress animation.
 */
export function StoreChrome() {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = (): void => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const next = Math.min(1, Math.max(0, window.scrollY / max));
      setProgress(next);
      setShowTop(window.scrollY > Math.min(720, window.innerHeight * 0.9));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {!prefersReducedMotion ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-[65] h-[2px] bg-transparent"
        >
          <div
            className="h-full origin-right bg-seal/80 transition-[width] duration-150 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      ) : null}

      <AnimatePresence>
        {showTop ? (
          <motion.button
            type="button"
            key="back-top"
            aria-label="العودة إلى الأعلى"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: kageDuration.press, ease: kageEase }}
            className="pressable fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] end-4 z-[55] grid size-11 place-items-center border border-border bg-panel/95 text-ivory backdrop-blur-sm md:end-6"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
            }}
          >
            <ArrowUp className="size-4" aria-hidden="true" strokeWidth={1.5} />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  );
}
