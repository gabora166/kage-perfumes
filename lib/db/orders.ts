import "server-only";

import { io } from "next/cache";
import { getDb } from "@/lib/db/client";
import { concentrationLabels } from "@/lib/catalog/labels";
import type { Concentration } from "@/lib/catalog/labels";
import { bottleSizes } from "@/lib/catalog/types";
import type { BottleSize } from "@/lib/catalog/types";
import { orderPageSize, orderSearchPattern, readOrderPage } from "@/lib/orders/paging";
import { isOrderStatus } from "@/lib/orders/status";
import type { OrderStatus } from "@/lib/orders/status";
import { normalizePhoneDigits } from "@/lib/orders/match";
import { buildWhatsAppUrl, composeOrderMessage } from "@/lib/orders/whatsapp";
import { canPriceBlend, isBlendNoteId, noteName, priceCustomBlend } from "@/lib/pricing/custom-blend";
import { cleanGiftMessage, isGiftMessageTooLong, quoteTotals } from "@/lib/checkout/adjustments";
import { firstCustomerError } from "@/lib/checkout/customer";
import { availableSets } from "@/lib/catalog/bundles";
import { discoverySetId, sampleSizeMl } from "@/lib/catalog/samples";
import { discountForCode, redeemPromo } from "@/lib/db/promos";
import { reserveOrderStock, transitionOrderStatus } from "@/lib/orders/inventory";

export type CheckoutItem =
  | { kind: "catalog"; productId: string; sizeMl: number; quantity: number }
  | { kind: "custom"; sizeMl: number; concentration: string; noteIds: string[]; quantity: number }
  | { kind: "sample"; productId: string; quantity: number }
  | { kind: "discovery"; quantity: number }
  | { kind: "bundle"; bundleId: string; quantity: number };

export type CheckoutRequest = {
  customerName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  giftWrap: boolean;
  giftMessage: string;
  promoCode: string;
  items: CheckoutItem[];
};

export type CheckoutQuote = {
  subtotalSar: number;
  discountSar: number;
  giftWrapSar: number;
  totalSar: number;
  code: string | null;
};

export type OrderItemRecord = {
  kind: "catalog" | "custom" | "sample" | "discovery" | "bundle";
  nameAr: string;
  nameEn: string;
  sizeMl: number;
  quantity: number;
  unitPriceSar: number;
  detail: string;
};

export type OrderRecord = {
  id: string;
  reference: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  internalNote: string;
  giftWrap: boolean;
  giftMessage: string;
  promoCode: string | null;
  discountSar: number;
  status: OrderStatus;
  totalSar: number;
  createdAt: string;
  whatsappUrl: string | null;
  items: OrderItemRecord[];
};

type OrderRow = {
  id: string;
  reference: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  internal_note: string;
  gift_wrap: number;
  gift_message: string;
  promo_code: string | null;
  discount_sar: number;
  status: string;
  total_sar: number;
  created_at: string;
};

type ItemRow = {
  order_id: string;
  kind: string;
  name_ar: string;
  name_en: string;
  size_ml: number;
  concentration: string | null;
  custom_notes: string | null;
  quantity: number;
  unit_price_sar: number;
};

export async function createOrder(input: CheckoutRequest): Promise<{
  reference: string;
  totalSar: number;
  whatsappUrl: string | null;
}> {
  const customerName = input.customerName.trim();
  const phone = input.phone.trim();
  const city = input.city.trim();
  const address = input.address.trim();
  const customerError = firstCustomerError({ customerName, phone, city, address });
  if (customerError) throw new Error(customerError);
  const db = await openDatabase();
  const prepared = await prepareCheckout(db, input);
  const id = crypto.randomUUID();
  const reference = createReference(db);
  const createdAt = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    reserveOrderStock(db, prepared.priced);
    if (prepared.promoId) redeemPromo(db, prepared.promoId);
    db.prepare(`
      INSERT INTO orders (
        id, reference, customer_name, phone, city, address, notes, gift_wrap, gift_message, promo_code, discount_sar,
        payment_method, status, total_sar, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cod', 'pending', ?, ?)
    `).run(
      id,
      reference,
      customerName,
      phone,
      city,
      address,
      input.notes.trim(),
      prepared.giftWrap ? 1 : 0,
      prepared.giftMessage,
      prepared.code,
      prepared.totals.discountSar,
      prepared.totals.totalSar,
      createdAt,
    );
    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id, kind, product_id, name_ar, name_en, size_ml, concentration, custom_notes, quantity, unit_price_sar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertPart = db.prepare(`
      INSERT INTO order_bundle_parts (order_id, bundle_id, product_id, size_ml, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);
    prepared.priced.forEach((item) => {
      insertItem.run(
        id,
        item.kind,
        item.productId,
        item.nameAr,
        item.nameEn,
        item.sizeMl,
        item.concentration,
        item.customNotes,
        item.quantity,
        item.unitPriceSar,
      );
      if (item.kind !== "bundle" || !item.productId) return;
      (item.parts ?? []).forEach((part) => {
        insertPart.run(id, item.productId, part.productId, part.sizeMl, part.quantity);
      });
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  const message = composeOrderMessage({
    reference,
    customerName,
    phone,
    city,
    address,
    notes: input.notes.trim(),
    giftWrap: prepared.giftWrap,
    giftMessage: prepared.giftMessage,
    promoCode: prepared.code,
    discountSar: prepared.totals.discountSar,
    totalSar: prepared.totals.totalSar,
    items: prepared.priced.map((item) => ({
      nameAr: item.nameAr,
      detail: item.detail,
      quantity: item.quantity,
      lineTotalSar: item.unitPriceSar * item.quantity,
    })),
  });
  return {
    reference,
    totalSar: prepared.totals.totalSar,
    whatsappUrl: buildWhatsAppUrl(process.env.STORE_WHATSAPP, message),
  };
}

export type GuestOrderItem = {
  nameAr: string;
  detail: string;
  quantity: number;
};

export type GuestOrderView = {
  reference: string;
  status: OrderStatus;
  totalSar: number;
  createdAt: string;
  items: GuestOrderItem[];
};

const guestOrderLimit = 10;

export async function findGuestOrders(phoneInput: string): Promise<GuestOrderView[]> {
  const phone = normalizePhoneDigits(phoneInput);
  if (phone.length < 8 || phone.length > 15) return [];
  const db = await openDatabase();
  const orders = db.prepare(`
    SELECT id, reference, status, total_sar, created_at
    FROM orders
    WHERE replace(replace(replace(phone, ' ', ''), '-', ''), '+', '') = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(phone, guestOrderLimit) as Array<{
    id: string;
    reference: string;
    status: string;
    total_sar: number;
    created_at: string;
  }>;
  return orders.flatMap((order) => {
    if (!isOrderStatus(order.status)) return [];
    const items = db.prepare(`
      SELECT kind, name_ar, size_ml, custom_notes, quantity
      FROM order_items
      WHERE order_id = ?
    `).all(order.id) as Array<{ kind: string; name_ar: string; size_ml: number; custom_notes: string | null; quantity: number }>;
    return [{
      reference: order.reference,
      status: order.status,
      totalSar: order.total_sar,
      createdAt: order.created_at,
      items: items.map((item) => ({
        nameAr: item.name_ar,
        detail: describeOrderItem(item.kind, item.size_ml, item.custom_notes),
        quantity: item.quantity,
      })),
    }];
  });
}

export type OrderPage = {
  orders: OrderRecord[];
  page: number;
  pageCount: number;
  total: number;
};

const orderColumns = `
  id, reference, customer_name, phone, city, address, notes, internal_note, gift_wrap, gift_message,
  promo_code, discount_sar, status, total_sar, created_at
`;

const phoneDigitsSql = `replace(replace(replace(phone, ' ', ''), '-', ''), '+', '')`;

export async function listOrdersPage(
  page: number,
  search = "",
  status: OrderStatus | "" = "",
): Promise<OrderPage> {
  const db = await openDatabase();
  const requested = readOrderPage(String(page));
  const pattern = orderSearchPattern(search);
  const phonePattern = orderSearchPattern(normalizePhoneDigits(search) || search);
  const hasSearch = search.trim().length > 0;
  const filters = `
    WHERE (? = 0 OR reference LIKE ? ESCAPE '\\' OR customer_name LIKE ? ESCAPE '\\' OR ${phoneDigitsSql} LIKE ? ESCAPE '\\')
      AND (? = '' OR status = ?)
  `;
  const filterValues = [hasSearch ? 1 : 0, pattern, pattern, phonePattern, status, status];
  const totalRow = db.prepare(`SELECT COUNT(*) AS count FROM orders ${filters}`).get(...filterValues) as { count: number };
  const total = totalRow.count;
  const pageCount = Math.max(1, Math.ceil(total / orderPageSize));
  const safePage = Math.min(requested, pageCount);
  const orders = db.prepare(`
    SELECT ${orderColumns}
    FROM orders
    ${filters}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...filterValues, orderPageSize, (safePage - 1) * orderPageSize) as OrderRow[];
  return {
    orders: readOrders(db, orders),
    page: safePage,
    pageCount,
    total,
  };
}

export async function getOrder(id: string): Promise<OrderRecord | undefined> {
  const db = await openDatabase();
  const order = db.prepare(`SELECT ${orderColumns} FROM orders WHERE id = ?`).get(id) as OrderRow | undefined;
  if (!order) return undefined;
  return readOrders(db, [order])[0];
}

function readOrders(db: ReturnType<typeof getDb>, orders: OrderRow[]): OrderRecord[] {
  if (orders.length === 0) return [];
  const marks = orders.map(() => "?").join(", ");
  const items = db.prepare(`
    SELECT order_id, kind, name_ar, name_en, size_ml, concentration, custom_notes, quantity, unit_price_sar
    FROM order_items
    WHERE order_id IN (${marks})
  `).all(...orders.map((order) => order.id)) as ItemRow[];
  return orders.flatMap((order) => {
    if (!isOrderStatus(order.status)) return [];
    return [toOrder(order, items)];
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const db = await openDatabase();
  transitionOrderStatus(db, id, status);
}

export async function updateOrderNote(id: string, internalNote: string): Promise<void> {
  const db = await openDatabase();
  db.prepare("UPDATE orders SET internal_note = ? WHERE id = ?").run(internalNote.trim().slice(0, 500), id);
}

export async function quoteCheckout(input: {
  items: CheckoutItem[];
  giftWrap: boolean;
  giftMessage: string;
  promoCode: string;
}): Promise<CheckoutQuote> {
  const db = await openDatabase();
  const prepared = await prepareCheckout(db, input);
  return {
    subtotalSar: prepared.subtotalSar,
    discountSar: prepared.totals.discountSar,
    giftWrapSar: prepared.totals.giftWrapSar,
    totalSar: prepared.totals.totalSar,
    code: prepared.code,
  };
}

async function prepareCheckout(
  db: ReturnType<typeof getDb>,
  input: { items: CheckoutItem[]; giftWrap: boolean; giftMessage: string; promoCode: string },
): Promise<{
  priced: PricedItem[];
  subtotalSar: number;
  totals: ReturnType<typeof quoteTotals>;
  giftWrap: boolean;
  giftMessage: string;
  promoId: string | null;
  code: string | null;
}> {
  if (isGiftMessageTooLong(input.giftMessage)) throw new Error("رسالة البطاقة أطول من المسموح.");
  const priced = priceItems(db, input.items);
  const subtotalSar = priced.reduce((sum, item) => sum + item.unitPriceSar * item.quantity, 0);
  const promo = input.promoCode.trim() ? await discountForCode(input.promoCode, subtotalSar) : null;
  const giftWrap = input.giftWrap === true;
  return {
    priced,
    subtotalSar,
    totals: quoteTotals({ subtotalSar, giftWrap, discountSar: promo?.discountSar ?? 0 }),
    giftWrap,
    giftMessage: giftWrap ? cleanGiftMessage(input.giftMessage) : "",
    promoId: promo?.id ?? null,
    code: promo?.code ?? null,
  };
}

function priceItems(db: ReturnType<typeof getDb>, items: CheckoutItem[]): PricedItem[] {
  if (items.length < 1 || items.length > 12) throw new Error("الحقيبة فارغة أو أطول من المسموح.");
  return items.map((item) => {
    const quantity = Math.floor(item.quantity);
    if (quantity < 1 || quantity > 6) throw new Error("كمية غير مسموحة.");
    if (item.kind === "sample") return priceSampleItem(db, item.productId, quantity);
    if (item.kind === "discovery") return priceDiscoveryItem(db, quantity);
    if (item.kind === "bundle") return priceBundleItem(db, item.bundleId, quantity);
    if (!isBottleSize(item.sizeMl)) throw new Error("حجم الزجاجة غير معروف.");
    if (item.kind === "catalog") return priceCatalogItem(db, item.productId, item.sizeMl, quantity);
    return priceCustomItem(item, quantity);
  });
}

function priceSampleItem(db: ReturnType<typeof getDb>, productId: string, quantity: number): PricedItem {
  const row = db.prepare(`
    SELECT name_ar, name_en, sample_price_sar, sample_stock_count, sample_is_enabled
    FROM products
    WHERE id = ? AND is_published = 1
  `).get(productId) as
    | {
        name_ar: string;
        name_en: string;
        sample_price_sar: number | null;
        sample_stock_count: number;
        sample_is_enabled: number;
      }
    | undefined;
  if (!row || row.sample_price_sar === null || row.sample_price_sar < 1 || row.sample_is_enabled !== 1) {
    throw new Error("أحد العطور لم يعد متاحًا.");
  }
  if (row.sample_stock_count < quantity) throw new Error("أحد العيّنات نفد من المخزون.");
  return {
    kind: "sample",
    productId,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    sizeMl: sampleSizeMl,
    concentration: null,
    customNotes: "عيّنة",
    quantity,
    unitPriceSar: row.sample_price_sar,
    detail: `${sampleSizeMl} مل · عيّنة`,
  };
}

function priceDiscoveryItem(db: ReturnType<typeof getDb>, quantity: number): PricedItem {
  if (quantity > 2) throw new Error("كمية غير مسموحة.");
  const row = db.prepare(`
    SELECT name_ar, name_en, price_sar, stock_count, is_published
    FROM discovery_sets
    WHERE id = ?
  `).get(discoverySetId) as
    | { name_ar: string; name_en: string; price_sar: number; stock_count: number; is_published: number }
    | undefined;
  const vials = db.prepare(`
    SELECT name_ar FROM products
    WHERE is_published = 1 AND sample_price_sar IS NOT NULL AND sample_is_enabled = 1
    ORDER BY name_ar
  `).all() as Array<{ name_ar: string }>;
  if (!row || row.is_published !== 1 || vials.length < 2) throw new Error("مجموعة الاكتشاف غير متاحة.");
  if (row.stock_count < quantity) throw new Error("مجموعة الاكتشاف نفدت.");
  const names = vials.map((vial) => vial.name_ar).join("، ");
  return {
    kind: "discovery",
    productId: discoverySetId,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    sizeMl: sampleSizeMl,
    concentration: null,
    customNotes: names,
    quantity,
    unitPriceSar: row.price_sar,
    detail: `${sampleSizeMl} مل · ${names}`,
  };
}

function priceBundleItem(db: ReturnType<typeof getDb>, bundleId: string, quantity: number): PricedItem {
  if (bundleId.trim().length < 2 || bundleId.length > 80) throw new Error("عرض الباندل لم يعد متاحًا.");
  const row = db.prepare(`
    SELECT name_ar, name_en, price_sar, stock_count, is_published
    FROM bundle_offers
    WHERE id = ?
  `).get(bundleId) as
    | { name_ar: string; name_en: string; price_sar: number; stock_count: number; is_published: number }
    | undefined;
  const partRows = db.prepare(`
    SELECT i.product_id, i.size_ml, i.quantity, p.name_ar, o.price_sar, o.stock_count
    FROM bundle_offer_items i
    JOIN products p ON p.id = i.product_id AND p.is_published = 1
    JOIN product_offers o ON o.product_id = i.product_id AND o.size_ml = i.size_ml AND o.is_listed = 1 AND o.price_sar >= 1
    WHERE i.bundle_id = ?
    ORDER BY i.rowid
  `).all(bundleId) as Array<{
    product_id: string;
    size_ml: number;
    quantity: number;
    name_ar: string;
    price_sar: number;
    stock_count: number;
  }>;
  const stored = db.prepare("SELECT COUNT(*) AS count FROM bundle_offer_items WHERE bundle_id = ?").get(bundleId) as {
    count: number;
  };
  if (!row || row.is_published !== 1 || partRows.length < 2 || partRows.length !== stored.count) {
    throw new Error("عرض الباندل لم يعد متاحًا.");
  }
  const pricedParts = partRows.map((part) => ({
    productId: part.product_id,
    nameAr: part.name_ar,
    sizeMl: part.size_ml,
    quantity: part.quantity,
    unitPriceSar: part.price_sar,
    stockCount: part.stock_count,
  }));
  const compare = pricedParts.reduce((sum, part) => sum + part.unitPriceSar * part.quantity, 0);
  if (row.price_sar >= compare || availableSets(row.stock_count, pricedParts) < quantity) {
    throw new Error("عرض الباندل لم يعد متاحًا.");
  }
  const detail = pricedParts
    .map((part) => `${part.nameAr} ${part.sizeMl} مل${part.quantity > 1 ? ` × ${part.quantity}` : ""}`)
    .join("، ");
  return {
    kind: "bundle",
    productId: bundleId,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    sizeMl: 0,
    concentration: null,
    customNotes: detail,
    quantity,
    unitPriceSar: row.price_sar,
    detail,
    parts: pricedParts.map((part) => ({
      productId: part.productId,
      sizeMl: part.sizeMl,
      quantity: part.quantity * quantity,
    })),
  };
}

function priceCatalogItem(
  db: ReturnType<typeof getDb>,
  productId: string,
  sizeMl: BottleSize,
  quantity: number,
): PricedItem {
  const row = db.prepare(`
    SELECT p.name_ar, p.name_en, o.price_sar, o.stock_count
    FROM products p
    JOIN product_offers o ON o.product_id = p.id
    WHERE p.id = ? AND p.is_published = 1 AND o.is_listed = 1 AND o.size_ml = ?
  `).get(productId, sizeMl) as
    | { name_ar: string; name_en: string; price_sar: number; stock_count: number }
    | undefined;
  if (!row) throw new Error("أحد العطور لم يعد متاحًا.");
  if (row.stock_count < 1) throw new Error("أحد الأحجام نفد من المخزون.");
  if (row.stock_count < quantity) throw new Error("الكمية أكبر من المتوفر.");
  return {
    kind: "catalog",
    productId,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    sizeMl,
    concentration: null,
    customNotes: null,
    quantity,
    unitPriceSar: row.price_sar,
    detail: `${sizeMl} مل`,
  };
}

function priceCustomItem(
  item: Extract<CheckoutItem, { kind: "custom" }>,
  quantity: number,
): PricedItem {
  if (!isConcentration(item.concentration)) throw new Error("الكثافة غير معروفة.");
  if (!isBottleSize(item.sizeMl)) throw new Error("حجم الزجاجة غير معروف.");
  const sizeMl = item.sizeMl;
  const noteIds = [...new Set(item.noteIds)];
  if (!canPriceBlend(noteIds.length) || noteIds.some((id) => !isBlendNoteId(id))) {
    throw new Error("اختر النوتات ضمن الحد المسموح.");
  }
  const names = noteIds.map((id) => noteName(id)).join("، ");
  return {
    kind: "custom",
    productId: null,
    nameAr: "عطر خاص",
    nameEn: "Private Blend",
    sizeMl: item.sizeMl,
    concentration: item.concentration,
    customNotes: names,
    quantity,
    unitPriceSar: priceCustomBlend({
      sizeMl,
      concentration: item.concentration,
      noteCount: noteIds.length,
    }),
    detail: `${sizeMl} مل · ${concentrationLabels[item.concentration].ar} · ${names}`,
  };
}

function createReference(db: ReturnType<typeof getDb>): string {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const reference = `AQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const existing = db.prepare("SELECT id FROM orders WHERE reference = ?").get(reference);
    if (!existing) return reference;
  }
  return `AQ-${Date.now().toString().slice(-6)}`;
}

function toOrder(order: OrderRow, items: ItemRow[]): OrderRecord {
  return {
    id: order.id,
    reference: order.reference,
    customerName: order.customer_name,
    phone: order.phone,
    city: order.city,
    address: order.address,
    notes: order.notes,
    internalNote: order.internal_note,
    giftWrap: order.gift_wrap === 1,
    giftMessage: order.gift_message,
    promoCode: order.promo_code,
    discountSar: order.discount_sar,
    status: isOrderStatus(order.status) ? order.status : "pending",
    totalSar: order.total_sar,
    createdAt: order.created_at,
    whatsappUrl: buildWhatsAppUrl(process.env.STORE_WHATSAPP, composeOrderMessage({
      reference: order.reference,
      customerName: order.customer_name,
      phone: order.phone,
      city: order.city,
      address: order.address,
      notes: order.notes,
      giftWrap: order.gift_wrap === 1,
      giftMessage: order.gift_message,
      promoCode: order.promo_code,
      discountSar: order.discount_sar,
      totalSar: order.total_sar,
      items: items.flatMap((item) => {
        if (item.order_id !== order.id) return [];
        return [{
          nameAr: item.name_ar,
          detail: describeOrderItem(item.kind, item.size_ml, item.custom_notes),
          quantity: item.quantity,
          lineTotalSar: item.unit_price_sar * item.quantity,
        }];
      }),
    })),
    items: items.flatMap((item) => {
      if (item.order_id !== order.id) return [];
      return [{
        kind: readItemKind(item.kind),
        nameAr: item.name_ar,
        nameEn: item.name_en,
        sizeMl: item.size_ml,
        quantity: item.quantity,
        unitPriceSar: item.unit_price_sar,
        detail: describeOrderItem(item.kind, item.size_ml, item.custom_notes),
      }];
    }),
  };
}

async function openDatabase() {
  await io();
  return getDb();
}

function isBottleSize(value: number): value is BottleSize {
  return bottleSizes.some((size) => size === value);
}

function readItemKind(kind: string): OrderItemRecord["kind"] {
  if (kind === "custom" || kind === "sample" || kind === "discovery" || kind === "bundle") return kind;
  return "catalog";
}

function describeOrderItem(kind: string, sizeMl: number, notes: string | null): string {
  if (kind === "bundle") return notes?.trim() || "باندل";
  if (notes?.trim()) return `${sizeMl} مل · ${notes}`;
  return `${sizeMl} مل`;
}

function isConcentration(value: string): value is Concentration {
  return value === "eau-de-parfum" || value === "extrait";
}

type PricedItem = {
  kind: "catalog" | "custom" | "sample" | "discovery" | "bundle";
  productId: string | null;
  nameAr: string;
  nameEn: string;
  sizeMl: number;
  concentration: string | null;
  customNotes: string | null;
  quantity: number;
  unitPriceSar: number;
  detail: string;
  parts?: Array<{ productId: string; sizeMl: number; quantity: number }>;
};
