import { discoverySetId } from "@/lib/catalog/samples";
import { maximumStockCount } from "@/lib/catalog/stock";
import { isClosedOrderStatus, isOrderStatus } from "@/lib/orders/status";
import type { OrderStatus } from "@/lib/orders/status";

type Sql = {
  exec(sql: string): void;
  prepare(sql: string): {
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): { changes: number | bigint };
  };
};

export type StockPart = {
  productId: string;
  sizeMl: number;
  quantity: number;
};

export type StockLine = {
  kind: "catalog" | "custom" | "sample" | "discovery" | "bundle";
  productId: string | null;
  sizeMl: number;
  quantity: number;
  parts?: StockPart[];
};

type StockTotals = Map<string, { productId: string; sizeMl: number; quantity: number }>;

export function reserveOrderStock(db: Sql, items: StockLine[]): void {
  reserveCatalogStock(db, items);
  reserveSampleStock(db, items);
  reserveDiscoveryStock(db, items);
  reserveBundleStock(db, items);
}

export function releaseOrderStock(db: Sql, items: StockLine[]): void {
  releaseCatalogStock(db, items);
  releaseSampleStock(db, items);
  releaseDiscoveryStock(db, items);
  releaseBundleStock(db, items);
}

export function transitionOrderStatus(db: Sql, id: string, status: OrderStatus): void {
  db.exec("BEGIN IMMEDIATE");
  try {
    const current = readStatus(db, id);
    if (current !== status) {
      const wasReleased = isClosedOrderStatus(current);
      const willRelease = isClosedOrderStatus(status);
      if (wasReleased !== willRelease) {
        const lines = readStockLines(db, id);
        if (willRelease) releaseOrderStock(db, lines);
        else reserveOrderStock(db, lines);
      }
      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function publicOrderStatusError(message: string): string {
  const allowed = message === "الطلب غير موجود."
    || message === "حالة غير معروفة."
    || message.startsWith("أحد")
    || message.startsWith("مجموعة")
    || message.startsWith("عرض")
    || message.startsWith("تعذّر إعادة")
    || message.startsWith("كمية");
  return allowed ? message : "تعذّر تحديث الحالة.";
}

function readStatus(db: Sql, id: string): OrderStatus {
  const row = db.prepare("SELECT status FROM orders WHERE id = ?").get(id) as { status: string } | undefined;
  if (!row) throw new Error("الطلب غير موجود.");
  if (!isOrderStatus(row.status)) throw new Error("حالة غير معروفة.");
  return row.status;
}

function readStockLines(db: Sql, orderId: string): StockLine[] {
  const rows = db.prepare(`
    SELECT kind, product_id, size_ml, quantity
    FROM order_items
    WHERE order_id = ?
  `).all(orderId) as Array<{
    kind: string;
    product_id: string | null;
    size_ml: number;
    quantity: number;
  }>;
  return rows.map((row) => {
    const kind = readKind(row.kind);
    return {
      kind,
      productId: row.product_id,
      sizeMl: row.size_ml,
      quantity: row.quantity,
      parts: kind === "bundle" ? readBundleParts(db, orderId, row.product_id) : undefined,
    };
  });
}

function readBundleParts(db: Sql, orderId: string, bundleId: string | null): StockPart[] {
  if (!bundleId) throw new Error("تعذّر إعادة المخزون.");
  const rows = db.prepare(`
    SELECT product_id, size_ml, quantity
    FROM order_bundle_parts
    WHERE order_id = ? AND bundle_id = ?
  `).all(orderId, bundleId) as Array<{ product_id: string; size_ml: number; quantity: number }>;
  if (rows.length < 1) throw new Error("تعذّر إعادة المخزون.");
  return rows.map((row) => ({ productId: row.product_id, sizeMl: row.size_ml, quantity: row.quantity }));
}

function readKind(kind: string): StockLine["kind"] {
  if (kind === "catalog" || kind === "custom" || kind === "sample" || kind === "discovery" || kind === "bundle") {
    return kind;
  }
  throw new Error("تعذّر إعادة المخزون.");
}

function reserveCatalogStock(db: Sql, items: StockLine[]): void {
  const updateStock = db.prepare(`
    UPDATE product_offers
    SET stock_count = stock_count - ?
    WHERE product_id = ? AND size_ml = ? AND is_listed = 1 AND stock_count >= ?
  `);
  catalogTotals(items).forEach((line) => {
    const result = updateStock.run(line.quantity, line.productId, line.sizeMl, line.quantity);
    if (!changedOnce(result)) throw new Error("أحد الأحجام نفد من المخزون.");
  });
}

function releaseCatalogStock(db: Sql, items: StockLine[]): void {
  const updateStock = db.prepare(`
    UPDATE product_offers
    SET stock_count = stock_count + ?
    WHERE product_id = ? AND size_ml = ?
  `);
  catalogTotals(items).forEach((line) => {
    const result = updateStock.run(line.quantity, line.productId, line.sizeMl);
    if (!changedOnce(result)) throw new Error("تعذّر إعادة المخزون.");
  });
}

function reserveSampleStock(db: Sql, items: StockLine[]): void {
  const updateStock = db.prepare(`
    UPDATE products
    SET sample_stock_count = sample_stock_count - ?
    WHERE id = ? AND sample_stock_count >= ?
  `);
  sampleTotals(items).forEach((quantity, productId) => {
    const result = updateStock.run(quantity, productId, quantity);
    if (!changedOnce(result)) throw new Error("أحد العيّنات نفد من المخزون.");
  });
}

function releaseSampleStock(db: Sql, items: StockLine[]): void {
  const updateStock = db.prepare(`
    UPDATE products
    SET sample_stock_count = sample_stock_count + ?
    WHERE id = ?
  `);
  sampleTotals(items).forEach((quantity, productId) => {
    const result = updateStock.run(quantity, productId);
    if (!changedOnce(result)) throw new Error("تعذّر إعادة المخزون.");
  });
}

function reserveDiscoveryStock(db: Sql, items: StockLine[]): void {
  const quantity = discoveryQuantity(items);
  if (quantity < 1) return;
  const result = db.prepare(`
    UPDATE discovery_sets
    SET stock_count = stock_count - ?
    WHERE id = ? AND stock_count >= ?
  `).run(quantity, discoverySetId, quantity);
  if (!changedOnce(result)) throw new Error("مجموعة الاكتشاف نفدت.");
}

function releaseDiscoveryStock(db: Sql, items: StockLine[]): void {
  const quantity = discoveryQuantity(items);
  if (quantity < 1) return;
  const result = db.prepare(`
    UPDATE discovery_sets
    SET stock_count = stock_count + ?
    WHERE id = ?
  `).run(quantity, discoverySetId);
  if (!changedOnce(result)) throw new Error("تعذّر إعادة المخزون.");
}

function reserveBundleStock(db: Sql, items: StockLine[]): void {
  bundleTotals(items).forEach((quantity, bundleId) => {
    const result = db.prepare(`
      UPDATE bundle_offers
      SET stock_count = stock_count - ?
      WHERE id = ? AND is_published = 1 AND stock_count >= ?
    `).run(quantity, bundleId, quantity);
    if (!changedOnce(result)) throw new Error("عرض الباندل لم يعد متاحًا.");
  });
}

function releaseBundleStock(db: Sql, items: StockLine[]): void {
  bundleTotals(items).forEach((quantity, bundleId) => {
    const result = db.prepare(`
      UPDATE bundle_offers
      SET stock_count = stock_count + ?
      WHERE id = ?
    `).run(quantity, bundleId);
    if (!changedOnce(result)) throw new Error("تعذّر إعادة المخزون.");
  });
}

function catalogTotals(items: StockLine[]): StockTotals {
  const totals: StockTotals = new Map();
  items.forEach((item) => {
    if (item.kind === "catalog" && item.productId) addBottle(totals, item.productId, item.sizeMl, item.quantity);
    if (item.kind !== "bundle") return;
    (item.parts ?? []).forEach((part) => addBottle(totals, part.productId, part.sizeMl, part.quantity));
  });
  totals.forEach((line) => assertQuantity(line.quantity));
  return totals;
}

function addBottle(totals: StockTotals, productId: string, sizeMl: number, quantity: number): void {
  assertQuantity(quantity);
  const key = `${productId}:${sizeMl}`;
  const current = totals.get(key);
  totals.set(key, {
    productId,
    sizeMl,
    quantity: (current?.quantity ?? 0) + quantity,
  });
}

function bundleTotals(items: StockLine[]): Map<string, number> {
  const totals = new Map<string, number>();
  items.forEach((item) => {
    if (item.kind !== "bundle") return;
    if (!item.productId) throw new Error("عرض الباندل لم يعد متاحًا.");
    assertQuantity(item.quantity);
    totals.set(item.productId, (totals.get(item.productId) ?? 0) + item.quantity);
  });
  totals.forEach((quantity) => assertQuantity(quantity));
  return totals;
}

function sampleTotals(items: StockLine[]): Map<string, number> {
  const totals = new Map<string, number>();
  items.forEach((item) => {
    if (item.kind !== "sample" || !item.productId) return;
    assertQuantity(item.quantity);
    totals.set(item.productId, (totals.get(item.productId) ?? 0) + item.quantity);
  });
  totals.forEach((quantity) => assertQuantity(quantity));
  return totals;
}

function discoveryQuantity(items: StockLine[]): number {
  const quantity = items.reduce((sum, item) => {
    if (item.kind !== "discovery") return sum;
    assertQuantity(item.quantity);
    return sum + item.quantity;
  }, 0);
  if (quantity > 0) assertQuantity(quantity);
  return quantity;
}

function assertQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > maximumStockCount) {
    throw new Error("كمية غير مسموحة.");
  }
}

function changedOnce(result: { changes: number | bigint }): boolean {
  return Number(result.changes) === 1;
}
