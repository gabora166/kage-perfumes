import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { RateLimitError, consumeWindow } from "./rate-window.ts";

const orderLimit = 2;
const windowMs = 10 * 60 * 1000;

test("different clients do not share a bucket, and a missing key is never recorded as unknown", () => {
  const db = openRateDb();
  const now = 1_000_000;
  consumeWindow(db, { bucket: "orders", ip: "203.0.113.10", limit: orderLimit, windowMs, now });
  consumeWindow(db, { bucket: "orders", ip: "203.0.113.10", limit: orderLimit, windowMs, now: now + 1 });
  assert.throws(
    () => consumeWindow(db, { bucket: "orders", ip: "203.0.113.10", limit: orderLimit, windowMs, now: now + 2 }),
    RateLimitError,
  );
  consumeWindow(db, { bucket: "orders", ip: "203.0.113.20", limit: orderLimit, windowMs, now: now + 3 });
  assert.throws(() => consumeWindow(db, { bucket: "orders", ip: "unknown", limit: orderLimit, windowMs, now }), /missing/);
  assert.throws(() => consumeWindow(db, { bucket: "orders", ip: "", limit: orderLimit, windowMs, now }), /missing/);
  const keys = db.prepare("SELECT ip, hits FROM rate_limits ORDER BY ip").all() as Array<{ ip: string; hits: number }>;
  assert.deepEqual(keys.map((row) => ({ ip: row.ip, hits: Number(row.hits) })), [
    { ip: "203.0.113.10", hits: orderLimit },
    { ip: "203.0.113.20", hits: 1 },
  ]);
});

test("a blocked attempt does not consume another client's remaining attempts", () => {
  const db = openRateDb();
  const now = 5_000_000;
  consumeWindow(db, { bucket: "orders", ip: "phone:01000000001", limit: 1, windowMs, now });
  assert.throws(
    () => consumeWindow(db, { bucket: "orders", ip: "phone:01000000001", limit: 1, windowMs, now: now + 10 }),
    RateLimitError,
  );
  consumeWindow(db, { bucket: "orders", ip: "phone:01000000002", limit: 1, windowMs, now: now + 11 });
  const blocked = db.prepare("SELECT hits FROM rate_limits WHERE ip = ?").get("phone:01000000001") as { hits: number };
  assert.equal(blocked.hits, 1);
});

test("an expired window starts again for the same client only", () => {
  const db = openRateDb();
  consumeWindow(db, { bucket: "admin-login", ip: "203.0.113.10", limit: 1, windowMs, now: 10 });
  assert.throws(
    () => consumeWindow(db, { bucket: "admin-login", ip: "203.0.113.10", limit: 1, windowMs, now: 11 }),
    RateLimitError,
  );
  consumeWindow(db, { bucket: "admin-login", ip: "203.0.113.10", limit: 1, windowMs, now: 10 + windowMs });
  const row = db.prepare("SELECT hits FROM rate_limits WHERE bucket = ?").get("admin-login") as { hits: number };
  assert.equal(row.hits, 1);
});

function openRateDb(): DatabaseSync {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "ateeq-rate-")), "rate.sqlite");
  const db = new DatabaseSync(file);
  db.exec(`
    CREATE TABLE rate_limits (
      bucket TEXT NOT NULL,
      ip TEXT NOT NULL,
      hits INTEGER NOT NULL,
      window_started_at INTEGER NOT NULL,
      PRIMARY KEY (bucket, ip)
    );
  `);
  return db;
}
