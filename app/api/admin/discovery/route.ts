import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { saveDiscoverySet } from "@/lib/db/discovery";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { priceSar?: unknown; stockCount?: unknown; isPublished?: unknown };
    await saveDiscoverySet({
      priceSar: Number(body.priceSar),
      stockCount: Number(body.stockCount),
      isPublished: body.isPublished === true,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذّر حفظ المجموعة.";
    return NextResponse.json({ error: message.startsWith("أكمل") ? message : "تعذّر حفظ المجموعة." }, { status: 400 });
  }
}
