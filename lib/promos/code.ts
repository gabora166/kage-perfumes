import { timingSafeEqual } from "node:crypto";
import type { PromoKind } from "@/lib/checkout/adjustments";

export type PromoRecord = {
  id: string;
  code: string;
  kind: PromoKind;
  amount: number;
  expiresAt: string | null;
  isActive: boolean;
  maxUses: number | null;
  usedCount: number;
};

export function normalizePromoCode(value: string): string | null {
  const code = value.trim().toUpperCase();
  if (!/^[A-Z0-9-]{4,24}$/.test(code)) return null;
  return code;
}

export function codesMatch(stored: string, given: string): boolean {
  const left = Buffer.from(stored);
  const right = Buffer.from(given);
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

export function isPromoExpired(expiresAt: string | null, now = new Date()): boolean {
  if (!expiresAt) return false;
  return expiresAt.slice(0, 10) < now.toISOString().slice(0, 10);
}

export function isPromoExhausted(usedCount: number, maxUses: number | null): boolean {
  if (maxUses === null) return false;
  return usedCount >= maxUses;
}
