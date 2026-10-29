import assert from "node:assert/strict";
import test from "node:test";
import { parseOrderReference, phonesMatch } from "./match.ts";

test("parseOrderReference accepts the house format", () => {
  assert.equal(parseOrderReference(" aq-1842 "), "AQ-1842");
  assert.equal(parseOrderReference("AQ-123456"), "AQ-123456");
  assert.equal(parseOrderReference("AQ-12"), null);
  assert.equal(parseOrderReference("XX-1842"), null);
});

test("phonesMatch ignores spacing and rejects a different number", () => {
  assert.equal(phonesMatch("+20 10 0000 0000", "201000000000"), true);
  assert.equal(phonesMatch("201000000000", "201000000001"), false);
  assert.equal(phonesMatch("01000000000", "201000000000"), false);
});
