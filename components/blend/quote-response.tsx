"use client";

import { useState } from "react";
import { bespokeConcentrationLabels, bespokeSizeLabels } from "@/lib/bespoke/options";
import type { BespokeConcentration, BespokeSizeOption } from "@/lib/bespoke/options";
import { canCustomerRespond } from "@/lib/bespoke/status";
import type { BespokeStatus } from "@/lib/bespoke/status";
import { formatPrice } from "@/lib/catalog/money";

export type QuoteResponseProps = {
  token: string;
  quote: {
    reference: string;
    perfumeName: string;
    brandName: string;
    sizeOption: BespokeSizeOption | null;
    customSize: string;
    quantity: number;
    concentration: BespokeConcentration | null;
    proposedPriceSar: number;
    fulfillmentEstimate: string;
    status: BespokeStatus;
    customerResponse: "approved" | "rejected" | null;
  };
};

export function QuoteResponse({ token, quote: initial }: QuoteResponseProps) {
  const [quote, setQuote] = useState(initial);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const canRespond = canCustomerRespond(quote.status) && !quote.customerResponse;

  async function respond(response: "approved" | "rejected"): Promise<void> {
    setError("");
    setIsSaving(true);
    try {
      const result = await fetch(`/api/bespoke-requests/quote/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      const body = (await result.json()) as {
        error?: string;
        quote?: QuoteResponseProps["quote"];
      };
      if (!result.ok || !body.quote) {
        setError(body.error ?? "تعذّر تسجيل الرد.");
        setIsSaving(false);
        return;
      }
      setQuote(body.quote);
      setIsSaving(false);
    } catch {
      setError("تعذّر الاتصال. حاول مرة أخرى.");
      setIsSaving(false);
    }
  }

  const sizeLabel = quote.sizeOption
    ? quote.sizeOption === "custom"
      ? quote.customSize || bespokeSizeLabels.custom
      : bespokeSizeLabels[quote.sizeOption]
    : "حسب الاتفاق";

  return (
    <div className="border border-ivory/12 bg-ink/35 p-6 md:p-8">
      <p className="font-sans text-[0.68rem] uppercase tracking-[0.38em] text-brass">Quote</p>
      <h2 className="mt-3 font-arabic-display text-3xl text-ivory">{quote.perfumeName}</h2>
      {quote.brandName ? <p className="mt-2 text-mist">{quote.brandName}</p> : null}
      <dl className="mt-8 grid gap-4 text-sm text-mist sm:grid-cols-2">
        <div>
          <dt className="text-brass">رقم الطلب</dt>
          <dd dir="ltr" className="mt-1 text-start text-ivory">
            {quote.reference}
          </dd>
        </div>
        <div>
          <dt className="text-brass">الحجم</dt>
          <dd className="mt-1 text-ivory">{sizeLabel}</dd>
        </div>
        <div>
          <dt className="text-brass">الكمية</dt>
          <dd className="mt-1 text-ivory">{quote.quantity}</dd>
        </div>
        <div>
          <dt className="text-brass">الكثافة</dt>
          <dd className="mt-1 text-ivory">
            {quote.concentration ? bespokeConcentrationLabels[quote.concentration] : "حسب الاتفاق"}
          </dd>
        </div>
        {quote.fulfillmentEstimate ? (
          <div className="sm:col-span-2">
            <dt className="text-brass">مدة التجهيز</dt>
            <dd className="mt-1 text-ivory">{quote.fulfillmentEstimate}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-8 font-arabic-display text-4xl text-brass">{formatPrice(quote.proposedPriceSar)}</p>
      <p className="mt-3 text-sm leading-7 text-mist">مفيش التزام بالشراء قبل موافقتك على هذا السعر.</p>
      {quote.customerResponse === "approved" || quote.status === "approved" ? (
        <p className="mt-8 border border-brass/30 bg-brass/10 px-4 py-3 text-sm text-ivory" role="status">
          تم تسجيل موافقتك. هتتواصل معاك الدار لاستكمال بيانات التوصيل قبل إنشاء الطلب النهائي.
        </p>
      ) : null}
      {quote.customerResponse === "rejected" || quote.status === "rejected" ? (
        <p className="mt-8 border border-ivory/15 px-4 py-3 text-sm text-mist" role="status">
          تم تسجيل رفضك للعرض. تقدر تتواصل مع الدار لو حابب تعديلاً.
        </p>
      ) : null}
      {canRespond ? (
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void respond("approved")}
            className="pressable h-12 bg-seal px-7 text-sm text-ivory disabled:opacity-40"
          >
            أوافق على السعر
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void respond("rejected")}
            className="pressable h-12 border border-ivory/25 px-7 text-sm text-ivory disabled:opacity-40"
          >
            أرفض العرض
          </button>
        </div>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-seal" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
