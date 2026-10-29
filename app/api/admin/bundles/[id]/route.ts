import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { deleteBundle } from "@/lib/db/bundles";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  await deleteBundle(id);
  return NextResponse.json({ ok: true });
}
