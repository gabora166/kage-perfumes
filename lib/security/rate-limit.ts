import "server-only";

import { getDb } from "@/lib/db/client";
import {
  codeLimitKey,
  emailLimitKey,
  phoneLimitKey,
  readClientAddress,
  requireClientAddress,
} from "@/lib/security/client-address";
import { consumeWindow, RateLimitError } from "@/lib/security/rate-window";

const orderLimit = 10;
const orderWindowMs = 10 * 60 * 1000;
const loginLimit = 8;
const loginWindowMs = 15 * 60 * 1000;
const trackLimit = 8;
const trackWindowMs = 10 * 60 * 1000;
const promoLimit = 8;
const promoWindowMs = 10 * 60 * 1000;
const passwordLimit = 5;

export { RateLimitError };
export { readClientAddress, UnattributedClientError } from "@/lib/security/client-address";

type HeaderStore = {
  get(name: string): string | null;
};

export function consumeOrderAddress(headerStore: HeaderStore): string | null {
  const address = readClientAddress(headerStore);
  charge("orders", address, orderLimit, orderWindowMs);
  return address;
}

export function consumeOrderPhone(phone: string | null): void {
  charge("orders", phoneLimitKey(phone), orderLimit, orderWindowMs);
}

export function consumeTrackAddress(headerStore: HeaderStore): string | null {
  const address = readClientAddress(headerStore);
  charge("order-track", address, trackLimit, trackWindowMs);
  return address;
}

export function consumeTrackPhone(phone: string | null): void {
  charge("order-track", phoneLimitKey(phone), trackLimit, trackWindowMs);
}

export function consumePromoAddress(headerStore: HeaderStore): string | null {
  const address = readClientAddress(headerStore);
  charge("promo-code", address, promoLimit, promoWindowMs);
  return address;
}

export function consumePromoCode(code: string | null): void {
  charge("promo-code", codeLimitKey(code), promoLimit, promoWindowMs);
}

export function consumeNewsletterAddress(headerStore: HeaderStore): string | null {
  const address = readClientAddress(headerStore);
  charge("newsletter", address, 5, 30 * 60 * 1000);
  return address;
}

export function consumeNewsletterEmail(email: string | null): void {
  charge("newsletter", emailLimitKey(email), 5, 30 * 60 * 1000);
}

export function consumeBespokeAddress(headerStore: HeaderStore): string | null {
  const address = readClientAddress(headerStore);
  charge("bespoke-request", address, 5, 30 * 60 * 1000);
  return address;
}

export function consumeBespokePhone(phone: string | null): void {
  charge("bespoke-request", phoneLimitKey(phone), 5, 30 * 60 * 1000);
}

export function consumeBespokeQuoteAddress(headerStore: HeaderStore): string | null {
  const address = readClientAddress(headerStore);
  charge("bespoke-quote", address, 12, 15 * 60 * 1000);
  return address;
}

export function consumeLoginLimit(headerStore: HeaderStore): void {
  const address = requireClientAddress(readClientAddress(headerStore));
  charge("admin-login", address, loginLimit, loginWindowMs);
}

export function consumePasswordLimit(headerStore: HeaderStore): void {
  const address = requireClientAddress(readClientAddress(headerStore));
  charge("admin-password", address, passwordLimit, loginWindowMs);
}

function charge(bucket: string, key: string | null, limit: number, windowMs: number): void {
  if (!key) return;
  consumeWindow(getDb(), { bucket, ip: key, limit, windowMs });
}
