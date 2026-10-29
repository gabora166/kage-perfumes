import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { updateOrderNote, updateOrderStatus } from "@/lib/db/orders";
import { publicOrderStatusError } from "@/lib/orders/inventory";
import { isOrderStatus } from "@/lib/orders/status";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json()) as { status?: unknown; internalNote?: unknown };
  if (typeof body.status === "string") {
    if (!isOrderStatus(body.status)) return NextResponse.json({ error: "حالة غير معروفة." }, { status: 400 });
    try {
      await updateOrderStatus(id, body.status);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      return NextResponse.json({ error: publicOrderStatusError(message) }, { status: 400 });
    }
  }
  if (typeof body.internalNote === "string") {
    if (body.internalNote.trim().length > 500) {
      return NextResponse.json({ error: "الملاحظة أطول من الحد." }, { status: 400 });
    }
    await updateOrderNote(id, body.internalNote);
  }
  if (typeof body.status !== "string" && typeof body.internalNote !== "string") {
    return NextResponse.json({ error: "لا يوجد تعديل." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
