import assert from "node:assert/strict";
import test from "node:test";
import { validatePasswordChange } from "./password-policy.ts";

const currentPassword = "current-secret";

test("a matching new password is accepted", () => {
  assert.equal(validatePasswordChange({
    currentPassword,
    nextPassword: "Maison-1843",
    confirmPassword: "Maison-1843",
  }), null);
});

test("a short or repeated password is refused", () => {
  assert.match(validatePasswordChange({
    currentPassword,
    nextPassword: "short",
    confirmPassword: "short",
  }) ?? "", /8/);
  assert.match(validatePasswordChange({
    currentPassword,
    nextPassword: currentPassword,
    confirmPassword: currentPassword,
  }) ?? "", /مختلفة/);
  assert.match(validatePasswordChange({
    currentPassword,
    nextPassword: "Maison-1843",
    confirmPassword: "Maison-1844",
  }) ?? "", /مطابق/);
});
