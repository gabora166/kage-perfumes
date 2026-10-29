import assert from "node:assert/strict";
import test from "node:test";
import { canCustomerRespond, isBespokeStatus, readBespokeStatusFilter } from "./status.ts";

test("known statuses are accepted", () => {
  assert.equal(isBespokeStatus("awaiting_customer_approval"), true);
  assert.equal(isBespokeStatus("nope"), false);
  assert.equal(readBespokeStatusFilter("approved"), "approved");
  assert.equal(readBespokeStatusFilter("x"), "");
});

test("customers may respond only while a quote is open", () => {
  assert.equal(canCustomerRespond("awaiting_customer_approval"), true);
  assert.equal(canCustomerRespond("quoted"), true);
  assert.equal(canCustomerRespond("approved"), false);
  assert.equal(canCustomerRespond("new"), false);
});
