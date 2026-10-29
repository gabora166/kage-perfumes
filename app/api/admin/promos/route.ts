import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { createPromo, listPromos } from "@/lib/db/promos";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ promos: await listPromos() });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as {
      code?: unknown;
      kind?: unknown;
      amount?: unknown;
      expiresAt?: unknown;
      maxUses?: unknown;
    };
    await createPromo({
      code: String(body.code ?? ""),
      kind: String(body.kind ?? ""),
      amount: Number(body.amount),
      expiresAt: String(body.expiresAt ?? ""),
      maxUses: String(body.maxUses ?? ""),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذّر حفظ الرمز.";
    return NextResponse.json({ error: message.startsWith("أكمل") ? message : "تعذّر حفظ الرمز." }, { status: 400 });
  }
}
