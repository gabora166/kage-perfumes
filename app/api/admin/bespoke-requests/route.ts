import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { listBespokeRequests } from "@/lib/db/bespoke-requests";
import { readBespokeStatusFilter } from "@/lib/bespoke/status";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const search = url.searchParams.get("q") ?? "";
  const status = readBespokeStatusFilter(url.searchParams.get("status"));
  const requests = await listBespokeRequests(search, status);
  return NextResponse.json({ requests });
}
