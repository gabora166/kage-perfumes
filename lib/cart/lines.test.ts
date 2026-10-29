import assert from "node:assert/strict";
import test from "node:test";
import { buildCartLines, lineTotalSar, merchandiseTotalSar } from "./lines.ts";
import type { Product } from "../catalog/types.ts";

test("a bottle and a 2ml sample keep separate prices", () => {
  const product = perfume();
  const lines = buildCartLines(
    [
      { kind: "catalog", productId: "layl", sizeMl: 50, quantity: 2 },
      { kind: "sample", productId: "layl", quantity: 1 },
    ],
    [product],
    null,
  );
  assert.equal(lines[0]?.unitLabel, "سعر الزجاجة");
  assert.equal(lines[0]?.unitPriceSar, 400);
  assert.equal(lineTotalSar(400, 2), 800);
  assert.equal(lines[1]?.detail, "2 مل · عيّنة");
  assert.equal(lines[1]?.unitPriceSar, 75);
  assert.equal(lines[1]?.unitPriceSar === product.offers[0]?.priceSar, false);
  assert.equal(merchandiseTotalSar(lines), 875);
});

test("a bundle keeps its offer price instead of the separate bottle prices", () => {
  const lines = buildCartLines(
    [{ kind: "bundle", bundleId: "pair", quantity: 1 }],
    [],
    null,
    [{
      id: "pair",
      slug: "pair",
      nameAr: "ثنائية الدار",
      nameEn: "House Pair",
      descriptionAr: "زجاجتان بسعر واحد.",
      priceSar: 1100,
      stockCount: 3,
      isPublished: true,
      isComplete: true,
      parts: [
        { productId: "a", nameAr: "ليل العنبر", nameEn: "Nocturne Amber", sizeMl: 50, quantity: 1, unitPriceSar: 400, stockCount: 4 },
        { productId: "b", nameAr: "عود الملك", nameEn: "Crown Oud", sizeMl: 50, quantity: 1, unitPriceSar: 980, stockCount: 2 },
      ],
    }],
  );
  assert.equal(lines[0]?.unitPriceSar, 1100);
  assert.equal(lines[0]?.unitLabel, "سعر العرض");
  assert.equal(lines[0]?.stockCount, 2);
  assert.equal(lines[0]?.detail.includes("ليل العنبر"), true);
});

test("quantity stops at the recorded stock and a sold-out size stays visible", () => {
  const lines = buildCartLines(
    [{ kind: "catalog", productId: "layl", sizeMl: 50, quantity: 3 }],
    [perfume()],
    null,
  );
  assert.equal(lines[0]?.stockCount, 2);
  assert.equal(lines[0]?.quantityLimit, 2);
  const removed = buildCartLines([], [perfume()], null);
  assert.deepEqual(removed, []);
});

function perfume(): Product {
  return {
    id: "layl",
    slug: "layl",
    nameAr: "ليل العنبر",
    nameEn: "Nocturne Amber",
    family: "oriental",
    descriptionAr: "وصف",
    notes: { top: "", heart: "", base: "" },
    offers: [{ sizeMl: 50, priceSar: 400, stockCount: 2, isListed: true }],
    isFeatured: false,
    isPublished: true,
    images: { bottle: null, liquid: null, texture: null, pyramid: null },
    longevity: 3,
    sillage: 3,
    longevitySpan: "",
    sillageSpan: "",
    sensoryVibe: "",
    mood: "",
    season: "",
    occasion: "",
    attire: "",
    sample: { priceSar: 75, stockCount: 4, isEnabled: true },
  };
}
