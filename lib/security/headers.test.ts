import assert from "node:assert/strict";
import test from "node:test";
import { buildSecurityHeaders } from "./headers.ts";

function headerValue(nodeEnv: string, key: string): string {
  const header = buildSecurityHeaders(nodeEnv).find((entry) => entry.key === key);
  assert.ok(header);
  return header.value;
}

test("production headers frame-deny the site and require a session secret transport", () => {
  assert.equal(headerValue("production", "X-Frame-Options"), "DENY");
  assert.equal(headerValue("production", "Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.match(headerValue("production", "Content-Security-Policy"), /frame-ancestors 'none'/);
  assert.doesNotMatch(headerValue("production", "Content-Security-Policy"), /unsafe-eval/);
  assert.match(headerValue("production", "Strict-Transport-Security"), /max-age=/);
});

test("development headers allow the local refresh socket", () => {
  assert.match(headerValue("development", "Content-Security-Policy"), /ws:/);
  assert.equal(buildSecurityHeaders("development").some((header) => header.key === "Strict-Transport-Security"), false);
});
