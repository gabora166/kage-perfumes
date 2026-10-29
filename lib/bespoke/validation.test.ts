import assert from "node:assert/strict";
import test from "node:test";
import {
  firstBespokeError,
  parseBespokeRequestBody,
  readProposedPriceSar,
  sanitizeBespokeRequest,
} from "./validation.ts";

test("a complete request draft is accepted", () => {
  const input = sanitizeBespokeRequest({
    perfumeName: "Sauvage",
    phone: "0100 123 4567",
    brandName: "Dior",
    sizeOption: "50",
    customSize: "",
    quantity: 1,
    concentration: "edp",
    notes: "خلال أسبوع إن أمكن",
  });
  assert.equal(input.perfumeName, "Sauvage");
  assert.equal(input.phone, "01001234567");
  assert.equal(input.sizeOption, "50");
  assert.equal(input.concentration, "edp");
});

test("missing perfume name is refused", () => {
  assert.match(
    firstBespokeError({
      perfumeName: "أ",
      phone: "01001234567",
      brandName: "",
      sizeOption: "",
      customSize: "",
      quantity: 1,
      concentration: "",
      notes: "",
    }) ?? "",
    /اسم العطر/,
  );
});

test("invalid phone is refused", () => {
  assert.match(
    firstBespokeError({
      perfumeName: "Sauvage",
      phone: "abc",
      brandName: "",
      sizeOption: "",
      customSize: "",
      quantity: 1,
      concentration: "",
      notes: "",
    }) ?? "",
    /موبايل/,
  );
});

test("custom size requires a value", () => {
  assert.match(
    firstBespokeError({
      perfumeName: "Sauvage",
      phone: "01001234567",
      brandName: "",
      sizeOption: "custom",
      customSize: "",
      quantity: 1,
      concentration: "",
      notes: "",
    }) ?? "",
    /الحجم/,
  );
});

test("proposed price must be a positive integer", () => {
  assert.throws(() => readProposedPriceSar(0), /السعر/);
  assert.throws(() => readProposedPriceSar(12.5), /السعر/);
  assert.equal(readProposedPriceSar(450), 450);
});

test("body parser coerces missing fields safely", () => {
  const draft = parseBespokeRequestBody({ perfumeName: "Noir" });
  assert.equal(draft.perfumeName, "Noir");
  assert.equal(draft.phone, "");
  assert.equal(draft.quantity, 1);
});
