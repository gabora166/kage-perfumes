import assert from "node:assert/strict";
import test from "node:test";
import { buildNoteTiers, resolveIngredient } from "@/lib/catalog/ingredients";

test("resolveIngredient maps Arabic notes to English labels and local stills", () => {
  const actual = resolveIngredient("بهار وردي");
  assert.equal(actual.nameEn, "Pink pepper");
  assert.equal(actual.imageSrc, "/brand/ingredients/pink-pepper.jpg");
  assert.equal(actual.hasImage, true);
});

test("pink pepper aliases share one approved asset", () => {
  const a = resolveIngredient("بهار وردي");
  const b = resolveIngredient("فلفل وردي");
  assert.equal(a.imageSrc, b.imageSrc);
});

test("unknown notes keep their Arabic label and fall back without inventing English", () => {
  const actual = resolveIngredient("نوتة غير معروفة");
  assert.equal(actual.nameAr, "نوتة غير معروفة");
  assert.equal(actual.nameEn, null);
  assert.equal(actual.hasImage, false);
  assert.equal(actual.imageSrc, null);
});

test("buildNoteTiers skips empty stages and preserves product note order", () => {
  const actual = buildNoteTiers({
    top: "بهار وردي",
    heart: "عود، أرز",
    base: "",
  });
  assert.deepEqual(
    actual.map((tier) => tier.key),
    ["top", "heart"],
  );
  assert.deepEqual(
    actual[1].ingredients.map((entry) => entry.nameAr),
    ["عود", "أرز"],
  );
});

test("ambroxan stays mapped without claiming a fabricated still", () => {
  const actual = resolveIngredient("أمبروكسان");
  assert.equal(actual.nameEn, "Ambroxan");
  assert.equal(actual.hasImage, false);
});
