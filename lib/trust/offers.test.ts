import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isMansouraCity, shippingMessageForCity } from "./offers.ts";

describe("isMansouraCity", () => {
  it("recognizes Arabic and Latin Mansoura spellings", () => {
    assert.equal(isMansouraCity("المنصورة"), true);
    assert.equal(isMansouraCity("  المنصوره  "), true);
    assert.equal(isMansouraCity("Mansoura"), true);
    assert.equal(isMansouraCity("حي الجامعة، المنصورة"), true);
  });

  it("rejects empty or other cities", () => {
    assert.equal(isMansouraCity(""), false);
    assert.equal(isMansouraCity("القاهرة"), false);
    assert.equal(isMansouraCity("Alexandria"), false);
  });
});

describe("shippingMessageForCity", () => {
  it("does not claim free shipping outside Mansoura", () => {
    const elsewhere = shippingMessageForCity("الجيزة");
    assert.equal(elsewhere.tone, "elsewhere");
    assert.match(elsewhere.text, /المنصورة فقط/);
  });

  it("confirms free shipping inside Mansoura", () => {
    const local = shippingMessageForCity("المنصورة");
    assert.equal(local.tone, "mansoura");
    assert.match(local.text, /مجاني/);
  });
});
