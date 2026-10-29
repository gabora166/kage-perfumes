import assert from "node:assert/strict";
import test from "node:test";
import { nextTrapTarget } from "./focus-trap.ts";

test("tab wraps from the last control to the first and back", () => {
  const first = {} as HTMLElement;
  const middle = {} as HTMLElement;
  const last = {} as HTMLElement;
  const items = [first, middle, last];
  assert.equal(nextTrapTarget(items, last, false), first);
  assert.equal(nextTrapTarget(items, first, true), last);
  assert.equal(nextTrapTarget(items, middle, false), null);
  assert.equal(nextTrapTarget([], null, false), null);
});
