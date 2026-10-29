import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { deactivatePromo } from "@/lib/db/promos";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  await deactivatePromo(id);
  return NextResponse.json({ ok: true });
}
