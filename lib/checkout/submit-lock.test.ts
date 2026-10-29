import assert from "node:assert/strict";
import test from "node:test";
import { createSubmitLock } from "./submit-lock.ts";

test("a second claim waits until the first submit is released", () => {
  const lock = createSubmitLock();
  assert.equal(lock.claim(), true);
  assert.equal(lock.claim(), false);
  lock.release();
  assert.equal(lock.claim(), true);
});
