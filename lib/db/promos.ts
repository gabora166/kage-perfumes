import "server-only";

import { io } from "next/cache";
import { getDb } from "@/lib/db/client";
import { discountFor } from "@/lib/checkout/adjustments";
import { codesMatch, isPromoExhausted, isPromoExpired, normalizePromoCode } from "@/lib/promos/code";
import type { PromoRecord } from "@/lib/promos/code";

export type { PromoRecord };

type PromoRow = {
  id: string;
  code: string;
  kind: string;
  amount: number;
  expires_at: string | null;
  is_active: number;
  max_uses: number | null;
  used_count: number;
};

const invalidPromo = "الرمز غير صالح أو انتهت صلاحيته.";

export async function listPromos(): Promise<PromoRecord[]> {
  const db = await openDatabase();
  const rows = db.prepare(`
    SELECT id, code, kind, amount, expires_at, is_active, max_uses, used_count
    FROM promo_codes
    ORDER BY created_at DESC
  `).all() as PromoRow[];
  return rows.flatMap((row) => {
    const promo = toPromo(row);
    return promo ? [promo] : [];
  });
}

export async function createPromo(input: {
  code: string;
  kind: string;
  amount: number;
  expiresAt: string;
  maxUses: string;
}): Promise<void> {
  const code = normalizePromoCode(input.code);
  if (!code) throw new Error("أكمل الرمز بأحرف لاتينية وأرقام، من 4 إلى 24.");
  if (input.kind !== "percent" && input.kind !== "fixed") throw new Error("أكمل نوع الخصم.");
  if (!Number.isInteger(input.amount) || input.amount < 1) throw new Error("أكمل قيمة الخصم.");
  if (input.kind === "percent" && input.amount > 100) throw new Error("أكمل نسبة الخصم بين 1 و 100.");
  if (input.kind === "fixed" && input.amount > 20000) throw new Error("أكمل قيمة الخصم.");
  const expiresAt = input.expiresAt.trim();
  if (expiresAt && !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) throw new Error("أكمل تاريخ انتهاء صالحًا.");
  const maxUses = input.maxUses.trim();
  const parsedUses = maxUses ? Number(maxUses) : null;
  if (parsedUses !== null && (!Number.isInteger(parsedUses) || parsedUses < 1 || parsedUses > 10000)) {
    throw new Error("أكمل حد الاستخدام.");
  }
  const db = await openDatabase();
  const existing = db.prepare("SELECT code FROM promo_codes WHERE code = ?").get(code) as { code: string } | undefined;
  if (existing && codesMatch(existing.code, code)) throw new Error("أكمل رمزًا غير مستخدم.");
  db.prepare(`
    INSERT INTO promo_codes (id, code, kind, amount, expires_at, is_active, max_uses, used_count, created_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, 0, ?)
  `).run(crypto.randomUUID(), code, input.kind, input.amount, expiresAt || null, parsedUses, new Date().toISOString());
}

export async function deactivatePromo(id: string): Promise<void> {
  const db = await openDatabase();
  db.prepare("UPDATE promo_codes SET is_active = 0 WHERE id = ?").run(id);
}

export async function discountForCode(codeInput: string, subtotalSar: number): Promise<{
  id: string;
  code: string;
  discountSar: number;
}> {
  const code = normalizePromoCode(codeInput);
  if (!code) throw new Error(invalidPromo);
  const db = await openDatabase();
  const promo = readActivePromo(db, code);
  if (!promo) throw new Error(invalidPromo);
  return { id: promo.id, code: promo.code, discountSar: discountFor(subtotalSar, promo) };
}

export function redeemPromo(db: ReturnType<typeof getDb>, id: string): void {
  const now = new Date().toISOString().slice(0, 10);
  const result = db.prepare(`
    UPDATE promo_codes
    SET used_count = used_count + 1
    WHERE id = ?
      AND is_active = 1
      AND (expires_at IS NULL OR expires_at >= ?)
      AND (max_uses IS NULL OR used_count < max_uses)
  `).run(id, now);
  if (result.changes !== 1) throw new Error(invalidPromo);
}

function readActivePromo(db: ReturnType<typeof getDb>, code: string): PromoRecord | null {
  const row = db.prepare(`
    SELECT id, code, kind, amount, expires_at, is_active, max_uses, used_count
    FROM promo_codes
    WHERE code = ?
  `).get(code) as PromoRow | undefined;
  const promo = row ? toPromo(row) : null;
  if (!promo || !promo.isActive || !codesMatch(promo.code, code)) return null;
  if (isPromoExpired(promo.expiresAt) || isPromoExhausted(promo.usedCount, promo.maxUses)) return null;
  return promo;
}

function toPromo(row: PromoRow): PromoRecord | null {
  if (row.kind !== "percent" && row.kind !== "fixed") return null;
  return {
    id: row.id,
    code: row.code,
    kind: row.kind,
    amount: row.amount,
    expiresAt: row.expires_at,
    isActive: row.is_active === 1,
    maxUses: row.max_uses,
    usedCount: row.used_count,
  };
}

async function openDatabase() {
  await io();
  return getDb();
}
