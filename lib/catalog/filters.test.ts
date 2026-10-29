import assert from "node:assert/strict";
import test from "node:test";
import {
  catalogCountLabel,
  filterProducts,
  parsePrice,
  publishedFamilies,
  publishedPriceFilters,
  publishedSizes,
  sortProducts,
} from "./filters.ts";
import type { Product } from "./types.ts";

test("the catalog keeps published products in the chosen family", () => {
  const oriental = perfume({ id: "layl", nameAr: "ليل", family: "oriental" });
  const woody = perfume({ id: "oud", nameAr: "عود", family: "woody" });
  const hidden = perfume({ id: "hidden", nameAr: "مخفي", family: "oriental", isPublished: false });
  const visible = filterProducts([hidden, woody, oriental], "oriental", "all");
  assert.deepEqual(visible.map((product) => product.id), ["layl"]);
  assert.deepEqual(publishedFamilies([oriental, woody, hidden]), ["oriental", "woody"]);
});

test("an empty family stays empty and an unknown size is still named", () => {
  const floral = perfume({ id: "ward", nameAr: "ورد", family: "floral", offers: [offer(30, 440, 2)] });
  assert.deepEqual(filterProducts([floral], "woody", "all"), []);
  assert.deepEqual(publishedSizes([floral], 100), [30, 100]);
  assert.equal(catalogCountLabel(0), "لا عطور في هذا الاختيار");
});

test("price sorting copies the list and leaves the original prices in place", () => {
  const low = perfume({ id: "low", nameAr: "الأقل", offers: [offer(50, 400, 1)] });
  const high = perfume({ id: "high", nameAr: "الأعلى", offers: [offer(50, 980, 1)] });
  const plain = perfume({ id: "plain", nameAr: "بلا صورة", images: { bottle: null, liquid: null, texture: null, pyramid: null } });
  const input = [high, plain, low];
  assert.deepEqual(sortProducts(input, "default").map((product) => product.id), ["high", "plain", "low"]);
  assert.deepEqual(sortProducts(input, "price-asc").map((product) => product.id), ["low", "plain", "high"]);
  assert.deepEqual(sortProducts(input, "price-desc").map((product) => product.id), ["high", "plain", "low"]);
  assert.deepEqual(input.map((product) => product.id), ["high", "plain", "low"]);
  assert.equal(low.offers[0]?.priceSar, 400);
  assert.equal(high.offers[0]?.stockCount, 1);
  assert.equal(plain.images.bottle, null);
});

test("a price band keeps a perfume when one of its sizes sits inside it", () => {
  const layered = perfume({
    id: "layered",
    nameAr: "طبقات",
    offers: [offer(30, 480, 1), offer(50, 760, 1), offer(100, 1120, 1)],
  });
  const small = perfume({ id: "small", nameAr: "صغير", offers: [offer(30, 420, 1)] });
  assert.deepEqual(filterProducts([layered, small], "all", "all", "under-700").map((product) => product.id), ["layered", "small"]);
  assert.deepEqual(filterProducts([layered, small], "all", "all", "over-1000").map((product) => product.id), ["layered"]);
  assert.deepEqual(filterProducts([layered], "all", 30, "over-1000"), []);
  assert.deepEqual(filterProducts([layered], "all", 100, "over-1000").map((product) => product.id), ["layered"]);
  assert.deepEqual(publishedPriceFilters([small]), ["under-700"]);
  assert.equal(parsePrice("700-1000"), "700-1000");
  assert.equal(parsePrice("nope"), "all");
});

function offer(sizeMl: 30 | 50 | 100, priceSar: number, stockCount: number): Product["offers"][number] {
  return { sizeMl, priceSar, stockCount, isListed: true };
}

function perfume(overrides: Partial<Product> & Pick<Product, "id" | "nameAr">): Product {
  return {
    slug: overrides.id,
    nameEn: overrides.nameAr,
    family: "floral",
    descriptionAr: "وصف",
    notes: { top: "ورد", heart: "", base: "" },
    offers: [offer(50, 440, 2)],
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
    sample: null,
    ...overrides,
  };
}
