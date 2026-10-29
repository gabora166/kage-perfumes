import { NextResponse } from "next/server";
import { publicCheckoutError } from "@/lib/checkout/errors";
import { createOrder } from "@/lib/db/orders";
import type { CheckoutRequest } from "@/lib/db/orders";
import { RateLimitError, consumeOrderAddress, consumeOrderPhone } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const address = consumeOrderAddress(request.headers);
    const body = (await request.json()) as CheckoutRequest;
    if (!address) consumeOrderPhone(typeof body.phone === "string" ? body.phone : null);
    const order = await createOrder({
      customerName: String(body.customerName ?? ""),
      phone: String(body.phone ?? ""),
      city: String(body.city ?? ""),
      address: String(body.address ?? ""),
      notes: String(body.notes ?? ""),
      giftWrap: body.giftWrap === true,
      giftMessage: String(body.giftMessage ?? ""),
      promoCode: String(body.promoCode ?? ""),
      items: Array.isArray(body.items) ? body.items : [],
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    const message = error instanceof Error ? error.message : "تعذّر حفظ الطلب.";
    return NextResponse.json({ error: publicCheckoutError(message) }, { status: 400 });
  }
}
