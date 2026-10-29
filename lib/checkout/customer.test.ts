import assert from "node:assert/strict";
import test from "node:test";
import { customerFieldErrors, firstCustomerError } from "./customer.ts";

test("a complete delivery address has no field errors", () => {
  const draft = {
    customerName: "ليلى",
    phone: "01000000000",
    city: "القاهرة",
    address: "شارع النيل، الدور الثاني",
  };
  assert.deepEqual(customerFieldErrors(draft), {});
  assert.equal(firstCustomerError(draft), null);
});

test("each missing delivery field keeps its own message", () => {
  const errors = customerFieldErrors({
    customerName: " ",
    phone: "123",
    city: "ق",
    address: "قصير",
  });
  assert.equal(errors.customerName, "أكمل الاسم.");
  assert.equal(errors.phone, "رقم الموبايل غير واضح.");
  assert.equal(errors.city, "أكمل المدينة أو المحافظة.");
  assert.equal(errors.address, "أكمل العنوان.");
  assert.equal(firstCustomerError({
    customerName: "ليلى",
    phone: "abc",
    city: "القاهرة",
    address: "شارع النيل، الدور الثاني",
  }), "رقم الموبايل غير واضح.");
});
