"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NinjaOverlay, type NinjaPhase } from "@/components/motion/ninja-overlay";
import {
  resolveInternalNavTarget,
  resolveTransitionIntensity,
  type TransitionIntensity,
} from "@/lib/motion/navigation";
import { kageDuration, kageEase, ninjaSafetyMs } from "@/lib/motion/tokens";

type StoreMotionProps = {
  children: ReactNode;
};

type PendingNav = {
  href: string;
  intensity: TransitionIntensity;
};

/**
 * Storefront motion shell:
 * - Intercepts eligible internal link clicks (capture phase)
 * - Plays ninja/soft cover → router.push → reveal on pathname change
 * - Animates page entrance without unmounting CartProvider / header
 */
export function StoreMotion({ children }: StoreMotionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<NinjaPhase>("idle");
  const [intensity, setIntensity] = useState<TransitionIntensity>("ninja");
  const pendingRef = useRef<PendingNav | null>(null);
  const lockedRef = useRef(false);
  const phaseRef = useRef<NinjaPhase>("idle");
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushedRef = useRef(false);
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const routeKeyRef = useRef(routeKey);

  const clearTimers = useCallback(() => {
    if (safetyRef.current) {
      clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
    if (coverTimerRef.current) {
      clearTimeout(coverTimerRef.current);
      coverTimerRef.current = null;
    }
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  const finishToIdle = useCallback(() => {
    clearTimers();
    lockedRef.current = false;
    pendingRef.current = null;
    pushedRef.current = false;
    phaseRef.current = "idle";
    setPhase("idle");
  }, [clearTimers]);

  const beginReveal = useCallback(() => {
    if (phaseRef.current === "revealing" || phaseRef.current === "idle") {
      if (phaseRef.current === "idle") return;
    }
    if (safetyRef.current) {
      clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
    if (coverTimerRef.current) {
      clearTimeout(coverTimerRef.current);
      coverTimerRef.current = null;
    }
    phaseRef.current = "revealing";
    setPhase("revealing");
    const revealMs = (prefersReducedMotion ? kageDuration.softWipe : kageDuration.ninjaReveal) * 1000;
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    revealTimerRef.current = setTimeout(() => {
      finishToIdle();
    }, revealMs + 80);
  }, [finishToIdle, prefersReducedMotion]);

  const startNavigation = useCallback(
    (href: string, nextIntensity: TransitionIntensity) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      pushedRef.current = false;
      pendingRef.current = { href, intensity: nextIntensity };
      const useSoft = Boolean(prefersReducedMotion) || nextIntensity === "soft";
      setIntensity(useSoft ? "soft" : nextIntensity);
      phaseRef.current = "covering";
      setPhase("covering");
      clearTimers();

      const coverMs = (useSoft ? kageDuration.softWipe : kageDuration.ninjaCover) * 1000;

      coverTimerRef.current = setTimeout(() => {
        phaseRef.current = "holding";
        setPhase("holding");
        pushedRef.current = true;
        router.push(href);
      }, coverMs);

      safetyRef.current = setTimeout(() => {
        if (!pushedRef.current && pendingRef.current) {
          pushedRef.current = true;
          router.push(pendingRef.current.href);
        }
        beginReveal();
      }, ninjaSafetyMs);
    },
    [beginReveal, clearTimers, prefersReducedMotion, router],
  );

  // Complete handoff when the route actually changes.
  useEffect(() => {
    if (routeKeyRef.current === routeKey) return;
    routeKeyRef.current = routeKey;
    if (pendingRef.current || phaseRef.current === "covering" || phaseRef.current === "holding") {
      beginReveal();
    }
  }, [beginReveal, routeKey]);

  // Capture-phase link interception for App Router (no pages-router events).
  useEffect(() => {
    const onClick = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const resolved = resolveInternalNavTarget(
        anchor,
        event,
        window.location.origin,
        pathname,
        window.location.search,
      );
      if (!resolved) return;
      const nextIntensity = resolveTransitionIntensity(pathname, resolved.pathname);
      event.preventDefault();
      startNavigation(resolved.href, nextIntensity);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, startNavigation]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <>
      <NinjaOverlay phase={phase} intensity={intensity} />
      {/* Key pathname only — query-only filter changes must not remount the page shell. */}
      <PageEntrance pathKey={pathname}>{children}</PageEntrance>
    </>
  );
}

function PageEntrance({ pathKey, children }: { pathKey: string; children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return <div key={pathKey}>{children}</div>;
  }
  // Keep opacity at 1 so SSR / first paint never hides shopping content.
  return (
    <motion.div
      key={pathKey}
      initial={{ opacity: 1, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: kageDuration.pageEnter, ease: kageEase }}
    >
      {children}
    </motion.div>
  );
}
