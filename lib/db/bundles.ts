import "server-only";

import { io } from "next/cache";
import { getDb } from "@/lib/db/client";
import {
  availableSets,
  comparePriceSar,
  isBottleSize,
  maximumBundlePartQuantity,
  maximumBundleParts,
  minimumBundleParts,
} from "@/lib/catalog/bundles";
import type { BundleComponent, BundleOffer } from "@/lib/catalog/bundles";
import { maximumStockCount } from "@/lib/catalog/stock";
import type { BottleSize } from "@/lib/catalog/types";

export type { BundleOffer };

type BundleRow = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  price_sar: number;
  stock_count: number;
  is_published: number;
};

type PartRow = {
  bundle_id: string;
  product_id: string;
  size_ml: number;
  quantity: number;
  slug: string | null;
  name_ar: string | null;
  name_en: string | null;
  is_published: number | null;
  price_sar: number | null;
  offer_stock: number | null;
  is_listed: number | null;
};

export type BundleInput = {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  priceSar: number;
  stockCount: number;
  isPublished: boolean;
  parts: Array<{ productId: string; sizeMl: number; quantity: number }>;
};

export async function listBundles(): Promise<BundleOffer[]> {
  const db = await openDatabase();
  const rows = db.prepare(`
    SELECT id, slug, name_ar, name_en, description_ar, price_sar, stock_count, is_published
    FROM bundle_offers
    ORDER BY created_at DESC
  `).all() as BundleRow[];
  const parts = db.prepare(`
    SELECT i.bundle_id, i.product_id, i.size_ml, i.quantity,
           p.slug, p.name_ar, p.name_en, p.is_published, o.price_sar, o.stock_count AS offer_stock, o.is_listed
    FROM bundle_offer_items i
    LEFT JOIN products p ON p.id = i.product_id
    LEFT JOIN product_offers o ON o.product_id = i.product_id AND o.size_ml = i.size_ml
    ORDER BY i.rowid
  `).all() as PartRow[];
  return rows.map((row) => toBundle(row, parts));
}

export async function listStoreBundles(): Promise<BundleOffer[]> {
  const bundles = await listBundles();
  return bundles.filter((bundle) => bundle.isPublished && bundle.isComplete && comparePriceSar(bundle.parts) > bundle.priceSar);
}

export async function saveBundle(input: BundleInput, id?: string): Promise<string> {
  const nameAr = input.nameAr.trim();
  const nameEn = input.nameEn.trim();
  const descriptionAr = input.descriptionAr.trim();
  if (nameAr.length < 2 || nameAr.length > 80) throw new Error("أكمل اسم الباندل.");
  if (nameEn.length < 2 || nameEn.length > 80) throw new Error("أكمل الاسم اللاتيني.");
  if (descriptionAr.length < 8 || descriptionAr.length > 400) throw new Error("أكمل وصف العرض.");
  if (!Number.isInteger(input.priceSar) || input.priceSar < 1 || input.priceSar > 20000) {
    throw new Error("أكمل سعر العرض.");
  }
  if (!Number.isInteger(input.stockCount) || input.stockCount < 0 || input.stockCount > maximumStockCount) {
    throw new Error("أكمل مخزون العرض.");
  }
  const parts = normalizeParts(input.parts);
  const db = await openDatabase();
  const priced = parts.map((part) => readPricedPart(db, part));
  if (input.priceSar >= comparePriceSar(priced)) throw new Error("أكمل سعرًا أقل من مجموع الزجاجات.");
  const bundleId = id ?? crypto.randomUUID();
  const existing = id
    ? (db.prepare("SELECT slug FROM bundle_offers WHERE id = ?").get(id) as { slug: string } | undefined)
    : undefined;
  if (id && !existing) throw new Error("العرض غير موجود.");
  const slug = existing?.slug ?? createUniqueSlug(db, nameEn);
  db.exec("BEGIN");
  try {
    if (existing) {
      db.prepare(`
        UPDATE bundle_offers
        SET name_ar = ?, name_en = ?, description_ar = ?, price_sar = ?, stock_count = ?, is_published = ?
        WHERE id = ?
      `).run(nameAr, nameEn, descriptionAr, input.priceSar, input.stockCount, input.isPublished ? 1 : 0, bundleId);
      db.prepare("DELETE FROM bundle_offer_items WHERE bundle_id = ?").run(bundleId);
    } else {
      db.prepare(`
        INSERT INTO bundle_offers (
          id, slug, name_ar, name_en, description_ar, price_sar, stock_count, is_published, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        bundleId,
        slug,
        nameAr,
        nameEn,
        descriptionAr,
        input.priceSar,
        input.stockCount,
        input.isPublished ? 1 : 0,
        new Date().toISOString(),
      );
    }
    const insertPart = db.prepare(
      "INSERT INTO bundle_offer_items (bundle_id, product_id, size_ml, quantity) VALUES (?, ?, ?, ?)",
    );
    priced.forEach((part) => insertPart.run(bundleId, part.productId, part.sizeMl, part.quantity));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return bundleId;
}

export async function deleteBundle(id: string): Promise<void> {
  const db = await openDatabase();
  db.prepare("DELETE FROM bundle_offers WHERE id = ?").run(id);
}

function toBundle(row: BundleRow, parts: PartRow[]): BundleOffer {
  const owned = parts.filter((part) => part.bundle_id === row.id);
  const resolved = owned.flatMap((part) => resolvePart(part));
  return {
    id: row.id,
    slug: row.slug,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    descriptionAr: row.description_ar,
    priceSar: row.price_sar,
    stockCount: row.stock_count,
    isPublished: row.is_published === 1,
    isComplete: owned.length >= minimumBundleParts && resolved.length === owned.length,
    parts: resolved,
  };
}

function resolvePart(part: PartRow): BundleComponent[] {
  if (!part.slug || !part.name_ar || !part.name_en || part.is_published !== 1 || part.is_listed !== 1) return [];
  if (!isBottleSize(part.size_ml) || part.price_sar === null || part.price_sar < 1 || part.offer_stock === null) return [];
  if (part.quantity < 1 || part.quantity > maximumBundlePartQuantity) return [];
  return [{
    productId: part.product_id,
    slug: part.slug,
    nameAr: part.name_ar,
    nameEn: part.name_en,
    sizeMl: part.size_ml,
    quantity: part.quantity,
    unitPriceSar: part.price_sar,
    stockCount: part.offer_stock,
  }];
}

function normalizeParts(parts: BundleInput["parts"]): Array<{ productId: string; sizeMl: BottleSize; quantity: number }> {
  if (parts.length < minimumBundleParts || parts.length > maximumBundleParts) {
    throw new Error("أكمل قطعتين على الأقل، وأربع قطع كحد أقصى.");
  }
  const seen = new Set<string>();
  return parts.map((part) => {
    const productId = part.productId.trim();
    const quantity = Math.floor(part.quantity);
    if (productId.length < 2 || productId.length > 80 || !isBottleSize(part.sizeMl)) {
      throw new Error("أكمل زجاجات منشورة ومتاحة.");
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > maximumBundlePartQuantity) {
      throw new Error("أكمل كمية كل زجاجة بين 1 و 3.");
    }
    const key = `${productId}:${part.sizeMl}`;
    if (seen.has(key)) throw new Error("أكمل كل زجاجة مرة واحدة داخل العرض.");
    seen.add(key);
    return { productId, sizeMl: part.sizeMl, quantity };
  });
}

function readPricedPart(
  db: ReturnType<typeof getDb>,
  part: { productId: string; sizeMl: BottleSize; quantity: number },
): BundleComponent {
  const row = db.prepare(`
    SELECT p.slug, p.name_ar, p.name_en, o.price_sar, o.stock_count
    FROM products p
    JOIN product_offers o ON o.product_id = p.id
    WHERE p.id = ? AND p.is_published = 1 AND o.is_listed = 1 AND o.size_ml = ? AND o.price_sar >= 1
  `).get(part.productId, part.sizeMl) as
    | { slug: string; name_ar: string; name_en: string; price_sar: number; stock_count: number }
    | undefined;
  if (!row) throw new Error("أكمل زجاجات منشورة ومتاحة.");
  return {
    productId: part.productId,
    slug: row.slug,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    sizeMl: part.sizeMl,
    quantity: part.quantity,
    unitPriceSar: row.price_sar,
    stockCount: row.stock_count,
  };
}

function createUniqueSlug(db: ReturnType<typeof getDb>, nameEn: string): string {
  const base = nameEn.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "bundle";
  let slug = base;
  let index = 2;
  while (db.prepare("SELECT id FROM bundle_offers WHERE slug = ?").get(slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}

async function openDatabase() {
  await io();
  return getDb();
}

export function bundleSetsAvailable(bundle: BundleOffer): number {
  if (!bundle.isComplete) return 0;
  return availableSets(bundle.stockCount, bundle.parts);
}
