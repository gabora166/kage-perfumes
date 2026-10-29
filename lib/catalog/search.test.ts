import assert from "node:assert/strict";
import test from "node:test";
import { searchProducts } from "./search.ts";
import type { Product } from "./types.ts";

const sample = {
  id: "sample",
  slug: "sample",
  nameAr: "ليل العنبر",
  nameEn: "Nocturne Amber",
  family: "oriental",
  descriptionAr: "وصف",
  notes: { top: "زعفران", heart: "ورد", base: "عنبر" },
  offers: [{ sizeMl: 50, priceSar: 760, stockCount: 8, isListed: true }],
  isFeatured: true,
  isPublished: true,
  images: { bottle: null, liquid: null, texture: null, pyramid: null },
  longevity: 5,
  sillage: 4,
  longevitySpan: "٧ إلى ٩ ساعات",
  sillageSpan: "معتدل إلى قوي",
  sensoryVibe: "عنبر دافئ على الجلد.",
  mood: "دافئ وليلي",
  season: "الشتاء",
  occasion: "سهرة",
  attire: "معطف داكن",
  sample: { priceSar: 75, stockCount: 20, isEnabled: true },
} satisfies Product;

test("search matches Arabic name, English name, and notes", () => {
  assert.equal(searchProducts([sample], "العنبر").length, 1);
  assert.equal(searchProducts([sample], "amber").length, 1);
  assert.equal(searchProducts([sample], "زعفران").length, 1);
  assert.equal(searchProducts([sample], "oud").length, 0);
});

test("search ignores short queries and Arabic diacritics", () => {
  assert.equal(searchProducts([sample], "ع").length, 0);
  assert.equal(searchProducts([sample], "عَنْبَر").length, 1);
});
