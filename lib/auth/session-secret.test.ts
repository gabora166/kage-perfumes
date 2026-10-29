import assert from "node:assert/strict";
import test from "node:test";
import { resolveSessionSecret } from "./session-secret.ts";

test("production refuses a missing secret without the development fallback", () => {
  let fallbackReads = 0;
  assert.throws(
    () => resolveSessionSecret({
      nodeEnv: "production",
      sessionSecret: "short",
      readDevelopmentFallback: () => {
        fallbackReads += 1;
        return "development-only-secret";
      },
    }),
    /SESSION_SECRET is required in production/,
  );
  assert.equal(fallbackReads, 0);
});

test("production accepts a configured secret", () => {
  const secret = resolveSessionSecret({
    nodeEnv: "production",
    sessionSecret: "ateeq-local-session-secret",
    readDevelopmentFallback: () => "unused",
  });
  assert.equal(secret, "ateeq-local-session-secret");
});

test("development can use a local fallback", () => {
  const secret = resolveSessionSecret({
    nodeEnv: "development",
    sessionSecret: "",
    readDevelopmentFallback: () => "local-development-secret",
  });
  assert.equal(secret, "local-development-secret");
});
