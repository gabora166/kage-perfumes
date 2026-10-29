import assert from "node:assert/strict";
import test from "node:test";
import { emailLimitKey, phoneLimitKey, requireClientAddress, UnattributedClientError } from "./client-address.ts";
import {
  applyTrustedClientHeaders,
  readTrustedProxyHops,
  resolveRequestAddress,
  signClientAddress,
  useClientSecret,
} from "./trusted-client.mjs";

const secret = "test-client-secret-value";
const cairo = "203.0.113.10";
const giza = "203.0.113.20";

test("direct visitors keep distinct peers and a forged forwarded header is ignored", () => {
  useClientSecret(secret);
  const cairoHeaders = spoofedHeaders();
  const gizaHeaders = spoofedHeaders();
  applyTrustedClientHeaders(cairoHeaders, cairo, 0);
  applyTrustedClientHeaders(gizaHeaders, giza, 0);
  assert.equal(addressFrom(cairoHeaders, 0), cairo);
  assert.equal(addressFrom(gizaHeaders, 0), giza);
  assert.equal(cairoHeaders["x-real-ip"], undefined);
  assert.notEqual(addressFrom(cairoHeaders, 0), "198.51.100.9");
});

test("a missing peer or a bad proof does not collapse visitors into one key", () => {
  useClientSecret(secret);
  const missing = { "x-forwarded-for": "198.51.100.9", "x-real-ip": "198.51.100.8" };
  applyTrustedClientHeaders(missing, null, 0);
  assert.equal(addressFrom(missing, 0), null);
  assert.equal(phoneLimitKey(null), null);
  assert.equal(phoneLimitKey("123"), null);
  assert.equal(phoneLimitKey("01000000001"), "phone:01000000001");
  assert.notEqual(phoneLimitKey("01000000001"), phoneLimitKey("01000000002"));
  assert.equal(resolveRequestAddress({
    forwardedFor: cairo,
    clientAddress: cairo,
    clientProof: "forged-proof",
    trustedProxyHops: 0,
    secret,
  }), null);
  assert.throws(() => requireClientAddress(null), UnattributedClientError);
});

test("one trusted proxy keeps the appended peer, not the client-supplied prefix", () => {
  assert.equal(readTrustedProxyHops(undefined), 0);
  assert.equal(readTrustedProxyHops("0"), 0);
  assert.equal(readTrustedProxyHops("nope"), 0);
  assert.equal(readTrustedProxyHops("1"), 1);
  const headers = {
    "x-forwarded-for": `198.51.100.9, ${cairo}`,
    "x-real-ip": "198.51.100.8",
  };
  applyTrustedClientHeaders(headers, "10.0.0.1", 1);
  assert.equal(headers["x-forwarded-for"], `198.51.100.9, ${cairo}`);
  assert.equal(headers["x-real-ip"], undefined);
  assert.equal(addressFrom(headers, 1), cairo);
  assert.equal(resolveRequestAddress({
    forwardedFor: `198.51.100.9, ${cairo}, 10.0.0.1`,
    clientAddress: "198.51.100.9",
    clientProof: signClientAddress(secret, "198.51.100.9"),
    trustedProxyHops: 2,
    secret,
  }), cairo);
  assert.equal(resolveRequestAddress({
    forwardedFor: "198.51.100.9",
    clientAddress: null,
    clientProof: null,
    trustedProxyHops: 2,
    secret: null,
  }), null);
});

test("newsletter fallback keys stay separate from a shared address", () => {
  assert.equal(emailLimitKey("not-an-email"), null);
  assert.notEqual(emailLimitKey("a@example.com"), emailLimitKey("b@example.com"));
});

function spoofedHeaders(): Record<string, string> {
  return {
    "x-forwarded-for": "198.51.100.9, 198.51.100.10",
    "x-real-ip": "198.51.100.8",
    "x-ateeq-client-address": "198.51.100.7",
    "x-ateeq-client-proof": "forged-proof",
  };
}

function addressFrom(headers: Record<string, string | undefined>, hops: number): string | null {
  const forwarded = headers["x-forwarded-for"];
  const clientAddress = headers["x-ateeq-client-address"];
  const clientProof = headers["x-ateeq-client-proof"];
  return resolveRequestAddress({
    forwardedFor: typeof forwarded === "string" ? forwarded : null,
    clientAddress: typeof clientAddress === "string" ? clientAddress : null,
    clientProof: typeof clientProof === "string" ? clientProof : null,
    trustedProxyHops: hops,
    secret,
  });
}
