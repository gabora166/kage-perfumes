import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getBespokeRequest, updateBespokeRequestStaff } from "@/lib/db/bespoke-requests";
import { isBespokeStatus } from "@/lib/bespoke/status";
import type { BespokeStatus } from "@/lib/bespoke/status";
import {
  readFulfillmentEstimate,
  readInternalNote,
  readProposedPriceSar,
} from "@/lib/bespoke/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const request = await getBespokeRequest(id);
  if (!request) return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
  return NextResponse.json({ request });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  try {
    const body = (await request.json()) as {
      status?: unknown;
      internalNote?: unknown;
      proposedPriceSar?: unknown;
      fulfillmentEstimate?: unknown;
      issueQuote?: unknown;
    };
    let status: BespokeStatus | undefined;
    if (typeof body.status === "string") {
      if (!isBespokeStatus(body.status)) {
        return NextResponse.json({ error: "حالة غير معروفة." }, { status: 400 });
      }
      status = body.status;
    }
    const proposedPriceSar = parseOptionalPrice(body.proposedPriceSar);
    const result = await updateBespokeRequestStaff({
      id,
      status,
      internalNote: body.internalNote === undefined ? undefined : readInternalNote(body.internalNote),
      proposedPriceSar,
      fulfillmentEstimate:
        body.fulfillmentEstimate === undefined
          ? undefined
          : readFulfillmentEstimate(body.fulfillmentEstimate),
      issueQuote: body.issueQuote === true,
    });
    const updated = await getBespokeRequest(id);
    return NextResponse.json({
      ok: true,
      request: updated,
      quoteWhatsAppUrl: result.quoteWhatsAppUrl,
      approvalPath: result.approvalPath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذّر حفظ التعديل.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function parseOptionalPrice(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return readProposedPriceSar(value);
}
