/** Shared KAGE cinematic motion tokens — keep reveals fast and consistent. */

export const kageEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Slightly snappier ease for presses and stamps */
export const kageEaseStamp: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Sharp ease for ninja cover / ink slash */
export const kageEaseSlash: [number, number, number, number] = [0.7, 0, 0.3, 1];

/**
 * Durations (seconds) aligned to the storefront motion brief.
 * Prefer the semantic keys; legacy aliases remain for existing call sites.
 */
export const kageDuration = {
  /** Micro-interactions 100–180ms */
  micro: 0.14,
  /** Buttons / selection 120–220ms */
  press: 0.18,
  /** Standard UI 180–320ms */
  ui: 0.28,
  /** Section reveals 250–450ms */
  section: 0.38,
  /** Page transitions 400–650ms (cover + reveal combined budget) */
  page: 0.55,

  /** Legacy aliases */
  instant: 0.16,
  quick: 0.28,
  settle: 0.4,
  stamp: 0.4,
  cinematic: 0.55,
  ninjaCover: 0.32,
  ninjaReveal: 0.28,
  softWipe: 0.22,
  pageEnter: 0.36,
} as const;

export const kageStagger = {
  tight: 0.05,
  normal: 0.08,
  loose: 0.12,
} as const;

export const kageDistance = {
  microY: 6,
  riseY: 14,
  sectionY: 18,
  cardLift: 4,
} as const;

/** Fail-safe: never leave the overlay covering the document forever */
export const ninjaSafetyMs = 4500;
