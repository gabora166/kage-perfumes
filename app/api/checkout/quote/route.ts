import { NextResponse } from "next/server";
import { publicCheckoutError } from "@/lib/checkout/errors";
import { quoteCheckout } from "@/lib/db/orders";
import type { CheckoutItem } from "@/lib/db/orders";
import { RateLimitError, consumePromoAddress, consumePromoCode } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const address = consumePromoAddress(request.headers);
    const body = (await request.json()) as {
      items?: CheckoutItem[];
      promoCode?: unknown;
      giftWrap?: unknown;
      giftMessage?: unknown;
    };
    if (!address) consumePromoCode(typeof body.promoCode === "string" ? body.promoCode : null);
    const quote = await quoteCheckout({
      items: Array.isArray(body.items) ? body.items : [],
      promoCode: String(body.promoCode ?? ""),
      giftWrap: body.giftWrap === true,
      giftMessage: String(body.giftMessage ?? ""),
    });
    return NextResponse.json(quote);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    const message = error instanceof Error ? error.message : "تعذّر حساب الطلب.";
    return NextResponse.json({ error: publicCheckoutError(message) }, { status: 400 });
  }
}
