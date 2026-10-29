import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { discoverySetId } from "../catalog/samples.ts";
import { releaseOrderStock, reserveOrderStock, transitionOrderStatus } from "./inventory.ts";
import type { StockLine } from "./inventory.ts";

const productId = "layl";
const sampleId = "ward";

test("creating an order reserves each stock pool once", () => {
  const db = openInventoryDb();
  const lines = houseLines();
  db.exec("BEGIN IMMEDIATE");
  reserveOrderStock(db, lines);
  db.exec("COMMIT");
  assert.equal(offerStock(db), 4);
  assert.equal(sampleStock(db), 1);
  assert.equal(discoveryStock(db), 6);
});

test("cancelling restores stock and repeating it does not", () => {
  const db = openInventoryDb();
  hold(db, "order-1", linesFor("catalog"));
  assert.equal(offerStock(db), 4);
  transitionOrderStatus(db, "order-1", "cancelled");
  assert.equal(offerStock(db), 5);
  assert.equal(statusOf(db, "order-1"), "cancelled");
  transitionOrderStatus(db, "order-1", "cancelled");
  assert.equal(offerStock(db), 5);
});

test("returning a cancelled order does not restore stock again", () => {
  const db = openInventoryDb();
  hold(db, "order-1", linesFor("catalog"));
  transitionOrderStatus(db, "order-1", "cancelled");
  transitionOrderStatus(db, "order-1", "returned");
  assert.equal(offerStock(db), 5);
  assert.equal(statusOf(db, "order-1"), "returned");
});

test("open fulfillment states keep the reservation until the order is closed", () => {
  const db = openInventoryDb();
  hold(db, "order-1", houseLines());
  for (const status of ["processing", "shipped", "delivered"] as const) {
    transitionOrderStatus(db, "order-1", status);
    assert.equal(offerStock(db), 4);
    assert.equal(sampleStock(db), 1);
    assert.equal(discoveryStock(db), 6);
  }
  transitionOrderStatus(db, "order-1", "returned");
  assert.equal(offerStock(db), 5);
  assert.equal(sampleStock(db), 2);
  assert.equal(discoveryStock(db), 7);
  assert.equal(statusOf(db, "order-1"), "returned");
});

test("reopening a cancelled order reserves again and fails closed when the unit was sold", () => {
  const db = openInventoryDb();
  setOfferStock(db, 1);
  hold(db, "order-1", linesFor("catalog"));
  assert.equal(offerStock(db), 0);
  transitionOrderStatus(db, "order-1", "cancelled");
  assert.equal(offerStock(db), 1);
  hold(db, "order-2", linesFor("catalog"));
  assert.equal(offerStock(db), 0);
  assert.throws(() => transitionOrderStatus(db, "order-1", "pending"), /نفد/);
  assert.equal(statusOf(db, "order-1"), "cancelled");
  assert.equal(offerStock(db), 0);
  assert.equal(statusOf(db, "order-2"), "pending");
});

test("a failed reservation rolls back the whole stock change", () => {
  const db = openInventoryDb();
  setSampleStock(db, 0);
  db.exec("BEGIN IMMEDIATE");
  assert.throws(() => reserveOrderStock(db, houseLines()), /العيّنات/);
  db.exec("ROLLBACK");
  assert.equal(offerStock(db), 5);
  assert.equal(sampleStock(db), 0);
  assert.equal(discoveryStock(db), 7);
});

test("a failed release leaves the order open and the other pools unchanged", () => {
  const db = openInventoryDb();
  hold(db, "order-1", houseLines());
  db.prepare("DELETE FROM product_offers WHERE product_id = ?").run(productId);
  assert.throws(() => transitionOrderStatus(db, "order-1", "cancelled"), /إعادة المخزون/);
  assert.equal(statusOf(db, "order-1"), "pending");
  assert.equal(sampleStock(db), 1);
  assert.equal(discoveryStock(db), 6);
});

test("sample stock and discovery stock move independently", () => {
  const db = openInventoryDb();
  reserveOrderStock(db, linesFor("sample"));
  assert.equal(sampleStock(db), 1);
  assert.equal(discoveryStock(db), 7);
  reserveOrderStock(db, linesFor("discovery"));
  assert.equal(sampleStock(db), 1);
  assert.equal(discoveryStock(db), 6);
  releaseOrderStock(db, linesFor("sample"));
  assert.equal(sampleStock(db), 2);
  assert.equal(discoveryStock(db), 6);
});

test("a second writer cannot take the last unit while the first transaction holds it", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "ateeq-lock-"));
  const file = path.join(directory, "inventory.sqlite");
  const holder = openFile(file);
  seed(holder);
  setOfferStock(holder, 1);
  const rival = openFile(file);
  holder.exec("BEGIN IMMEDIATE");
  reserveOrderStock(holder, linesFor("catalog"));
  assert.throws(() => rival.exec("BEGIN IMMEDIATE"));
  holder.exec("COMMIT");
  assert.equal(offerStock(holder), 0);
  assert.throws(() => {
    rival.exec("BEGIN IMMEDIATE");
    try {
      reserveOrderStock(rival, linesFor("catalog"));
      rival.exec("COMMIT");
    } catch (error) {
      rival.exec("ROLLBACK");
      throw error;
    }
  }, /نفد/);
  assert.equal(offerStock(holder), 0);
});

test("the order row and its items stay in place when stock moves", () => {
  const db = openInventoryDb();
  hold(db, "order-1", linesFor("custom"));
  transitionOrderStatus(db, "order-1", "cancelled");
  const items = db.prepare("SELECT COUNT(*) AS count FROM order_items WHERE order_id = ?").get("order-1") as { count: number };
  const orders = db.prepare("SELECT COUNT(*) AS count FROM orders WHERE id = ?").get("order-1") as { count: number };
  assert.equal(items.count, 1);
  assert.equal(orders.count, 1);
});

function houseLines(): StockLine[] {
  return [...linesFor("catalog"), ...linesFor("sample"), ...linesFor("discovery")];
}

test("a bundle reserves its sets and the bottles inside them, then a cancellation restores both", () => {
  const db = openInventoryDb();
  seedBundle(db);
  const line = bundleLine(2);
  db.prepare("INSERT INTO orders (id, status) VALUES ('order-1', 'pending')").run();
  db.prepare(
    "INSERT INTO order_items (order_id, kind, product_id, size_ml, quantity) VALUES ('order-1', 'bundle', 'bundle-1', 0, 2)",
  ).run();
  db.prepare(
    "INSERT INTO order_bundle_parts (order_id, bundle_id, product_id, size_ml, quantity) VALUES ('order-1', 'bundle-1', ?, 50, 2)",
  ).run(productId);
  db.exec("BEGIN IMMEDIATE");
  reserveOrderStock(db, [line]);
  db.exec("COMMIT");
  assert.equal(offerStock(db), 3);
  assert.equal(bundleStock(db), 2);
  transitionOrderStatus(db, "order-1", "cancelled");
  assert.equal(offerStock(db), 5);
  assert.equal(bundleStock(db), 4);
  assert.equal(statusOf(db, "order-1"), "cancelled");
});

test("a short bottle stops the bundle reservation", () => {
  const db = openInventoryDb();
  seedBundle(db);
  setOfferStock(db, 1);
  db.exec("BEGIN IMMEDIATE");
  assert.throws(() => reserveOrderStock(db, [bundleLine(2)]), /نفد/);
  db.exec("ROLLBACK");
  assert.equal(offerStock(db), 1);
  assert.equal(bundleStock(db), 4);
});

function bundleLine(quantity: number): StockLine {
  return {
    kind: "bundle",
    productId: "bundle-1",
    sizeMl: 0,
    quantity,
    parts: [{ productId, sizeMl: 50, quantity }],
  };
}

function seedBundle(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bundle_offers (
      id TEXT PRIMARY KEY,
      stock_count INTEGER NOT NULL,
      is_published INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS order_bundle_parts (
      order_id TEXT NOT NULL,
      bundle_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      size_ml INTEGER NOT NULL,
      quantity INTEGER NOT NULL
    );
  `);
  db.prepare("INSERT INTO bundle_offers (id, stock_count, is_published) VALUES ('bundle-1', 4, 1)").run();
}

function bundleStock(db: DatabaseSync): number {
  const row = db.prepare("SELECT stock_count FROM bundle_offers WHERE id = 'bundle-1'").get() as { stock_count: number };
  return row.stock_count;
}

function linesFor(kind: StockLine["kind"]): StockLine[] {
  if (kind === "catalog") return [{ kind, productId, sizeMl: 50, quantity: 1 }];
  if (kind === "sample") return [{ kind, productId: sampleId, sizeMl: 2, quantity: 1 }];
  if (kind === "discovery") return [{ kind, productId: discoverySetId, sizeMl: 2, quantity: 1 }];
  if (kind === "bundle") return [bundleLine(1)];
  return [{ kind: "custom", productId: null, sizeMl: 50, quantity: 1 }];
}

function hold(db: DatabaseSync, orderId: string, lines: StockLine[]): void {
  db.prepare("INSERT INTO orders (id, status) VALUES (?, 'pending')").run(orderId);
  const insert = db.prepare("INSERT INTO order_items (order_id, kind, product_id, size_ml, quantity) VALUES (?, ?, ?, ?, ?)");
  lines.forEach((line) => insert.run(orderId, line.kind, line.productId, line.sizeMl, line.quantity));
  db.exec("BEGIN IMMEDIATE");
  reserveOrderStock(db, lines);
  db.exec("COMMIT");
}

function offerStock(db: DatabaseSync): number {
  const row = db.prepare("SELECT stock_count FROM product_offers WHERE product_id = ? AND size_ml = 50").get(productId) as { stock_count: number } | undefined;
  return row?.stock_count ?? -1;
}

function sampleStock(db: DatabaseSync): number {
  const row = db.prepare("SELECT sample_stock_count FROM products WHERE id = ?").get(sampleId) as { sample_stock_count: number };
  return row.sample_stock_count;
}

function discoveryStock(db: DatabaseSync): number {
  const row = db.prepare("SELECT stock_count FROM discovery_sets WHERE id = ?").get(discoverySetId) as { stock_count: number };
  return row.stock_count;
}

function statusOf(db: DatabaseSync, orderId: string): string {
  const row = db.prepare("SELECT status FROM orders WHERE id = ?").get(orderId) as { status: string };
  return row.status;
}

function setOfferStock(db: DatabaseSync, stock: number): void {
  db.prepare("UPDATE product_offers SET stock_count = ? WHERE product_id = ?").run(stock, productId);
}

function setSampleStock(db: DatabaseSync, stock: number): void {
  db.prepare("UPDATE products SET sample_stock_count = ? WHERE id = ?").run(stock, sampleId);
}

function openInventoryDb(): DatabaseSync {
  return openFile(path.join(fs.mkdtempSync(path.join(os.tmpdir(), "ateeq-stock-")), "inventory.sqlite"));
}

function openFile(file: string): DatabaseSync {
  const db = new DatabaseSync(file);
  db.exec("PRAGMA busy_timeout = 0");
  seed(db);
  return db;
}

function seed(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      product_id TEXT,
      size_ml INTEGER NOT NULL,
      quantity INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS product_offers (
      product_id TEXT NOT NULL,
      size_ml INTEGER NOT NULL,
      stock_count INTEGER NOT NULL,
      is_listed INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sample_stock_count INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS discovery_sets (
      id TEXT PRIMARY KEY,
      stock_count INTEGER NOT NULL
    );
  `);
  const offer = db.prepare("SELECT product_id FROM product_offers WHERE product_id = ?").get(productId);
  if (offer) return;
  db.prepare("INSERT INTO product_offers (product_id, size_ml, stock_count, is_listed) VALUES (?, 50, 5, 1)").run(productId);
  db.prepare("INSERT INTO products (id, sample_stock_count) VALUES (?, 2)").run(sampleId);
  db.prepare("INSERT INTO discovery_sets (id, stock_count) VALUES (?, 7)").run(discoverySetId);
}
