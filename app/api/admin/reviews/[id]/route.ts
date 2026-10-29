import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { clearReviewImage, deleteReview, setReviewVisibility } from "@/lib/db/reviews";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json()) as { isVisible?: unknown; clearImage?: unknown };
  if (body.clearImage === true) {
    await clearReviewImage(id);
    return NextResponse.json({ ok: true });
  }
  if (typeof body.isVisible !== "boolean") {
    return NextResponse.json({ error: "لا يوجد تعديل." }, { status: 400 });
  }
  await setReviewVisibility(id, body.isVisible);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const imagePath = await deleteReview(id);
  if (imagePath?.startsWith("/uploads/reviews/") && !imagePath.includes("..")) {
    await fs.unlink(path.join(process.cwd(), "public", imagePath)).catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}
