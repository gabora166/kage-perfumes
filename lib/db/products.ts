import "server-only";

import { io } from "next/cache";
import { getDb } from "@/lib/db/client";
import { maximumStockCount } from "@/lib/catalog/stock";
import { listRitualCompanions } from "@/lib/catalog/story";
import { bottleSizes, fragranceFamilies, wearLevels } from "@/lib/catalog/types";
import type { BottleSize, FragranceFamily, Product, ProductImages, WearLevel } from "@/lib/catalog/types";

type ProductRow = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  family: string;
  description_ar: string;
  note_top: string;
  note_heart: string;
  note_base: string;
  image_path: string | null;
  liquid_image_path: string | null;
  texture_image_path: string | null;
  pyramid_image_path: string | null;
  longevity: number;
  sillage: number;
  longevity_span: string;
  sillage_span: string;
  sensory_vibe: string;
  mood: string;
  season: string;
  occasion: string;
  attire: string;
  sample_price_sar: number | null;
  sample_stock_count: number;
  sample_is_enabled: number;
  is_featured: number;
  is_published: number;
};

type OfferRow = {
  product_id: string;
  size_ml: number;
  price_sar: number;
  stock_count: number;
  is_listed: number;
};

export type ProductInput = {
  nameAr: string;
  nameEn: string;
  family: FragranceFamily;
  descriptionAr: string;
  noteTop: string;
  noteHeart: string;
  noteBase: string;
  isFeatured: boolean;
  isPublished: boolean;
  offers: Array<{ sizeMl: BottleSize; priceSar: number; stockCount: number; isListed: boolean }>;
  images: ProductImages;
  longevity: WearLevel;
  sillage: WearLevel;
  longevitySpan: string;
  sillageSpan: string;
  sensoryVibe: string;
  mood: string;
  season: string;
  occasion: string;
  attire: string;
  samplePriceSar: number | null;
  sampleStockCount: number;
  sampleIsEnabled: boolean;
};

export async function listPublishedProducts(): Promise<Product[]> {
  return listProducts(true);
}

export async function listAllProducts(): Promise<Product[]> {
  return listProducts(false);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await listPublishedProducts();
  return products.find((product) => product.slug === slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await listAllProducts();
  return products.find((product) => product.id === id);
}

export async function getRitualCompanions(product: Product): Promise<Product[]> {
  return listRitualCompanions(product, await listPublishedProducts());
}

export async function saveProduct(input: ProductInput, id?: string): Promise<string> {
  const db = await openDatabase();
  const productId = id ?? crypto.randomUUID();
  const existing = id
    ? (db.prepare(`
        SELECT slug, image_path, liquid_image_path, texture_image_path, pyramid_image_path
        FROM products WHERE id = ?
      `).get(id) as
        | {
            slug: string;
            image_path: string | null;
            liquid_image_path: string | null;
            texture_image_path: string | null;
            pyramid_image_path: string | null;
          }
        | undefined)
    : undefined;
  if (id && !existing) throw new Error("المنتج غير موجود.");
  const slug = existing?.slug ?? createUniqueSlug(db, input.nameEn);
  const images: ProductImages = {
    bottle: input.images.bottle ?? existing?.image_path ?? null,
    liquid: input.images.liquid ?? existing?.liquid_image_path ?? null,
    texture: input.images.texture ?? existing?.texture_image_path ?? null,
    pyramid: input.images.pyramid ?? existing?.pyramid_image_path ?? null,
  };
  db.exec("BEGIN");
  try {
    if (existing) {
      db.prepare(`
        UPDATE products SET
          name_ar = ?, name_en = ?, family = ?, description_ar = ?,
          note_top = ?, note_heart = ?, note_base = ?,
          image_path = ?, liquid_image_path = ?, texture_image_path = ?, pyramid_image_path = ?,
          longevity = ?, sillage = ?, longevity_span = ?, sillage_span = ?,
          sensory_vibe = ?, mood = ?, season = ?, occasion = ?, attire = ?,
          sample_price_sar = ?, sample_stock_count = ?, sample_is_enabled = ?,
          is_featured = ?, is_published = ?
        WHERE id = ?
      `).run(
        input.nameAr,
        input.nameEn,
        input.family,
        input.descriptionAr,
        input.noteTop,
        input.noteHeart,
        input.noteBase,
        images.bottle,
        images.liquid,
        images.texture,
        images.pyramid,
        input.longevity,
        input.sillage,
        input.longevitySpan,
        input.sillageSpan,
        input.sensoryVibe,
        input.mood,
        input.season,
        input.occasion,
        input.attire,
        input.samplePriceSar,
        input.sampleStockCount,
        input.sampleIsEnabled ? 1 : 0,
        input.isFeatured ? 1 : 0,
        input.isPublished ? 1 : 0,
        productId,
      );
      db.prepare("DELETE FROM product_offers WHERE product_id = ?").run(productId);
    } else {
      db.prepare(`
        INSERT INTO products (
          id, slug, name_ar, name_en, family, description_ar,
          note_top, note_heart, note_base, image_path, liquid_image_path, texture_image_path, pyramid_image_path,
          longevity, sillage, longevity_span, sillage_span, sensory_vibe, mood,
          season, occasion, attire, sample_price_sar, sample_stock_count, sample_is_enabled,
          is_featured, is_published, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        productId,
        slug,
        input.nameAr,
        input.nameEn,
        input.family,
        input.descriptionAr,
        input.noteTop,
        input.noteHeart,
        input.noteBase,
        images.bottle,
        images.liquid,
        images.texture,
        images.pyramid,
        input.longevity,
        input.sillage,
        input.longevitySpan,
        input.sillageSpan,
        input.sensoryVibe,
        input.mood,
        input.season,
        input.occasion,
        input.attire,
        input.samplePriceSar,
        input.sampleStockCount,
        input.sampleIsEnabled ? 1 : 0,
        input.isFeatured ? 1 : 0,
        input.isPublished ? 1 : 0,
        new Date().toISOString(),
      );
    }
    const insertOffer = db.prepare(
      "INSERT INTO product_offers (product_id, size_ml, price_sar, stock_count, is_listed) VALUES (?, ?, ?, ?, ?)",
    );
    input.offers.forEach((offer) => {
      if (!Number.isInteger(offer.stockCount) || offer.stockCount < 0 || offer.stockCount > maximumStockCount) {
        throw new Error("المخزون يجب أن يكون رقمًا بين 0 و 999.");
      }
      insertOffer.run(productId, offer.sizeMl, offer.priceSar, offer.stockCount, offer.isListed ? 1 : 0);
    });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return productId;
}

export async function deleteProduct(id: string): Promise<string[]> {
  const db = await openDatabase();
  const row = db.prepare(`
    SELECT image_path, liquid_image_path, texture_image_path, pyramid_image_path FROM products WHERE id = ?
  `).get(id) as
    | {
        image_path: string | null;
        liquid_image_path: string | null;
        texture_image_path: string | null;
        pyramid_image_path: string | null;
      }
    | undefined;
  const reviewImages = db.prepare("SELECT image_path FROM product_reviews WHERE product_id = ?").all(id) as Array<{
    image_path: string | null;
  }>;
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  return [
    row?.image_path,
    row?.liquid_image_path,
    row?.texture_image_path,
    row?.pyramid_image_path,
    ...reviewImages.map((image) => image.image_path),
  ].filter((imagePath): imagePath is string => Boolean(imagePath));
}

async function listProducts(publishedOnly: boolean): Promise<Product[]> {
  const db = await openDatabase();
  const where = publishedOnly ? "WHERE p.is_published = 1" : "";
  const rows = db.prepare(`
    SELECT id, slug, name_ar, name_en, family, description_ar, note_top, note_heart, note_base,
           image_path, liquid_image_path, texture_image_path, pyramid_image_path, longevity, sillage,
           longevity_span, sillage_span, sensory_vibe, mood, season, occasion, attire,
           sample_price_sar, sample_stock_count, sample_is_enabled, is_featured, is_published
    FROM products p
    ${where}
    ORDER BY created_at DESC
  `).all() as ProductRow[];
  const offers = db.prepare(
    "SELECT product_id, size_ml, price_sar, stock_count, is_listed FROM product_offers ORDER BY size_ml",
  ).all() as OfferRow[];
  return rows.map((row) => toProduct(row, offers, publishedOnly)).filter((product) => product.offers.length > 0 || !publishedOnly);
}

function toProduct(row: ProductRow, offers: OfferRow[], publishedOnly: boolean): Product {
  const family = isFamily(row.family) ? row.family : "oriental";
  return {
    id: row.id,
    slug: row.slug,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    family,
    descriptionAr: row.description_ar,
    notes: { top: row.note_top, heart: row.note_heart, base: row.note_base },
    offers: offers.flatMap((offer) => {
      if (offer.product_id !== row.id || !isBottleSize(offer.size_ml)) return [];
      if (publishedOnly && offer.is_listed !== 1) return [];
      return [{
        sizeMl: offer.size_ml,
        priceSar: offer.price_sar,
        stockCount: offer.stock_count,
        isListed: offer.is_listed === 1,
      }];
    }),
    isFeatured: row.is_featured === 1,
    isPublished: row.is_published === 1,
    images: {
      bottle: row.image_path,
      liquid: row.liquid_image_path,
      texture: row.texture_image_path,
      pyramid: row.pyramid_image_path,
    },
    longevity: readWearLevel(row.longevity),
    sillage: readWearLevel(row.sillage),
    longevitySpan: row.longevity_span,
    sillageSpan: row.sillage_span,
    sensoryVibe: row.sensory_vibe,
    mood: row.mood,
    season: row.season,
    occasion: row.occasion,
    attire: row.attire,
    sample: readSample(row.sample_price_sar, row.sample_stock_count, row.sample_is_enabled),
  };
}

function readSample(
  priceSar: number | null,
  stockCount: number,
  isEnabled: number,
): Product["sample"] {
  if (priceSar === null || !Number.isInteger(priceSar) || priceSar < 1) return null;
  return { priceSar, stockCount, isEnabled: isEnabled === 1 };
}

function readWearLevel(value: number): WearLevel {
  const match = wearLevels.find((level) => level === value);
  return match ?? 3;
}

function createUniqueSlug(db: ReturnType<typeof getDb>, nameEn: string): string {
  const base = nameEn.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "perfume";
  let slug = base;
  let index = 2;
  while (db.prepare("SELECT id FROM products WHERE slug = ?").get(slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}

async function openDatabase() {
  await io();
  return getDb();
}

function isFamily(value: string): value is FragranceFamily {
  return fragranceFamilies.some((family) => family === value);
}

function isBottleSize(value: number): value is BottleSize {
  return bottleSizes.some((size) => size === value);
}
