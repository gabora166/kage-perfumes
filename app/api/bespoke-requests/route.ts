import { NextResponse } from "next/server";
import { createBespokeRequest } from "@/lib/db/bespoke-requests";
import {
  parseBespokeRequestBody,
  sanitizeBespokeRequest,
} from "@/lib/bespoke/validation";
import {
  RateLimitError,
  consumeBespokeAddress,
  consumeBespokePhone,
} from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const address = consumeBespokeAddress(request.headers);
    const body = parseBespokeRequestBody(await request.json());
    if (!address) consumeBespokePhone(body.phone);
    const input = sanitizeBespokeRequest(body);
    const created = await createBespokeRequest(input);
    return NextResponse.json({
      ok: true,
      id: created.id,
      reference: created.reference,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    const message = error instanceof Error ? error.message : "تعذّر حفظ الطلب.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
