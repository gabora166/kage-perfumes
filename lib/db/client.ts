import "server-only";

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "@/lib/auth/password";
import { defaultStockCount } from "@/lib/catalog/stock";
import { catalog } from "@/lib/catalog/products";
import { defaultDiscoveryPriceSar, defaultDiscoveryStock, discoverySetId } from "@/lib/catalog/samples";

let database: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (database) return database;
  const filePath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "ateeq.sqlite");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  database = new DatabaseSync(filePath);
  database.exec("PRAGMA foreign_keys = ON");
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA busy_timeout = 5000");
  migrate(database);
  seed(database);
  return database;
}

function migrate(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      family TEXT NOT NULL CHECK (family IN ('oriental', 'woody', 'floral')),
      description_ar TEXT NOT NULL,
      note_top TEXT NOT NULL,
      note_heart TEXT NOT NULL,
      note_base TEXT NOT NULL,
      image_path TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      size_ml INTEGER NOT NULL,
      price_sar INTEGER NOT NULL,
      stock_count INTEGER NOT NULL DEFAULT ${defaultStockCount},
      is_listed INTEGER NOT NULL DEFAULT 1,
      UNIQUE (product_id, size_ml)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      payment_method TEXT NOT NULL DEFAULT 'cod',
      internal_note TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
      total_sar INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      kind TEXT NOT NULL CHECK (kind IN ('catalog', 'custom', 'sample', 'discovery', 'bundle')),
      product_id TEXT,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      size_ml INTEGER NOT NULL,
      concentration TEXT,
      custom_notes TEXT,
      quantity INTEGER NOT NULL,
      unit_price_sar INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletters (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      kind TEXT NOT NULL CHECK (kind IN ('screenshot', 'written')),
      author_name TEXT NOT NULL DEFAULT '',
      stars INTEGER,
      body TEXT NOT NULL DEFAULT '',
      caption TEXT NOT NULL DEFAULT '',
      image_path TEXT,
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      bucket TEXT NOT NULL,
      ip TEXT NOT NULL,
      hits INTEGER NOT NULL,
      window_started_at INTEGER NOT NULL,
      PRIMARY KEY (bucket, ip)
    );
  `);
  ensureStockColumn(db);
  ensureListedColumn(db);
  ensureStoryColumns(db);
  ensureSampleColumns(db);
  ensureCommerceTables(db);
  ensureOrderColumns(db);
  ensureOrderStatuses(db);
  ensureOrderItemKinds(db);
  ensureBundleOrderKind(db);
  ensureBundleTables(db);
  ensureBespokeTables(db);
  backfillHouseStories(db);
  backfillHouseSamples(db);
}

function ensureStockColumn(db: DatabaseSync): void {
  const columns = db.prepare("PRAGMA table_info(product_offers)").all() as Array<{ name: string }>;
  const hasStock = columns.some((column) => column.name === "stock_count");
  if (hasStock) return;
  db.exec(`ALTER TABLE product_offers ADD COLUMN stock_count INTEGER NOT NULL DEFAULT ${defaultStockCount}`);
}

function ensureListedColumn(db: DatabaseSync): void {
  const columns = db.prepare("PRAGMA table_info(product_offers)").all() as Array<{ name: string }>;
  const hasListed = columns.some((column) => column.name === "is_listed");
  if (hasListed) return;
  db.exec("ALTER TABLE product_offers ADD COLUMN is_listed INTEGER NOT NULL DEFAULT 1");
}

function ensureStoryColumns(db: DatabaseSync): void {
  const names = new Set(
    (db.prepare("PRAGMA table_info(products)").all() as Array<{ name: string }>).map((column) => column.name),
  );
  const additions: Array<[string, string]> = [
    ["liquid_image_path", "ALTER TABLE products ADD COLUMN liquid_image_path TEXT"],
    ["texture_image_path", "ALTER TABLE products ADD COLUMN texture_image_path TEXT"],
    ["pyramid_image_path", "ALTER TABLE products ADD COLUMN pyramid_image_path TEXT"],
    ["longevity", "ALTER TABLE products ADD COLUMN longevity INTEGER NOT NULL DEFAULT 3"],
    ["sillage", "ALTER TABLE products ADD COLUMN sillage INTEGER NOT NULL DEFAULT 3"],
    ["season", "ALTER TABLE products ADD COLUMN season TEXT NOT NULL DEFAULT ''"],
    ["occasion", "ALTER TABLE products ADD COLUMN occasion TEXT NOT NULL DEFAULT ''"],
    ["longevity_span", "ALTER TABLE products ADD COLUMN longevity_span TEXT NOT NULL DEFAULT ''"],
    ["sillage_span", "ALTER TABLE products ADD COLUMN sillage_span TEXT NOT NULL DEFAULT ''"],
    ["sensory_vibe", "ALTER TABLE products ADD COLUMN sensory_vibe TEXT NOT NULL DEFAULT ''"],
    ["mood", "ALTER TABLE products ADD COLUMN mood TEXT NOT NULL DEFAULT ''"],
    ["attire", "ALTER TABLE products ADD COLUMN attire TEXT NOT NULL DEFAULT ''"],
  ];
  additions.forEach(([name, statement]) => {
    if (!names.has(name)) db.exec(statement);
  });
}

function ensureSampleColumns(db: DatabaseSync): void {
  const names = columnNames(db, "products");
  if (!names.has("sample_price_sar")) db.exec("ALTER TABLE products ADD COLUMN sample_price_sar INTEGER");
  if (!names.has("sample_stock_count")) {
    db.exec("ALTER TABLE products ADD COLUMN sample_stock_count INTEGER NOT NULL DEFAULT 0");
  }
  if (!names.has("sample_is_enabled")) {
    db.exec("ALTER TABLE products ADD COLUMN sample_is_enabled INTEGER NOT NULL DEFAULT 1");
  }
}

function ensureCommerceTables(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS discovery_sets (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      price_sar INTEGER NOT NULL,
      stock_count INTEGER NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS promo_codes (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      kind TEXT NOT NULL CHECK (kind IN ('percent', 'fixed')),
      amount INTEGER NOT NULL,
      expires_at TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      max_uses INTEGER,
      used_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}

function ensureOrderColumns(db: DatabaseSync): void {
  const names = columnNames(db, "orders");
  const additions: Array<[string, string]> = [
    ["gift_wrap", "ALTER TABLE orders ADD COLUMN gift_wrap INTEGER NOT NULL DEFAULT 0"],
    ["gift_message", "ALTER TABLE orders ADD COLUMN gift_message TEXT NOT NULL DEFAULT ''"],
    ["promo_code", "ALTER TABLE orders ADD COLUMN promo_code TEXT"],
    ["discount_sar", "ALTER TABLE orders ADD COLUMN discount_sar INTEGER NOT NULL DEFAULT 0"],
    ["internal_note", "ALTER TABLE orders ADD COLUMN internal_note TEXT NOT NULL DEFAULT ''"],
  ];
  additions.forEach(([name, statement]) => {
    if (!names.has(name)) db.exec(statement);
  });
}

function ensureOrderStatuses(db: DatabaseSync): void {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'orders'").get() as
    | { sql: string }
    | undefined;
  if (!row || row.sql.includes("'cancelled'")) return;
  db.exec("PRAGMA foreign_keys = OFF");
  db.exec(`
    CREATE TABLE orders_next (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      gift_wrap INTEGER NOT NULL DEFAULT 0,
      gift_message TEXT NOT NULL DEFAULT '',
      promo_code TEXT,
      discount_sar INTEGER NOT NULL DEFAULT 0,
      internal_note TEXT NOT NULL DEFAULT '',
      payment_method TEXT NOT NULL DEFAULT 'cod',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
      total_sar INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    INSERT INTO orders_next (
      id, reference, customer_name, phone, city, address, notes, gift_wrap, gift_message,
      promo_code, discount_sar, internal_note, payment_method, status, total_sar, created_at
    )
    SELECT id, reference, customer_name, phone, city, address, notes, gift_wrap, gift_message,
           promo_code, discount_sar, internal_note, payment_method, status, total_sar, created_at
    FROM orders;
    DROP TABLE orders;
    ALTER TABLE orders_next RENAME TO orders;
  `);
  db.exec("PRAGMA foreign_keys = ON");
}

function ensureOrderItemKinds(db: DatabaseSync): void {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'order_items'").get() as
    | { sql: string }
    | undefined;
  if (!row || row.sql.includes("'sample'")) return;
  db.exec("PRAGMA foreign_keys = OFF");
  db.exec(`
    CREATE TABLE order_items_next (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      kind TEXT NOT NULL CHECK (kind IN ('catalog', 'custom', 'sample', 'discovery')),
      product_id TEXT,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      size_ml INTEGER NOT NULL,
      concentration TEXT,
      custom_notes TEXT,
      quantity INTEGER NOT NULL,
      unit_price_sar INTEGER NOT NULL
    );
    INSERT INTO order_items_next (
      id, order_id, kind, product_id, name_ar, name_en, size_ml, concentration, custom_notes, quantity, unit_price_sar
    )
    SELECT id, order_id, kind, product_id, name_ar, name_en, size_ml, concentration, custom_notes, quantity, unit_price_sar
    FROM order_items;
    DROP TABLE order_items;
    ALTER TABLE order_items_next RENAME TO order_items;
  `);
  db.exec("PRAGMA foreign_keys = ON");
}

function ensureBundleOrderKind(db: DatabaseSync): void {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'order_items'").get() as
    | { sql: string }
    | undefined;
  if (!row || row.sql.includes("'bundle'")) return;
  db.exec("PRAGMA foreign_keys = OFF");
  db.exec(`
    CREATE TABLE order_items_next (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      kind TEXT NOT NULL CHECK (kind IN ('catalog', 'custom', 'sample', 'discovery', 'bundle')),
      product_id TEXT,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      size_ml INTEGER NOT NULL,
      concentration TEXT,
      custom_notes TEXT,
      quantity INTEGER NOT NULL,
      unit_price_sar INTEGER NOT NULL
    );
    INSERT INTO order_items_next (
      id, order_id, kind, product_id, name_ar, name_en, size_ml, concentration, custom_notes, quantity, unit_price_sar
    )
    SELECT id, order_id, kind, product_id, name_ar, name_en, size_ml, concentration, custom_notes, quantity, unit_price_sar
    FROM order_items;
    DROP TABLE order_items;
    ALTER TABLE order_items_next RENAME TO order_items;
  `);
  db.exec("PRAGMA foreign_keys = ON");
}

function ensureBundleTables(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bundle_offers (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description_ar TEXT NOT NULL,
      price_sar INTEGER NOT NULL,
      stock_count INTEGER NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bundle_offer_items (
      bundle_id TEXT NOT NULL REFERENCES bundle_offers(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      size_ml INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      PRIMARY KEY (bundle_id, product_id, size_ml)
    );
    CREATE TABLE IF NOT EXISTS order_bundle_parts (
      order_id TEXT NOT NULL,
      bundle_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      size_ml INTEGER NOT NULL,
      quantity INTEGER NOT NULL
    );
  `);
}

function ensureBespokeTables(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bespoke_requests (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      perfume_name TEXT NOT NULL,
      brand_name TEXT NOT NULL DEFAULT '',
      size_option TEXT,
      custom_size TEXT NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 1,
      concentration TEXT,
      notes TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
        'new', 'under_review', 'quoted', 'awaiting_customer_approval',
        'approved', 'rejected', 'unavailable', 'cancelled'
      )),
      internal_note TEXT NOT NULL DEFAULT '',
      proposed_price_sar INTEGER,
      fulfillment_estimate TEXT NOT NULL DEFAULT '',
      approval_token_hash TEXT,
      quoted_at TEXT,
      customer_response_at TEXT,
      customer_response TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_bespoke_requests_status ON bespoke_requests(status);
    CREATE INDEX IF NOT EXISTS idx_bespoke_requests_created ON bespoke_requests(created_at);
    CREATE INDEX IF NOT EXISTS idx_bespoke_requests_token ON bespoke_requests(approval_token_hash);
  `);
}

function columnNames(db: DatabaseSync, table: string): Set<string> {
  return new Set(
    (db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map((column) => column.name),
  );
}

function backfillHouseStories(db: DatabaseSync): void {
  const updateSeason = db.prepare(`
    UPDATE products
    SET longevity = ?, sillage = ?, season = ?, occasion = ?
    WHERE id = ? AND season = ''
  `);
  const updateSensory = db.prepare(`
    UPDATE products
    SET longevity_span = ?, sillage_span = ?, sensory_vibe = ?, mood = ?, attire = ?,
        season = ?, occasion = ?
    WHERE id = ? AND sensory_vibe = ''
  `);
  catalog.forEach((product) => {
    updateSeason.run(product.longevity, product.sillage, product.season, product.occasion, product.id);
    updateSensory.run(
      product.longevitySpan,
      product.sillageSpan,
      product.sensoryVibe,
      product.mood,
      product.attire,
      product.season,
      product.occasion,
      product.id,
    );
  });
}

function backfillHouseSamples(db: DatabaseSync): void {
  const update = db.prepare(`
    UPDATE products
    SET sample_price_sar = ?, sample_stock_count = ?
    WHERE id = ? AND sample_price_sar IS NULL
  `);
  catalog.forEach((product) => {
    if (!product.sample) return;
    update.run(product.sample.priceSar, product.sample.stockCount, product.id);
  });
}

function seed(db: DatabaseSync): void {
  const productCount = db.prepare("SELECT COUNT(*) AS count FROM products").get() as { count: number };
  if (productCount.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (
        id, slug, name_ar, name_en, family, description_ar,
        note_top, note_heart, note_base, image_path, liquid_image_path, texture_image_path,
        longevity, sillage, longevity_span, sillage_span, sensory_vibe, mood, season, occasion, attire,
        sample_price_sar, sample_stock_count, is_featured, is_published, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    const insertOffer = db.prepare(
      "INSERT INTO product_offers (product_id, size_ml, price_sar, stock_count) VALUES (?, ?, ?, ?)",
    );
    const createdAt = new Date().toISOString();
    db.exec("BEGIN");
    try {
      catalog.forEach((product) => {
        insertProduct.run(
          product.id,
          product.slug,
          product.nameAr,
          product.nameEn,
          product.family,
          product.descriptionAr,
          product.notes.top,
          product.notes.heart,
          product.notes.base,
          product.longevity,
          product.sillage,
          product.longevitySpan,
          product.sillageSpan,
          product.sensoryVibe,
          product.mood,
          product.season,
          product.occasion,
          product.attire,
          product.sample?.priceSar ?? null,
          product.sample?.stockCount ?? 0,
          product.isFeatured ? 1 : 0,
          createdAt,
        );
        product.offers.forEach((offer) => {
          insertOffer.run(product.id, offer.sizeMl, offer.priceSar, offer.stockCount);
        });
      });
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  const discoveryCount = db.prepare("SELECT COUNT(*) AS count FROM discovery_sets").get() as { count: number };
  if (discoveryCount.count === 0) {
    db.prepare(`
      INSERT INTO discovery_sets (id, name_ar, name_en, price_sar, stock_count, is_published)
      VALUES (?, 'مجموعة الاكتشاف', 'Discovery Set', ?, ?, 1)
    `).run(discoverySetId, defaultDiscoveryPriceSar, defaultDiscoveryStock);
  }
  const adminCount = db.prepare("SELECT COUNT(*) AS count FROM admin_users").get() as { count: number };
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (adminCount.count === 0 && email && password && password.length >= 8) {
    db.prepare("INSERT INTO admin_users (id, email, password_hash) VALUES (?, ?, ?)").run(
      crypto.randomUUID(),
      email,
      hashPassword(password),
    );
  }
}
