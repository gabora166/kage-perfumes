"use client";

import { useId } from "react";
import type { FragranceFamily } from "@/lib/catalog/types";

type PerfumeBottleProps = {
  family: FragranceFamily;
  className?: string;
};

const liquidColor: Record<FragranceFamily, string> = {
  oriental: "#a85a2e",
  woody: "#6f7a52",
  floral: "#a86f82",
};

/**
 * Editorial bottle silhouette — family liquid tint only.
 * Not product packaging; never presented as a photograph.
 */
export function PerfumeBottle({ family, className }: PerfumeBottleProps) {
  const rawId = useId().replace(/:/g, "");
  const liquidId = `liquid-${rawId}`;
  const glassId = `glass-${rawId}`;
  const shineId = `shine-${rawId}`;
  const liquid = liquidColor[family];
  return (
    <svg viewBox="0 0 200 340" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={liquidId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={liquid} stopOpacity="0.12" />
          <stop offset="28%" stopColor={liquid} stopOpacity="0.55" />
          <stop offset="100%" stopColor={liquid} stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2c2c2a" />
          <stop offset="35%" stopColor="#141413" />
          <stop offset="70%" stopColor="#0a0a09" />
          <stop offset="100%" stopColor="#1a1a18" />
        </linearGradient>
        <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="318" rx="42" ry="8" fill="#000" opacity="0.35" />
      <rect x="82" y="12" width="36" height="20" rx="1" fill="#b39a70" />
      <rect x="78" y="32" width="44" height="6" fill="#c4b08a" />
      <path d="M94 38h12v28H94z" fill="#10100f" stroke="#b39a70" strokeWidth="0.9" />
      <path
        d="M66 72h68c6 28 14 82 16 224H50c2-142 10-196 16-224z"
        fill={`url(#${glassId})`}
        stroke="#b39a70"
        strokeOpacity="0.55"
        strokeWidth="1.1"
      />
      <path d="M72 158h56c3 36 7 92 9 132H63c2-40 6-96 9-132z" fill={`url(#${liquidId})`} />
      <path d="M78 88c8 42 8 128 2 206" stroke={`url(#${shineId})`} strokeWidth="3" fill="none" />
      <path d="M118 96c-2 48-1 120 1 188" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1.2" fill="none" />
      <rect x="90" y="288" width="20" height="2" fill="#b39a70" opacity="0.55" />
    </svg>
  );
}
