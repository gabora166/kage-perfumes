import { NextResponse } from "next/server";
import { saveNewsletterEmail } from "@/lib/db/newsletters";
import { RateLimitError, consumeNewsletterAddress, consumeNewsletterEmail } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const address = consumeNewsletterAddress(request.headers);
    const body = (await request.json()) as { email?: unknown };
    if (!address) consumeNewsletterEmail(typeof body.email === "string" ? body.email : null);
    const result = await saveNewsletterEmail(typeof body.email === "string" ? body.email : "");
    return NextResponse.json({ ok: true, alreadySubscribed: result === "exists" });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    const message = error instanceof Error ? error.message : "تعذّر حفظ البريد.";
    const safeMessage = message === "البريد غير واضح." ? message : "تعذّر حفظ البريد.";
    return NextResponse.json({ error: safeMessage }, { status: 400 });
  }
}
