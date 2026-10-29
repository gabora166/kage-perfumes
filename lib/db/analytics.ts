import "server-only";

import { io } from "next/cache";
import { lowStockThreshold } from "@/lib/catalog/stock";
import { getDb } from "@/lib/db/client";
import { orderStatuses } from "@/lib/orders/status";
import type { OrderStatus } from "@/lib/orders/status";

export type StatusBreakdown = {
  status: OrderStatus;
  count: number;
  revenueSar: number;
};

export type SizeSale = {
  sizeMl: number;
  units: number;
};

export type LowStockAlert = {
  label: string;
  stockCount: number;
  href: string;
};

export type PerfumeSale = {
  nameAr: string;
  units: number;
};

export type AdminAnalytics = {
  productCount: number;
  orderCount: number;
  revenueSar: number;
  deliveredRevenueSar: number;
  statuses: StatusBreakdown[];
  bestSizes: SizeSale[];
  bestPerfumes: PerfumeSale[];
  lowStock: LowStockAlert[];
};

type RevenueRow = {
  count: number;
  revenue: number;
  delivered: number;
};

type StatusRow = {
  status: string;
  count: number;
  revenue: number;
};

type PerfumeRow = {
  name_ar: string;
  units: number;
};

type SizeRow = {
  size_ml: number;
  units: number;
};

const openOrderFilter = "status NOT IN ('cancelled', 'returned')";

type OfferAlertRow = {
  id: string;
  name_ar: string;
  size_ml: number;
  stock_count: number;
};

type SampleAlertRow = {
  id: string;
  name_ar: string;
  sample_stock_count: number;
};

type DiscoveryAlertRow = {
  name_ar: string;
  stock_count: number;
};

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  await io();
  const db = getDb();
  const revenue = db.prepare(`
    SELECT COUNT(*) AS count,
           COALESCE(SUM(CASE WHEN ${openOrderFilter} THEN total_sar ELSE 0 END), 0) AS revenue,
           COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_sar ELSE 0 END), 0) AS delivered
    FROM orders
  `).get() as RevenueRow;
  const statusRows = db.prepare(`
    SELECT status, COUNT(*) AS count, COALESCE(SUM(total_sar), 0) AS revenue
    FROM orders
    GROUP BY status
  `).all() as StatusRow[];
  const sizes = db.prepare(`
    SELECT oi.size_ml AS size_ml, SUM(oi.quantity) AS units
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.kind IN ('catalog', 'custom', 'sample')
      AND o.status NOT IN ('cancelled', 'returned')
    GROUP BY oi.size_ml
    ORDER BY units DESC, size_ml ASC
  `).all() as SizeRow[];
  const perfumes = db.prepare(`
    SELECT oi.name_ar AS name_ar, SUM(oi.quantity) AS units
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.kind IN ('catalog', 'sample')
      AND o.status NOT IN ('cancelled', 'returned')
    GROUP BY oi.name_ar
    ORDER BY units DESC, name_ar ASC
    LIMIT 6
  `).all() as PerfumeRow[];
  const productCount = db.prepare("SELECT COUNT(*) AS count FROM products").get() as { count: number };
  const offerAlerts = db.prepare(`
    SELECT p.id, p.name_ar, o.size_ml, o.stock_count
    FROM product_offers o
    JOIN products p ON p.id = o.product_id
    WHERE p.is_published = 1 AND o.is_listed = 1 AND o.stock_count <= ?
    ORDER BY o.stock_count ASC, p.name_ar ASC
  `).all(lowStockThreshold) as OfferAlertRow[];
  const sampleAlerts = db.prepare(`
    SELECT id, name_ar, sample_stock_count
    FROM products
    WHERE is_published = 1 AND sample_price_sar IS NOT NULL AND sample_is_enabled = 1 AND sample_stock_count <= ?
    ORDER BY sample_stock_count ASC, name_ar ASC
  `).all(lowStockThreshold) as SampleAlertRow[];
  const discoveryAlerts = db.prepare(`
    SELECT name_ar, stock_count
    FROM discovery_sets
    WHERE is_published = 1 AND stock_count <= ?
  `).all(lowStockThreshold) as DiscoveryAlertRow[];
  const counted = new Map(statusRows.map((row) => [row.status, row]));
  const lowStock = [
    ...offerAlerts.map((row) => ({
      label: `${row.name_ar} · ${row.size_ml} مل`,
      stockCount: row.stock_count,
      href: `/admin/products/${row.id}`,
    })),
    ...sampleAlerts.map((row) => ({
      label: `${row.name_ar} · عيّنة 2 مل`,
      stockCount: row.sample_stock_count,
      href: `/admin/products/${row.id}`,
    })),
    ...discoveryAlerts.map((row) => ({
      label: row.name_ar,
      stockCount: row.stock_count,
      href: "/admin/products",
    })),
  ].sort((left, right) => left.stockCount - right.stockCount || left.label.localeCompare(right.label, "ar"));
  return {
    productCount: Number(productCount.count),
    orderCount: Number(revenue.count),
    revenueSar: Number(revenue.revenue),
    deliveredRevenueSar: Number(revenue.delivered),
    statuses: orderStatuses.map((status) => ({
      status,
      count: Number(counted.get(status)?.count ?? 0),
      revenueSar: Number(counted.get(status)?.revenue ?? 0),
    })),
    bestSizes: sizes.map((size) => ({ sizeMl: Number(size.size_ml), units: Number(size.units) })),
    bestPerfumes: perfumes.map((perfume) => ({ nameAr: perfume.name_ar, units: Number(perfume.units) })),
    lowStock,
  };
}
