import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { saveBundle } from "@/lib/db/bundles";
import type { BundleInput } from "@/lib/db/bundles";

type BundleBody = {
  id?: unknown;
  nameAr?: unknown;
  nameEn?: unknown;
  descriptionAr?: unknown;
  priceSar?: unknown;
  stockCount?: unknown;
  isPublished?: unknown;
  parts?: unknown;
};

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as BundleBody;
    const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : undefined;
    await saveBundle(readInput(body), id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذّر حفظ العرض.";
    const isPublic = message.startsWith("أكمل") || message === "العرض غير موجود.";
    return NextResponse.json({ error: isPublic ? message : "تعذّر حفظ العرض." }, { status: 400 });
  }
}

function readInput(body: BundleBody): BundleInput {
  const parts = Array.isArray(body.parts) ? body.parts.flatMap(readPart) : [];
  return {
    nameAr: String(body.nameAr ?? ""),
    nameEn: String(body.nameEn ?? ""),
    descriptionAr: String(body.descriptionAr ?? ""),
    priceSar: Number(body.priceSar),
    stockCount: Number(body.stockCount),
    isPublished: body.isPublished === true,
    parts,
  };
}

function readPart(value: unknown): BundleInput["parts"] {
  if (typeof value !== "object" || value === null) return [];
  const part = value as { productId?: unknown; sizeMl?: unknown; quantity?: unknown };
  return [{
    productId: String(part.productId ?? ""),
    sizeMl: Number(part.sizeMl),
    quantity: Number(part.quantity),
  }];
}
