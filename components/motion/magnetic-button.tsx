"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type MagneticButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: "solid" | "ghost" | "ink";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

/**
 * M1 pressable + M2 restrained magnetic pull (desktop fine pointer only).
 * Magnetic offset is capped so targeting stays predictable.
 */
export function MagneticButton({
  href,
  children,
  variant = "solid",
  className,
  type = "button",
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const classes = cn(
    "pressable relative inline-flex h-12 items-center justify-center gap-3 px-7 text-sm transition-colors duration-200 will-change-transform disabled:pointer-events-none disabled:opacity-40",
    variant === "solid" && "cta-shine bg-seal text-ivory hover:bg-seal/90",
    variant === "ghost" && "border border-border text-ivory hover:border-brass",
    variant === "ink" && "bg-ivory text-ink hover:bg-cream",
    className,
  );

  function onMove(event: MouseEvent<HTMLElement>): void {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const offsetY = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    const pullX = Math.max(-1, Math.min(1, offsetX)) * 5;
    const pullY = Math.max(-1, Math.min(1, offsetY)) * 4;
    node.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
  }

  function onLeave(): void {
    const node = ref.current;
    if (!node) return;
    node.style.transform = "translate3d(0, 0, 0)";
  }

  if (href) {
    return (
      <Link
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        data-cursor="magnetic"
        className={classes}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      data-cursor="magnetic"
      className={classes}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </button>
  );
}
