import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { listOrdersPage } from "@/lib/db/orders";
import { readOrderPage } from "@/lib/orders/paging";
import { readOrderStatusFilter } from "@/lib/orders/status";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const page = readOrderPage(params.get("page"));
  const search = (params.get("q") ?? "").slice(0, 80);
  const status = readOrderStatusFilter(params.get("status"));
  return NextResponse.json(await listOrdersPage(page, search, status));
}
