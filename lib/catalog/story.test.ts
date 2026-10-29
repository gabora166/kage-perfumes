import assert from "node:assert/strict";
import test from "node:test";
import { galleryKinds, imageAlt } from "./images.ts";
import { listRitualCompanions } from "./story.ts";
import type { Product } from "./types.ts";

function sample(id: string, family: Product["family"]): Product {
  return {
    id,
    slug: id,
    nameAr: "ليل العنبر",
    nameEn: "Nocturne Amber",
    family,
    descriptionAr: "وصف العطر",
    notes: { top: "زعفران", heart: "ورد", base: "عنبر" },
    offers: [{ sizeMl: 30, priceSar: 480, stockCount: 8, isListed: true }],
    isFeatured: false,
    isPublished: true,
    images: { bottle: null, liquid: null, texture: null, pyramid: null },
    longevity: 4,
    sillage: 3,
    longevitySpan: "٦ إلى ٨ ساعات",
    sillageSpan: "معتدل",
    sensoryVibe: "دفء هادئ على الجلد.",
    mood: "دافئ",
    season: "الشتاء",
    occasion: "سهرة",
    attire: "معطف داكن",
    sample: null,
  };
}

test("image alt names an illustration when no photograph is attached", () => {
  const product = sample("layl", "oriental");
  assert.equal(imageAlt(product, "bottle"), "ليل العنبر — رسم تحريري للزجاجة");
  assert.equal(imageAlt(product, "liquid"), "ليل العنبر — لون العائلة، وليس صورة للسائل");
  assert.equal(imageAlt(product, "texture"), "ليل العنبر — نسيج لوني، وليس صورة للمكونات");
});

test("the gallery keeps the bottle and hides empty liquid and texture frames", () => {
  const product = sample("layl", "oriental");
  assert.deepEqual(galleryKinds(product), ["bottle"]);
  product.images.liquid = "/uploads/products/layl-liquid.jpg";
  assert.deepEqual(galleryKinds(product), ["bottle", "liquid"]);
});

test("image alt names an attached file as a photograph without calling it verified", () => {
  const product = sample("layl", "oriental");
  product.images = { bottle: "/uploads/products/example.jpg", liquid: null, texture: null };
  assert.equal(imageAlt(product, "bottle"), "ليل العنبر — صورة الزجاجة");
  assert.equal(imageAlt(product, "liquid"), "ليل العنبر — لون العائلة، وليس صورة للسائل");
});

test("ritual companions prefer a different family", () => {
  const current = sample("rose", "floral");
  const products = [
    current,
    sample("amber", "oriental"),
    sample("oud", "woody"),
    sample("jasmine", "floral"),
  ];
  const companions = listRitualCompanions(current, products);
  assert.deepEqual(companions.map((item) => item.id), ["amber", "oud"]);
});
