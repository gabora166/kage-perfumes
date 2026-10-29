import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { deleteProduct } from "@/lib/db/products";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const imagePaths = await deleteProduct(id);
  await Promise.all(
    imagePaths.map((imagePath) => {
      if (!imagePath.startsWith("/uploads/products/") && !imagePath.startsWith("/uploads/reviews/")) return Promise.resolve();
      if (imagePath.includes("..")) return Promise.resolve();
      return fs.unlink(path.join(process.cwd(), "public", imagePath)).catch(() => undefined);
    }),
  );
  return NextResponse.json({ ok: true });
}
