import { NextResponse } from "next/server";
import { getPublicQuoteByToken, respondToBespokeQuote } from "@/lib/db/bespoke-requests";
import { RateLimitError, consumeBespokeQuoteAddress } from "@/lib/security/rate-limit";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const quote = await getPublicQuoteByToken(token);
  if (!quote) return NextResponse.json({ error: "رابط العرض غير صالح." }, { status: 404 });
  return NextResponse.json({ quote });
}

export async function POST(request: Request, context: RouteContext) {
  try {
    consumeBespokeQuoteAddress(request.headers);
    const { token } = await context.params;
    const body = (await request.json()) as { response?: unknown };
    if (body.response !== "approved" && body.response !== "rejected") {
      return NextResponse.json({ error: "اختر الموافقة أو الرفض." }, { status: 400 });
    }
    const quote = await respondToBespokeQuote(token, body.response);
    return NextResponse.json({ ok: true, quote });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    const message = error instanceof Error ? error.message : "تعذّر تسجيل الرد.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
