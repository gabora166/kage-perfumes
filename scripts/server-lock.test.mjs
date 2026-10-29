import assert from "node:assert/strict";
import test from "node:test";
import { decideLock, isProcessAlive } from "./server-lock.mjs";

test("a free lock can be acquired", () => {
  assert.equal(decideLock(null, false, 10), "acquire");
});

test("a dead lock can be replaced", () => {
  assert.equal(decideLock(4, false, 10), "replace");
});

test("a live lock blocks a second server", () => {
  assert.equal(decideLock(4, true, 10), "busy");
});

test("the current process keeps its lock", () => {
  assert.equal(decideLock(10, true, 10), "keep");
});

test("the current process is alive and an unused pid is not", () => {
  assert.equal(isProcessAlive(process.pid), true);
  assert.equal(isProcessAlive(0), false);
});
