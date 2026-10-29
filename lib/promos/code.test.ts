import assert from "node:assert/strict";
import test from "node:test";
import { isPromoExhausted, isPromoExpired, normalizePromoCode } from "./code.ts";

test("normalizePromoCode accepts a private house code", () => {
  assert.equal(normalizePromoCode("  atelier-10 "), "ATELIER-10");
  assert.equal(normalizePromoCode("ab"), null);
  assert.equal(normalizePromoCode("رمز"), null);
});

test("expiry and use limits close a code", () => {
  assert.equal(isPromoExpired("2020-01-01", new Date("2026-10-15T00:00:00Z")), true);
  assert.equal(isPromoExpired("2026-10-15", new Date("2026-10-15T00:00:00Z")), false);
  assert.equal(isPromoExpired(null), false);
  assert.equal(isPromoExhausted(3, 3), true);
  assert.equal(isPromoExhausted(2, null), false);
});
