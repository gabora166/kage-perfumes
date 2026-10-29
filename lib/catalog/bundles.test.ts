import assert from "node:assert/strict";
import test from "node:test";
import { availableSets, comparePriceSar, isVisibleBundle, savingsSar } from "./bundles.ts";
import type { BundleOffer } from "./bundles.ts";

test("a bundle offer is the gap under the current bottle prices", () => {
  const parts = [
    { unitPriceSar: 400, quantity: 1, stockCount: 4 },
    { unitPriceSar: 980, quantity: 1, stockCount: 2 },
  ];
  assert.equal(comparePriceSar(parts), 1380);
  assert.equal(savingsSar(1100, parts), 280);
  assert.equal(availableSets(3, parts), 2);
});

test("a price at or above the bottles is not an offer, and stock follows the scarcest bottle", () => {
  assert.equal(savingsSar(1380, [{ unitPriceSar: 400, quantity: 1 }, { unitPriceSar: 980, quantity: 1 }]), 0);
  assert.equal(availableSets(8, [
    { stockCount: 5, quantity: 2 },
    { stockCount: 3, quantity: 1 },
  ]), 2);
  assert.equal(availableSets(8, [{ stockCount: 5, quantity: 1 }]), 0);
  const hidden = bundle({ priceSar: 1380 });
  assert.equal(isVisibleBundle(hidden), false);
  assert.equal(isVisibleBundle(bundle({ priceSar: 1000, isPublished: false })), false);
});

function bundle(overrides: Partial<BundleOffer>): BundleOffer {
  return {
    id: "bundle",
    slug: "bundle",
    nameAr: "عرض",
    nameEn: "Offer",
    descriptionAr: "وصف العرض",
    priceSar: 1000,
    stockCount: 4,
    isPublished: true,
    isComplete: true,
    parts: [
      { productId: "a", slug: "a", nameAr: "أ", nameEn: "A", sizeMl: 50, quantity: 1, unitPriceSar: 400, stockCount: 4 },
      { productId: "b", slug: "b", nameAr: "ب", nameEn: "B", sizeMl: 50, quantity: 1, unitPriceSar: 980, stockCount: 2 },
    ],
    ...overrides,
  };
}
