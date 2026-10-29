"use client";

import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/motion/reveal";
import {
  bespokeConcentrationLabels,
  bespokeConcentrations,
  bespokeSizeLabels,
  bespokeSizeOptions,
} from "@/lib/bespoke/options";
import { firstBespokeError, type BespokeRequestDraft } from "@/lib/bespoke/validation";

const initialDraft: BespokeRequestDraft = {
  perfumeName: "",
  phone: "",
  brandName: "",
  sizeOption: "",
  customSize: "",
  quantity: 1,
  concentration: "",
  notes: "",
};

export function BespokeRequestForm() {
  const [draft, setDraft] = useState<BespokeRequestDraft>(initialDraft);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    const validationError = firstBespokeError(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bespoke-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const body = (await response.json()) as { error?: string; reference?: string };
      if (!response.ok || !body.reference) {
        setError(body.error ?? "تعذّر إرسال الطلب. حاول مرة أخرى.");
        setIsSubmitting(false);
        return;
      }
      setReference(body.reference);
      setDraft(initialDraft);
      setIsSubmitting(false);
    } catch {
      setError("تعذّر الاتصال. تحقق من الشبكة وحاول مرة أخرى.");
      setIsSubmitting(false);
    }
  }

  if (reference) {
    return (
      <Reveal variant="rise">
        <div
          className="border border-brass/35 bg-ink-soft/60 px-6 py-10 text-center md:px-10"
          role="status"
          aria-live="polite"
        >
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.38em] text-brass">Request received</p>
          <h2 className="mt-4 font-arabic-display text-3xl text-ivory md:text-4xl">وصلنا طلبك</h2>
          <p className="mx-auto mt-4 max-w-md leading-8 text-mist">
            هنراجع إمكانية التوفير أو التحضير، ونبلّغك بالسعر قبل أي التزام بالشراء.
          </p>
          <p dir="ltr" className="mt-6 font-display text-2xl text-brass">
            {reference}
          </p>
          <p className="mt-2 text-sm text-mist">احتفظ برقم الطلب للمتابعة مع الدار.</p>
          <button
            type="button"
            className="pressable mt-8 inline-flex h-12 items-center justify-center border border-ivory/25 px-7 text-sm text-ivory"
            onClick={() => setReference(null)}
          >
            إرسال طلب آخر
          </button>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal variant="rise">
      <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-6 md:grid-cols-2" noValidate>
        <label className="block text-sm text-mist md:col-span-2">
          اسم العطر المطلوب
          <span className="text-seal"> *</span>
          <input
            name="perfumeName"
            required
            value={draft.perfumeName}
            onChange={(event) => setDraft((current) => ({ ...current, perfumeName: event.target.value }))}
            autoComplete="off"
            className="mt-2 w-full border border-ivory/15 bg-transparent px-4 py-3 text-ivory outline-none focus-visible:border-brass"
          />
        </label>
        <label className="block text-sm text-mist">
          رقم الموبايل
          <span className="text-seal"> *</span>
          <input
            name="phone"
            required
            dir="ltr"
            inputMode="tel"
            autoComplete="tel"
            value={draft.phone}
            onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
            placeholder="01xxxxxxxxx"
            className="mt-2 w-full border border-ivory/15 bg-transparent px-4 py-3 text-start text-ivory outline-none focus-visible:border-brass"
          />
        </label>
        <label className="block text-sm text-mist">
          الماركة الأصلية
          <span className="ms-2 text-xs text-mist/70">(اختياري)</span>
          <input
            name="brandName"
            value={draft.brandName}
            onChange={(event) => setDraft((current) => ({ ...current, brandName: event.target.value }))}
            autoComplete="off"
            className="mt-2 w-full border border-ivory/15 bg-transparent px-4 py-3 text-ivory outline-none focus-visible:border-brass"
          />
        </label>
        <label className="block text-sm text-mist">
          الحجم المطلوب
          <span className="ms-2 text-xs text-mist/70">(اختياري)</span>
          <select
            name="sizeOption"
            value={draft.sizeOption}
            onChange={(event) => setDraft((current) => ({ ...current, sizeOption: event.target.value }))}
            className="mt-2 w-full border border-ivory/15 bg-ink px-4 py-3 text-ivory outline-none focus-visible:border-brass"
          >
            <option value="">بدون تفضيل</option>
            {bespokeSizeOptions.map((option) => (
              <option key={option} value={option}>
                {bespokeSizeLabels[option]}
              </option>
            ))}
          </select>
        </label>
        {draft.sizeOption === "custom" ? (
          <label className="block text-sm text-mist">
            الحجم المخصص
            <input
              name="customSize"
              value={draft.customSize}
              onChange={(event) => setDraft((current) => ({ ...current, customSize: event.target.value }))}
              className="mt-2 w-full border border-ivory/15 bg-transparent px-4 py-3 text-ivory outline-none focus-visible:border-brass"
            />
          </label>
        ) : (
          <label className="block text-sm text-mist">
            الكمية
            <span className="ms-2 text-xs text-mist/70">(اختياري)</span>
            <input
              name="quantity"
              type="number"
              min={1}
              max={20}
              dir="ltr"
              inputMode="numeric"
              value={draft.quantity}
              onChange={(event) =>
                setDraft((current) => ({ ...current, quantity: Number(event.target.value) || 1 }))
              }
              className="mt-2 w-full border border-ivory/15 bg-transparent px-4 py-3 text-start text-ivory outline-none focus-visible:border-brass"
            />
          </label>
        )}
        {draft.sizeOption === "custom" ? (
          <label className="block text-sm text-mist">
            الكمية
            <span className="ms-2 text-xs text-mist/70">(اختياري)</span>
            <input
              name="quantity"
              type="number"
              min={1}
              max={20}
              dir="ltr"
              inputMode="numeric"
              value={draft.quantity}
              onChange={(event) =>
                setDraft((current) => ({ ...current, quantity: Number(event.target.value) || 1 }))
              }
              className="mt-2 w-full border border-ivory/15 bg-transparent px-4 py-3 text-start text-ivory outline-none focus-visible:border-brass"
            />
          </label>
        ) : null}
        <label className="block text-sm text-mist md:col-span-2">
          الكثافة المفضلة
          <span className="ms-2 text-xs text-mist/70">(اختياري)</span>
          <select
            name="concentration"
            value={draft.concentration}
            onChange={(event) => setDraft((current) => ({ ...current, concentration: event.target.value }))}
            className="mt-2 w-full border border-ivory/15 bg-ink px-4 py-3 text-ivory outline-none focus-visible:border-brass"
          >
            <option value="">بدون تفضيل</option>
            {bespokeConcentrations.map((option) => (
              <option key={option} value={option}>
                {bespokeConcentrationLabels[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-mist md:col-span-2">
          ملاحظات إضافية، ميزانية، أو توقيت مطلوب
          <span className="ms-2 text-xs text-mist/70">(اختياري)</span>
          <textarea
            name="notes"
            rows={4}
            value={draft.notes}
            onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
            className="mt-2 w-full resize-y border border-ivory/15 bg-transparent px-4 py-3 text-ivory outline-none focus-visible:border-brass"
          />
        </label>
        <p className="text-sm leading-7 text-mist/80 md:col-span-2">
          مفيش التزام بالشراء قبل موافقتك على السعر. هنراجع الطلب ونبلّغك بالعرض عبر واتساب.
        </p>
        {error ? (
          <p className="text-sm text-seal md:col-span-2" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="pressable h-12 bg-seal px-7 text-sm text-ivory disabled:opacity-40 md:col-span-2 md:w-fit"
        >
          {isSubmitting ? "جارٍ الإرسال…" : "إرسال طلب العطر"}
        </button>
      </form>
    </Reveal>
  );
}
