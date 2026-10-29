import assert from "node:assert/strict";
import test from "node:test";
import { orderSearchPattern, readOrderPage } from "./paging.ts";
import { readOrderStatusFilter } from "./status.ts";

test("order pages stay inside a bounded range", () => {
  assert.equal(readOrderPage(null), 1);
  assert.equal(readOrderPage("0"), 1);
  assert.equal(readOrderPage("3"), 3);
  assert.equal(readOrderPage("10001"), 10000);
  assert.equal(readOrderPage("2.5"), 1);
});

test("order filters keep a known status and escape search wildcards", () => {
  assert.equal(readOrderStatusFilter("shipped"), "shipped");
  assert.equal(readOrderStatusFilter("cancelled"), "cancelled");
  assert.equal(readOrderStatusFilter("nope"), "");
  assert.equal(orderSearchPattern("100%"), "%100\\%%");
});
