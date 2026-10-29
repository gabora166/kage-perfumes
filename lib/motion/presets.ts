/**
 * Named motion presets for the KAGE storefront.
 * IDs map to the Full Storefront Animation System brief.
 */

export const pageTransitionPresets = {
  /** A — Shadow Vanish → soft intensity plate */
  shadowVanish: "soft",
  /** B — Ink Sweep → ninja clip wipe */
  inkSweep: "ninja",
  /** C — KAGE Seal → seal stamp inside ninja plate */
  kageSeal: "ninja",
  /** D — Mist Reveal → soft plate with mist texture */
  mistReveal: "soft",
} as const;

export const entrancePresets = {
  /** F1 Editorial Fade */
  editorial: "fade",
  /** F2 Staggered Reveal → Stagger / StaggerItem */
  stagger: "stagger",
  /** F3 Masked Reveal */
  masked: "mask",
  /** F4 Ink Reveal */
  ink: "ink",
  /** F5 Depth Entrance */
  depth: "depth",
  /** F6 Section Scroll Reveal → Reveal whileInView (any variant) */
  scroll: "rise",
} as const;

export type RevealPreset = "rise" | "fade" | "ink" | "mask" | "depth";
