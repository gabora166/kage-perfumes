import assert from "node:assert/strict";
import test from "node:test";
import { cleanGiftMessage, discountFor, quoteTotals } from "./adjustments.ts";

test("percent and fixed discounts never exceed the merchandise", () => {
  assert.equal(discountFor(1000, { kind: "percent", amount: 10 }), 100);
  assert.equal(discountFor(1000, { kind: "fixed", amount: 2500 }), 1000);
  assert.equal(discountFor(0, { kind: "percent", amount: 50 }), 0);
});

test("gift wrap is added after the discount", () => {
  const totals = quoteTotals({ subtotalSar: 480, giftWrap: true, discountSar: 48 });
  assert.equal(totals.discountSar, 48);
  assert.equal(totals.giftWrapSar, 45);
  assert.equal(totals.totalSar, 477);
});

test("gift message drops control characters and keeps the note", () => {
  assert.equal(cleanGiftMessage("  ليل العنبر \u0000"), "ليل العنبر");
});
