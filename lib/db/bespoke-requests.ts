import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { io } from "next/cache";
import { isBespokeConcentration, isBespokeSizeOption } from "@/lib/bespoke/options";
import { canCustomerRespond, isBespokeStatus } from "@/lib/bespoke/status";
import type { BespokeStatus } from "@/lib/bespoke/status";
import type { BespokeRequestRecord, PublicQuoteView } from "@/lib/bespoke/types";
import type { BespokeRequestInput } from "@/lib/bespoke/validation";
import { getDb } from "@/lib/db/client";
import {
  buildCustomerQuoteWhatsAppUrl,
  composeBespokeQuoteMessage,
} from "@/lib/bespoke/whatsapp";

export type { BespokeRequestRecord, PublicQuoteView };

type BespokeRow = {
  id: string;
  reference: string;
  perfume_name: string;
  brand_name: string;
  size_option: string | null;
  custom_size: string;
  quantity: number;
  concentration: string | null;
  notes: string;
  phone: string;
  status: string;
  internal_note: string;
  proposed_price_sar: number | null;
  fulfillment_estimate: string;
  approval_token_hash: string | null;
  quoted_at: string | null;
  customer_response_at: string | null;
  customer_response: string | null;
  created_at: string;
  updated_at: string;
};

export async function createBespokeRequest(input: BespokeRequestInput): Promise<{ id: string; reference: string }> {
  await io();
  const db = getDb();
  const id = crypto.randomUUID();
  const reference = nextReference(db);
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO bespoke_requests (
      id, reference, perfume_name, brand_name, size_option, custom_size, quantity,
      concentration, notes, phone, status, internal_note, proposed_price_sar,
      fulfillment_estimate, approval_token_hash, quoted_at, customer_response_at,
      customer_response, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', '', NULL, '', NULL, NULL, NULL, NULL, ?, ?)
  `).run(
    id,
    reference,
    input.perfumeName,
    input.brandName,
    input.sizeOption,
    input.customSize,
    input.quantity,
    input.concentration,
    input.notes,
    input.phone,
    now,
    now,
  );
  return { id, reference };
}

export async function listBespokeRequests(search = "", status: BespokeStatus | "" = ""): Promise<BespokeRequestRecord[]> {
  await io();
  const db = getDb();
  const pattern = `%${search.trim().toLowerCase()}%`;
  const hasSearch = search.trim().length > 0 ? 1 : 0;
  const rows = db.prepare(`
    SELECT *
    FROM bespoke_requests
    WHERE (? = 0 OR lower(reference) LIKE ? OR lower(perfume_name) LIKE ? OR phone LIKE ?)
      AND (? = '' OR status = ?)
    ORDER BY created_at DESC
    LIMIT 200
  `).all(hasSearch, pattern, pattern, `%${search.trim()}%`, status, status) as BespokeRow[];
  return rows.flatMap((row) => {
    const mapped = mapRow(row, null);
    return mapped ? [mapped] : [];
  });
}

export async function getBespokeRequest(id: string): Promise<BespokeRequestRecord | null> {
  await io();
  const row = getDb().prepare("SELECT * FROM bespoke_requests WHERE id = ?").get(id) as BespokeRow | undefined;
  return row ? mapRow(row, null) : null;
}

export async function updateBespokeRequestStaff(input: {
  id: string;
  status?: BespokeStatus;
  internalNote?: string;
  proposedPriceSar?: number | null;
  fulfillmentEstimate?: string;
  issueQuote?: boolean;
}): Promise<{ quoteWhatsAppUrl: string | null; approvalPath: string | null }> {
  await io();
  const db = getDb();
  const current = db.prepare("SELECT * FROM bespoke_requests WHERE id = ?").get(input.id) as BespokeRow | undefined;
  if (!current) throw new Error("الطلب غير موجود.");
  const now = new Date().toISOString();
  let status = input.status ?? (isBespokeStatus(current.status) ? current.status : "new");
  const proposedPriceSar =
    input.proposedPriceSar === undefined ? current.proposed_price_sar : input.proposedPriceSar;
  const fulfillmentEstimate =
    input.fulfillmentEstimate === undefined ? current.fulfillment_estimate : input.fulfillmentEstimate;
  const internalNote = input.internalNote === undefined ? current.internal_note : input.internalNote;
  let approvalTokenHash = current.approval_token_hash;
  let quotedAt = current.quoted_at;
  let customerResponseAt = current.customer_response_at;
  let customerResponse = current.customer_response;
  let plainToken: string | null = null;

  if (input.issueQuote) {
    if (proposedPriceSar === null || proposedPriceSar === undefined) {
      throw new Error("أدخل سعراً مقترحاً قبل إرسال العرض.");
    }
    plainToken = randomBytes(24).toString("hex");
    approvalTokenHash = hashToken(plainToken);
    quotedAt = now;
    customerResponseAt = null;
    customerResponse = null;
    status = "awaiting_customer_approval";
  }

  db.prepare(`
    UPDATE bespoke_requests
    SET status = ?, internal_note = ?, proposed_price_sar = ?, fulfillment_estimate = ?,
        approval_token_hash = ?, quoted_at = ?, customer_response_at = ?, customer_response = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    status,
    internalNote,
    proposedPriceSar,
    fulfillmentEstimate,
    approvalTokenHash,
    quotedAt,
    customerResponseAt,
    customerResponse,
    now,
    input.id,
  );

  if (!plainToken || proposedPriceSar === null || proposedPriceSar === undefined) {
    return { quoteWhatsAppUrl: null, approvalPath: null };
  }

  const mapped = mapRow(
    {
      ...current,
      status,
      internal_note: internalNote,
      proposed_price_sar: proposedPriceSar,
      fulfillment_estimate: fulfillmentEstimate,
      approval_token_hash: approvalTokenHash,
      quoted_at: quotedAt,
      customer_response_at: customerResponseAt,
      customer_response: customerResponse,
      updated_at: now,
    },
    plainToken,
  );
  return {
    quoteWhatsAppUrl: mapped?.quoteWhatsAppUrl ?? null,
    approvalPath: `/blend/quote/${plainToken}`,
  };
}

export async function getPublicQuoteByToken(token: string): Promise<PublicQuoteView | null> {
  await io();
  const row = findByToken(token);
  if (!row || row.proposed_price_sar === null) return null;
  const mapped = mapRow(row, null);
  if (!mapped) return null;
  return {
    reference: mapped.reference,
    perfumeName: mapped.perfumeName,
    brandName: mapped.brandName,
    sizeOption: mapped.sizeOption,
    customSize: mapped.customSize,
    quantity: mapped.quantity,
    concentration: mapped.concentration,
    proposedPriceSar: mapped.proposedPriceSar ?? 0,
    fulfillmentEstimate: mapped.fulfillmentEstimate,
    status: mapped.status,
    customerResponse: mapped.customerResponse,
  };
}

export async function respondToBespokeQuote(
  token: string,
  response: "approved" | "rejected",
): Promise<PublicQuoteView> {
  await io();
  const db = getDb();
  const row = findByToken(token);
  if (!row || row.proposed_price_sar === null) throw new Error("رابط العرض غير صالح.");
  if (!isBespokeStatus(row.status) || !canCustomerRespond(row.status)) {
    throw new Error("تم الرد على هذا العرض مسبقاً أو لم يعد متاحاً.");
  }
  const now = new Date().toISOString();
  const nextStatus: BespokeStatus = response === "approved" ? "approved" : "rejected";
  db.prepare(`
    UPDATE bespoke_requests
    SET status = ?, customer_response = ?, customer_response_at = ?, updated_at = ?
    WHERE id = ?
  `).run(nextStatus, response, now, now, row.id);
  const view = await getPublicQuoteByToken(token);
  if (!view) throw new Error("تعذّر تحديث العرض.");
  return view;
}

function findByToken(token: string): BespokeRow | null {
  const trimmed = token.trim();
  if (!/^[a-f0-9]{48}$/i.test(trimmed)) return null;
  const hash = hashToken(trimmed);
  const row = getDb()
    .prepare("SELECT * FROM bespoke_requests WHERE approval_token_hash = ?")
    .get(hash) as BespokeRow | undefined;
  if (!row?.approval_token_hash) return null;
  if (!hashesMatch(row.approval_token_hash, hash)) return null;
  return row;
}

function nextReference(db: ReturnType<typeof getDb>): string {
  const year = new Date().getFullYear().toString().slice(-2);
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    const reference = `BR-${year}${suffix}`;
    const existing = db.prepare("SELECT id FROM bespoke_requests WHERE reference = ?").get(reference);
    if (!existing) return reference;
  }
  return `BR-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function mapRow(row: BespokeRow, plainToken: string | null): BespokeRequestRecord | null {
  if (!isBespokeStatus(row.status)) return null;
  const sizeOption =
    row.size_option && isBespokeSizeOption(row.size_option) ? row.size_option : null;
  const concentration =
    row.concentration && isBespokeConcentration(row.concentration) ? row.concentration : null;
  const customerResponse =
    row.customer_response === "approved" || row.customer_response === "rejected"
      ? row.customer_response
      : null;
  const message =
    plainToken && row.proposed_price_sar !== null
      ? composeBespokeQuoteMessage({
          reference: row.reference,
          perfumeName: row.perfume_name,
          brandName: row.brand_name,
          sizeOption,
          customSize: row.custom_size,
          quantity: row.quantity,
          concentration,
          proposedPriceSar: row.proposed_price_sar,
          fulfillmentEstimate: row.fulfillment_estimate,
          approvalToken: plainToken,
        })
      : null;
  return {
    id: row.id,
    reference: row.reference,
    perfumeName: row.perfume_name,
    brandName: row.brand_name,
    sizeOption,
    customSize: row.custom_size,
    quantity: row.quantity,
    concentration,
    notes: row.notes,
    phone: row.phone,
    status: row.status,
    internalNote: row.internal_note,
    proposedPriceSar: row.proposed_price_sar,
    fulfillmentEstimate: row.fulfillment_estimate,
    quotedAt: row.quoted_at,
    customerResponseAt: row.customer_response_at,
    customerResponse,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    quoteWhatsAppUrl: message ? buildCustomerQuoteWhatsAppUrl(row.phone, message) : null,
  };
}

function hashesMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}
