import { NextResponse } from "next/server";
import { findGuestOrders } from "@/lib/db/orders";
import { RateLimitError, consumeTrackAddress, consumeTrackPhone } from "@/lib/security/rate-limit";

const notFoundMessage = "لا يوجد طلب بهذا الجوال.";

export async function POST(request: Request) {
  try {
    const address = consumeTrackAddress(request.headers);
    const body = (await request.json()) as { phone?: unknown };
    const phone = typeof body.phone === "string" ? body.phone : "";
    if (!address) consumeTrackPhone(phone);
    const orders = await findGuestOrders(phone);
    if (orders.length === 0) return NextResponse.json({ error: notFoundMessage }, { status: 404 });
    return NextResponse.json({ orders });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: "تعذّر البحث عن الطلب." }, { status: 400 });
  }
}
