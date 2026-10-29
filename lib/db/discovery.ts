import "server-only";

import { io } from "next/cache";
import { getDb } from "@/lib/db/client";
import { discoverySetId } from "@/lib/catalog/samples";
import type { DiscoverySet } from "@/lib/catalog/samples";
import { maximumStockCount } from "@/lib/catalog/stock";
import type { Product } from "@/lib/catalog/types";

export type { DiscoverySet };

type DiscoveryRow = {
  id: string;
  name_ar: string;
  name_en: string;
  price_sar: number;
  stock_count: number;
  is_published: number;
};

export async function getDiscoverySet(products: Product[]): Promise<DiscoverySet | null> {
  const db = await openDatabase();
  const row = db.prepare(`
    SELECT id, name_ar, name_en, price_sar, stock_count, is_published
    FROM discovery_sets
    WHERE id = ?
  `).get(discoverySetId) as DiscoveryRow | undefined;
  if (!row) return null;
  return {
    id: row.id,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    priceSar: row.price_sar,
    stockCount: row.stock_count,
    isPublished: row.is_published === 1,
    vials: products.flatMap((product) => {
      if (!product.sample?.isEnabled) return [];
      return [{ productId: product.id, nameAr: product.nameAr, nameEn: product.nameEn }];
    }),
  };
}

export async function saveDiscoverySet(input: { priceSar: number; stockCount: number; isPublished: boolean }): Promise<void> {
  if (!Number.isInteger(input.priceSar) || input.priceSar < 1 || input.priceSar > 20000) {
    throw new Error("أكمل سعر مجموعة الاكتشاف.");
  }
  if (!Number.isInteger(input.stockCount) || input.stockCount < 0 || input.stockCount > maximumStockCount) {
    throw new Error("أكمل مخزون مجموعة الاكتشاف.");
  }
  const db = await openDatabase();
  db.prepare(`
    UPDATE discovery_sets
    SET price_sar = ?, stock_count = ?, is_published = ?
    WHERE id = ?
  `).run(input.priceSar, input.stockCount, input.isPublished ? 1 : 0, discoverySetId);
}

async function openDatabase() {
  await io();
  return getDb();
}
