"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  bespokeConcentrationLabels,
  bespokeSizeLabels,
} from "@/lib/bespoke/options";
import { bespokeStatuses, bespokeStatusLabels } from "@/lib/bespoke/status";
import type { BespokeStatus } from "@/lib/bespoke/status";
import { formatPrice } from "@/lib/catalog/money";
import type { BespokeRequestRecord } from "@/lib/bespoke/types";

type BespokeManagerProps = {
  requests: BespokeRequestRecord[];
};

export function BespokeManager({ requests }: BespokeManagerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BespokeStatus | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(requests[0]?.id ?? null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [quoteUrl, setQuoteUrl] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return requests.filter((request) => {
      if (statusFilter && request.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        request.reference.toLowerCase().includes(needle) ||
        request.perfumeName.toLowerCase().includes(needle) ||
        request.phone.includes(needle) ||
        bespokeStatusLabels[request.status].includes(needle)
      );
    });
  }, [query, requests, statusFilter]);

  const selected = filtered.find((request) => request.id === selectedId) ?? filtered[0] ?? null;

  async function save(input: {
    status?: BespokeStatus;
    internalNote?: string;
    proposedPriceSar?: number | null;
    fulfillmentEstimate?: string;
    issueQuote?: boolean;
  }): Promise<void> {
    if (!selected) return;
    setError("");
    setQuoteUrl(null);
    setIsSaving(true);
    const response = await fetch(`/api/admin/bespoke-requests/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = (await response.json()) as {
      error?: string;
      quoteWhatsAppUrl?: string | null;
    };
    if (!response.ok) {
      setError(body.error ?? "تعذّر الحفظ.");
      setIsSaving(false);
      return;
    }
    if (body.quoteWhatsAppUrl) setQuoteUrl(body.quoteWhatsAppUrl);
    setIsSaving(false);
    router.refresh();
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-arabic-display text-5xl">طلبات خاصة</h1>
        <p className="mt-3 max-w-2xl text-mist">
          طلبات عطور غير مدرجة في الكتالوج. السعر يُحدَّد هنا، ثم يُرسل للعميل عبر واتساب للموافقة قبل إنشاء طلب عادي.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="بحث بالرقم أو اسم العطر أو الجوال"
          className="min-w-[16rem] flex-1 border border-white/15 bg-transparent px-4 py-3 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as BespokeStatus | "")}
          className="border border-white/15 bg-ink px-4 py-3 text-sm"
        >
          <option value="">كل الحالات</option>
          {bespokeStatuses.map((status) => (
            <option key={status} value={status}>
              {bespokeStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <ul className="space-y-2">
          {filtered.length === 0 ? (
            <li className="border border-white/10 px-4 py-6 text-sm text-mist">لا توجد طلبات مطابقة.</li>
          ) : (
            filtered.map((request) => {
              const isActive = selected?.id === request.id;
              return (
                <li key={request.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(request.id);
                      setQuoteUrl(null);
                      setError("");
                    }}
                    className={`w-full border px-4 py-3 text-start ${
                      isActive ? "border-gold/40 bg-gold/10" : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p dir="ltr" className="font-display text-lg text-gold-bright">
                        {request.reference}
                      </p>
                      <span className="text-xs text-mist">{bespokeStatusLabels[request.status]}</span>
                    </div>
                    <p className="mt-1 text-sm text-cream">{request.perfumeName}</p>
                    <p dir="ltr" className="mt-1 text-start text-xs text-mist">
                      {request.phone}
                    </p>
                  </button>
                </li>
              );
            })
          )}
        </ul>
        {selected ? (
          <RequestEditor
            key={selected.id}
            request={selected}
            error={error}
            isSaving={isSaving}
            quoteUrl={quoteUrl}
            onSave={save}
          />
        ) : (
          <p className="text-sm text-mist">اختر طلباً لعرض التفاصيل.</p>
        )}
      </div>
    </div>
  );
}

type RequestEditorProps = {
  request: BespokeRequestRecord;
  error: string;
  isSaving: boolean;
  quoteUrl: string | null;
  onSave: (input: {
    status?: BespokeStatus;
    internalNote?: string;
    proposedPriceSar?: number | null;
    fulfillmentEstimate?: string;
    issueQuote?: boolean;
  }) => Promise<void>;
};

function RequestEditor({ request, error, isSaving, quoteUrl, onSave }: RequestEditorProps) {
  const [status, setStatus] = useState<BespokeStatus>(request.status);
  const [internalNote, setInternalNote] = useState(request.internalNote);
  const [price, setPrice] = useState(request.proposedPriceSar?.toString() ?? "");
  const [fulfillment, setFulfillment] = useState(request.fulfillmentEstimate);
  const sizeLabel = request.sizeOption
    ? request.sizeOption === "custom"
      ? request.customSize || bespokeSizeLabels.custom
      : bespokeSizeLabels[request.sizeOption]
    : "غير محدد";

  return (
    <div className="space-y-6 border border-white/10 p-5">
      <div>
        <p dir="ltr" className="font-display text-2xl text-gold-bright">
          {request.reference}
        </p>
        <h2 className="mt-2 font-arabic-display text-3xl">{request.perfumeName}</h2>
        {request.brandName ? <p className="mt-1 text-mist">{request.brandName}</p> : null}
      </div>
      <dl className="grid gap-3 text-sm text-mist sm:grid-cols-2">
        <div>
          <dt>الجوال</dt>
          <dd dir="ltr" className="mt-1 text-start text-cream">
            {request.phone}
          </dd>
        </div>
        <div>
          <dt>الحجم × الكمية</dt>
          <dd className="mt-1 text-cream">
            {sizeLabel} × {request.quantity}
          </dd>
        </div>
        <div>
          <dt>الكثافة</dt>
          <dd className="mt-1 text-cream">
            {request.concentration ? bespokeConcentrationLabels[request.concentration] : "غير محدد"}
          </dd>
        </div>
        <div>
          <dt>تاريخ الإرسال</dt>
          <dd dir="ltr" className="mt-1 text-start text-cream">
            {new Date(request.createdAt).toLocaleString("ar-EG")}
          </dd>
        </div>
        {request.notes ? (
          <div className="sm:col-span-2">
            <dt>ملاحظات العميل</dt>
            <dd className="mt-1 whitespace-pre-wrap text-cream">{request.notes}</dd>
          </div>
        ) : null}
        {request.customerResponse ? (
          <div className="sm:col-span-2">
            <dt>رد العميل</dt>
            <dd className="mt-1 text-cream">
              {request.customerResponse === "approved" ? "موافقة" : "رفض"}
              {request.customerResponseAt
                ? ` — ${new Date(request.customerResponseAt).toLocaleString("ar-EG")}`
                : ""}
            </dd>
          </div>
        ) : null}
      </dl>
      <label className="block text-sm">
        الحالة
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as BespokeStatus)}
          className="mt-2 w-full border border-white/15 bg-ink px-4 py-3"
        >
          {bespokeStatuses.map((entry) => (
            <option key={entry} value={entry}>
              {bespokeStatusLabels[entry]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        السعر المقترح (ج.م)
        <input
          dir="ltr"
          inputMode="numeric"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3 text-start"
        />
      </label>
      <label className="block text-sm">
        مدة التجهيز التقديرية
        <input
          value={fulfillment}
          onChange={(event) => setFulfillment(event.target.value)}
          placeholder="مثال: ٣–٥ أيام عمل"
          className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3"
        />
      </label>
      <label className="block text-sm">
        ملاحظة داخلية
        <textarea
          rows={4}
          value={internalNote}
          onChange={(event) => setInternalNote(event.target.value)}
          className="mt-2 w-full resize-y border border-white/15 bg-transparent px-4 py-3"
        />
        <span className="mt-1 block text-xs text-mist">لا تظهر للعميل.</span>
      </label>
      {request.proposedPriceSar !== null ? (
        <p className="text-sm text-mist">آخر سعر محفوظ: {formatPrice(request.proposedPriceSar)}</p>
      ) : null}
      {error ? <p className="text-sm text-gold-bright">{error}</p> : null}
      {quoteUrl ? (
        <a
          href={quoteUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm text-gold underline-offset-4 hover:underline"
        >
          فتح واتساب لإرسال العرض للعميل
        </a>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isSaving}
          onClick={() =>
            void onSave({
              status,
              internalNote,
              proposedPriceSar: price.trim() ? Number(price) : null,
              fulfillmentEstimate: fulfillment,
            })
          }
          className="h-11 bg-gold px-5 text-sm text-ink disabled:opacity-40"
        >
          حفظ
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() =>
            void onSave({
              status,
              internalNote,
              proposedPriceSar: price.trim() ? Number(price) : null,
              fulfillmentEstimate: fulfillment,
              issueQuote: true,
            })
          }
          className="h-11 border border-gold/40 px-5 text-sm text-gold disabled:opacity-40"
        >
          حفظ وإصدار عرض + واتساب
        </button>
      </div>
      {request.status === "approved" ? (
        <p className="border border-gold/25 bg-gold/10 px-4 py-3 text-sm text-cream">
          وافق العميل على السعر. أنشئ طلباً عادياً يدوياً بعد تأكيد العنوان والتفاصيل — لا يُنشأ طلب تلقائياً من هذا العرض بعد.
        </p>
      ) : null}
    </div>
  );
}
