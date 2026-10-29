import "server-only";

import { io } from "next/cache";
import { getDb } from "@/lib/db/client";
import { isReviewKind } from "@/lib/reviews/voice";
import type { ProductReview, ReviewKind } from "@/lib/reviews/voice";

export type ReviewInput = {
  productId: string;
  kind: ReviewKind;
  authorName: string;
  stars: number | null;
  body: string;
  caption: string;
  imagePath: string | null;
  sortOrder: number;
};

type ReviewRow = {
  id: string;
  product_id: string;
  product_name: string;
  kind: string;
  author_name: string;
  stars: number | null;
  body: string;
  caption: string;
  image_path: string | null;
  is_visible: number;
  sort_order: number;
  created_at: string;
};

export async function listVisibleReviews(productId: string): Promise<ProductReview[]> {
  const db = await openDatabase();
  const rows = db.prepare(`
    SELECT r.id, r.product_id, p.name_ar AS product_name, r.kind, r.author_name, r.stars,
           r.body, r.caption, r.image_path, r.is_visible, r.sort_order, r.created_at
    FROM product_reviews r
    JOIN products p ON p.id = r.product_id
    WHERE r.product_id = ? AND r.is_visible = 1
    ORDER BY r.sort_order ASC, r.created_at DESC
  `).all(productId) as ReviewRow[];
  return rows.flatMap(toReview);
}

export async function listAllReviews(): Promise<ProductReview[]> {
  const db = await openDatabase();
  const rows = db.prepare(`
    SELECT r.id, r.product_id, p.name_ar AS product_name, r.kind, r.author_name, r.stars,
           r.body, r.caption, r.image_path, r.is_visible, r.sort_order, r.created_at
    FROM product_reviews r
    JOIN products p ON p.id = r.product_id
    ORDER BY p.name_ar ASC, r.sort_order ASC, r.created_at DESC
  `).all() as ReviewRow[];
  return rows.flatMap(toReview);
}

export async function createReview(input: ReviewInput): Promise<string> {
  const db = await openDatabase();
  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(input.productId);
  if (!product) throw new Error("العطر غير موجود.");
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO product_reviews (
      id, product_id, kind, author_name, stars, body, caption, image_path, is_visible, sort_order, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `).run(
    id,
    input.productId,
    input.kind,
    input.authorName,
    input.stars,
    input.body,
    input.caption,
    input.imagePath,
    input.sortOrder,
    new Date().toISOString(),
  );
  return id;
}

export async function setReviewVisibility(id: string, isVisible: boolean): Promise<void> {
  const db = await openDatabase();
  db.prepare("UPDATE product_reviews SET is_visible = ? WHERE id = ?").run(isVisible ? 1 : 0, id);
}

export async function clearReviewImage(id: string): Promise<string | null> {
  const db = await openDatabase();
  const row = db.prepare("SELECT image_path FROM product_reviews WHERE id = ?").get(id) as
    | { image_path: string | null }
    | undefined;
  db.prepare("UPDATE product_reviews SET image_path = NULL, is_visible = 0 WHERE id = ?").run(id);
  return row?.image_path ?? null;
}

export async function deleteReview(id: string): Promise<string | null> {
  const db = await openDatabase();
  const row = db.prepare("SELECT image_path FROM product_reviews WHERE id = ?").get(id) as
    | { image_path: string | null }
    | undefined;
  db.prepare("DELETE FROM product_reviews WHERE id = ?").run(id);
  return row?.image_path ?? null;
}

function toReview(row: ReviewRow): ProductReview[] {
  if (!isReviewKind(row.kind)) return [];
  return [{
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    kind: row.kind,
    authorName: row.author_name,
    stars: row.stars,
    body: row.body,
    caption: row.caption,
    imagePath: row.image_path,
    isVisible: row.is_visible === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }];
}

async function openDatabase() {
  await io();
  return getDb();
}
