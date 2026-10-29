import { timingSafeEqual } from "node:crypto";

export function parseOrderReference(value: string): string | null {
  const reference = value.trim().toUpperCase();
  if (!/^AQ-\d{4,6}$/.test(reference)) return null;
  return reference;
}

export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function phonesMatch(stored: string, given: string): boolean {
  const left = normalizePhoneDigits(stored);
  const right = normalizePhoneDigits(given);
  if (left.length < 8 || left.length > 15 || left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}
