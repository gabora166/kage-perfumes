"use client";

import Link from "next/link";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import { PromoField } from "@/components/checkout/promo-field";
import { useCart } from "@/components/cart/cart-provider";
import { lineTotalSar } from "@/lib/cart/lines";
import { cartSignature } from "@/lib/cart/cart-store";
import { giftWrapFeeSar } from "@/lib/checkout/adjustments";
import { customerFieldErrors } from "@/lib/checkout/customer";
import type { CustomerField } from "@/lib/checkout/customer";
import { createSubmitLock } from "@/lib/checkout/submit-lock";
import { formatPrice } from "@/lib/catalog/money";
import { cn } from "@/lib/cn";
import {
  complimentaryTesterCopy,
  shippingMessageForCity,
  trustPolicyPaths,
} from "@/lib/trust/offers";

type OrderResult = {
  reference: string;
  totalSar: number;
  whatsappUrl: string | null;
};

type QuoteResult = {
  subtotalSar: number;
  discountSar: number;
  giftWrapSar: number;
  totalSar: number;
};

type CustomerState = {
  customerName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  giftMessage: string;
};

const emptyCustomer: CustomerState = {
  customerName: "",
  phone: "",
  city: "",
  address: "",
  notes: "",
  giftMessage: "",
};

export function CheckoutForm() {
  const formId = useId();
  const { items, lines, subtotalSar, clearCart, appliedPromo } = useCart();
  const lock = useRef(createSubmitLock());
  const [customer, setCustomer] = useState<CustomerState>(emptyCustomer);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CustomerField, string>>>({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [serverQuote, setServerQuote] = useState<{ key: string; quote: QuoteResult } | null>(null);
  const [result, setResult] = useState<OrderResult | null>(null);
  const isCartReady = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const cartKey = `${cartSignature(items)}:${giftWrap ? "wrap" : "plain"}:${appliedPromo?.code ?? ""}`;
  const activeQuote = serverQuote?.key === cartKey ? serverQuote.quote : null;
  const discountSar = activeQuote?.discountSar ?? appliedPromo?.discountSar ?? 0;
  const merchandiseSar = activeQuote?.subtotalSar ?? subtotalSar;
  const wrapSar = giftWrap ? (activeQuote?.giftWrapSar ?? giftWrapFeeSar) : 0;
  const totalSar = activeQuote?.totalSar ?? merchandiseSar - discountSar + wrapSar;
  const deliveryComplete =
    customer.customerName.trim().length > 0 &&
    customer.phone.trim().length > 0 &&
    customer.city.trim().length > 0 &&
    customer.address.trim().length > 0;
  const checkoutProgress = deliveryComplete ? 1 : 0.45;

  function updateCustomer(field: keyof CustomerState, value: string): void {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!lock.current.claim()) return;
    setError("");
    const nextErrors = customerFieldErrors(customer);
    setFieldErrors(nextErrors);
    const firstField = firstInvalidField(nextErrors);
    if (firstField) {
      document.getElementById(`${formId}-${firstField}`)?.focus();
      lock.current.release();
      return;
    }
    setIsSubmitting(true);
    let accepted = false;
    try {
      const quote = await postJson<QuoteResult>("/api/checkout/quote", {
        items,
        promoCode: appliedPromo?.code ?? "",
        giftWrap,
        giftMessage: giftWrap ? customer.giftMessage : "",
      });
      if (!quote.ok) {
        setError(quote.error);
        return;
      }
      if (quote.body.totalSar !== totalSar) {
        setServerQuote({ key: cartKey, quote: quote.body });
        setError("تغيّر السعر في سجل الدار. راجع المجموع ثم أكّد مرة أخرى.");
        return;
      }
      const order = await postJson<OrderResult>("/api/orders", {
        customerName: customer.customerName,
        phone: customer.phone,
        city: customer.city,
        address: customer.address,
        notes: customer.notes,
        giftWrap,
        giftMessage: giftWrap ? customer.giftMessage : "",
        promoCode: appliedPromo?.code ?? "",
        items,
      });
      if (!order.ok) {
        setError(order.error);
        return;
      }
      accepted = true;
      clearCart();
      setResult(order.body);
    } catch {
      setError("تعذّر الاتصال بالخادم. بياناتك ما زالت في النموذج.");
    } finally {
      if (!accepted) {
        lock.current.release();
        setIsSubmitting(false);
      }
    }
  }

  if (result) {
    return (
      <section className="border border-border bg-ivory px-6 py-10 text-ink md:px-8">
        <p className="text-sm text-brass">تم حفظ الطلب</p>
        <h2 className="mt-3 font-arabic-display text-4xl md:text-5xl">وصل طلبك</h2>
        <p dir="ltr" className="mt-5 w-fit font-display text-4xl">
          {result.reference}
        </p>
        <p className="mt-4 leading-8 text-ink/75">
          الدفع عند الاستلام. المجموع {formatPrice(result.totalSar)}.
        </p>
        <Link href="/track" className="mt-4 inline-flex min-h-11 items-center text-sm text-seal">
          تتبع الطلب لاحقًا برقم الجوال
        </Link>
        {result.whatsappUrl ? (
          <a
            href={result.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex h-12 items-center bg-seal px-6 text-sm text-ivory"
          >
            أرسل الملخص عبر واتساب
          </a>
        ) : (
          <p className="mt-6 text-sm leading-7 text-ink/70">حُفظ الطلب في لوحة الدار.</p>
        )}
      </section>
    );
  }

  if (!isCartReady) {
    return <p className="text-sm text-mist">جارٍ قراءة الحقيبة.</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="border-t border-border pt-10">
        <p className="font-arabic-display text-4xl text-ivory">الحقيبة فارغة</p>
        <p className="mt-3 max-w-md leading-7 text-mist">أضف زجاجة أو عيّنة من المجموعة قبل إتمام الطلب.</p>
        <Link href="/catalog" className="mt-6 inline-flex min-h-11 items-center text-brass">
          العودة إلى العطور
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(event)}
      className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem] xl:gap-16"
    >
      <div className="space-y-10">
        <div
          className="border-t border-border pt-6"
          role="status"
          aria-label={deliveryComplete ? "بيانات التوصيل مكتملة" : "أكمل بيانات التوصيل"}
        >
          <div className="flex items-center justify-between gap-3 text-sm text-mist">
            <span>تقدم الطلب</span>
            <span className="text-brass">{deliveryComplete ? "جاهز للإرسال" : "بيانات التوصيل"}</span>
          </div>
          <div className="mt-3 h-px overflow-hidden bg-border">
            <div
              className="h-full bg-seal transition-[width] duration-300 ease-out motion-reduce:transition-none"
              style={{ width: `${checkoutProgress * 100}%` }}
            />
          </div>
        </div>
        <fieldset className="min-w-0 space-y-5 border-0 border-t border-border p-0 pt-8">
          <legend className="mb-2 px-0">
            <span className="block text-sm text-brass">1 · التوصيل</span>
            <span className="mt-2 block font-arabic-display text-4xl">المستلم والعنوان</span>
          </legend>
          <TextField
            id={`${formId}-customerName`}
            label="الاسم"
            required
            autoComplete="name"
            value={customer.customerName}
            error={fieldErrors.customerName}
            onChange={(value) => updateCustomer("customerName", value)}
          />
          <TextField
            id={`${formId}-phone`}
            label="رقم الموبايل"
            required
            dir="ltr"
            autoComplete="tel"
            inputMode="tel"
            placeholder="01xxxxxxxxx"
            value={customer.phone}
            error={fieldErrors.phone}
            onChange={(value) => updateCustomer("phone", value)}
          />
          <TextField
            id={`${formId}-city`}
            label="المدينة أو المحافظة"
            required
            autoComplete="address-level2"
            value={customer.city}
            error={fieldErrors.city}
            onChange={(value) => updateCustomer("city", value)}
          />
          <CheckoutShippingNote city={customer.city} />
          <TextArea
            id={`${formId}-address`}
            label="العنوان"
            required
            autoComplete="street-address"
            rows={4}
            value={customer.address}
            error={fieldErrors.address}
            onChange={(value) => updateCustomer("address", value)}
          />
          <TextArea
            id={`${formId}-notes`}
            label="ملاحظة"
            rows={3}
            value={customer.notes}
            onChange={(value) => updateCustomer("notes", value)}
          />
        </fieldset>

        <fieldset className="min-w-0 border-0 border-t border-border p-0 pt-8">
          <legend className="mb-6 px-0">
            <span className="block text-sm text-brass">2 · الهدية</span>
            <span className="mt-2 block font-arabic-display text-4xl">تغليف اختياري</span>
          </legend>
          <label className="flex min-h-12 cursor-pointer items-center gap-3 border border-border bg-ivory px-4 text-sm text-ink">
            <input
              type="checkbox"
              checked={giftWrap}
              onChange={(event) => setGiftWrap(event.target.checked)}
              className="size-5 accent-seal"
            />
            <span>
              تغليف هدية
              <span dir="ltr" className="ms-2 inline-block tabular-nums text-ink/70">
                · {formatPrice(giftWrapFeeSar)}
              </span>
            </span>
          </label>
          {giftWrap ? (
            <div className="mt-5">
              <TextArea
                id={`${formId}-gift`}
                label="بطاقة الإهداء"
                rows={3}
                maxLength={160}
                placeholder="سطر قصير يُطبع على البطاقة"
                value={customer.giftMessage}
                onChange={(value) => updateCustomer("giftMessage", value)}
              />
            </div>
          ) : null}
        </fieldset>

        <section className="border-t border-border pt-8 lg:hidden">
          <OrderSummary
            formId={formId}
            lines={lines}
            merchandiseSar={merchandiseSar}
            discountSar={discountSar}
            giftWrap={giftWrap}
            wrapSar={wrapSar}
            totalSar={totalSar}
            city={customer.city}
          />
        </section>

        <section className="border-t border-border pt-8">
          <p className="text-sm text-brass">3 · الدفع</p>
          <h2 className="mt-2 font-arabic-display text-4xl">عند الاستلام</h2>
          <div className="mt-5 border border-border bg-ivory px-5 py-5 text-ink">
            <p className="font-arabic-display text-2xl">الدفع نقدًا عند التسليم</p>
            <p className="mt-3 text-sm leading-7 text-ink/70">
              لا يُطلب دفع مسبق. المبلغ يُسدَّد نقدًا بالجنيه عند وصول الطلب.
            </p>
            <p className="mt-3 text-sm leading-7 text-ink/70">
              راجع{" "}
              <Link href="/trust/cod" className="text-seal">
                سياسة الدفع عند الاستلام
              </Link>
              .
            </p>
          </div>
          {error ? (
            <p className="mt-4 text-sm leading-7 text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <p className="mt-5 text-sm leading-7 text-mist">
            بالإتمام فأنت تقبل{" "}
            <Link href="/trust/cod" className="text-brass">
              الدفع عند الاستلام
            </Link>{" "}
            و{" "}
            <Link href="/trust/returns" className="text-brass">
              سياسة الإرجاع
            </Link>
            .
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="mt-6 h-12 w-full bg-seal px-8 text-sm text-ivory disabled:opacity-40"
          >
            {isSubmitting ? "جارٍ تثبيت الطلب" : "تأكيد الطلب والدفع عند الاستلام"}
          </button>
        </section>
      </div>

      <aside className="hidden space-y-6 lg:sticky lg:top-24 lg:block">
        <OrderSummary
          formId={formId}
          lines={lines}
          merchandiseSar={merchandiseSar}
          discountSar={discountSar}
          giftWrap={giftWrap}
          wrapSar={wrapSar}
          totalSar={totalSar}
          city={customer.city}
        />
      </aside>
    </form>
  );
}

function CheckoutShippingNote({ city }: { city: string }) {
  const message = shippingMessageForCity(city);
  return (
    <p
      className={cn(
        "text-sm leading-7",
        message.tone === "mansoura" ? "text-brass" : "text-mist",
      )}
      role="status"
    >
      {message.text}{" "}
      <Link href={trustPolicyPaths.delivery} className="text-brass underline-offset-4 hover:underline">
        صفحة التوصيل
      </Link>
      .
    </p>
  );
}

type SummaryLine = {
  key: string;
  titleAr: string;
  detail: string;
  unitLabel: string;
  unitPriceSar: number;
  quantity: number;
};

type OrderSummaryProps = {
  formId: string;
  lines: readonly SummaryLine[];
  merchandiseSar: number;
  discountSar: number;
  giftWrap: boolean;
  wrapSar: number;
  totalSar: number;
  city: string;
};

function OrderSummary({
  formId,
  lines,
  merchandiseSar,
  discountSar,
  giftWrap,
  wrapSar,
  totalSar,
  city,
}: OrderSummaryProps) {
  const shipping = shippingMessageForCity(city);
  return (
    <section className="border border-border bg-ivory px-5 py-6 text-ink md:px-6">
      <p className="text-sm text-brass">ملخص الطلب</p>
      <h2 className="mt-2 font-arabic-display text-3xl md:text-4xl">ما ستستلمه</h2>
      <ul className="mt-6 divide-y divide-ink/10 border-y border-border">
        {lines.map((line) => (
          <li key={line.key} className="flex justify-between gap-4 py-4 text-sm">
            <span className="min-w-0">
              <span className="block font-arabic-display text-2xl leading-tight">{line.titleAr}</span>
              <span className="mt-1 block text-ink/70">
                {line.detail} × {line.quantity}
              </span>
              <span className="mt-1 block text-ink/70">
                {line.unitLabel} {formatPrice(line.unitPriceSar)}
              </span>
            </span>
            <span dir="ltr" className="shrink-0 tabular-nums">
              {formatPrice(lineTotalSar(line.unitPriceSar, line.quantity))}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <PromoField inputId={`${formId}-promo`} />
      </div>
      <div className="mt-5 space-y-2 text-sm">
        <SummaryRow label="ثمن العطور" amount={merchandiseSar} />
        {discountSar > 0 ? <SummaryRow label="خصم الرمز" amount={discountSar} /> : null}
        {giftWrap ? <SummaryRow label="تغليف الهدية" amount={wrapSar} /> : null}
        <SummaryRow label="المجموع عند الاستلام" amount={totalSar} emphasis />
      </div>
      <p
        className={cn(
          "mt-4 text-sm leading-7",
          shipping.tone === "mansoura" ? "text-seal" : "text-ink/70",
        )}
        role="status"
      >
        {shipping.text}{" "}
        <Link href={trustPolicyPaths.delivery} className="text-seal">
          صفحة التوصيل
        </Link>
        .
      </p>
      <p className="mt-2 text-sm leading-7 text-ink/70">
        {complimentaryTesterCopy.short}{" "}
        <Link href={trustPolicyPaths.returns} className="text-seal">
          سياسة الإرجاع
        </Link>
        .
      </p>
      <p className="mt-2 text-sm leading-7 text-ink/70">يُثبَّت المجموع من الخادم عند تأكيد الطلب.</p>
    </section>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  dir?: "ltr";
  autoComplete?: string;
  inputMode?: "tel";
  placeholder?: string;
};

function TextField({
  id,
  label,
  value,
  onChange,
  required = false,
  error,
  dir,
  autoComplete,
  inputMode,
  placeholder,
}: TextFieldProps) {
  const errorId = `${id}-error`;
  return (
    <label className="block text-sm" htmlFor={id}>
      <FieldLabel label={label} required={required} />
      <input
        id={id}
        value={value}
        dir={dir}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "mt-2 h-12 w-full scroll-mb-28 border bg-ivory px-4 text-ink outline-none transition-[border-color] duration-200 focus:border-ink",
          error ? "border-danger" : "border-border",
        )}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </label>
  );
}

type TextAreaProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  rows: number;
  maxLength?: number;
  placeholder?: string;
  autoComplete?: string;
};

function TextArea({
  id,
  label,
  value,
  onChange,
  required = false,
  error,
  rows,
  maxLength,
  placeholder,
  autoComplete,
}: TextAreaProps) {
  const errorId = `${id}-error`;
  return (
    <label className="block text-sm" htmlFor={id}>
      <FieldLabel label={label} required={required} />
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "mt-2 w-full scroll-mb-28 border bg-ivory px-4 py-3 text-ink outline-none transition-[border-color] duration-200 focus:border-ink",
          error ? "border-danger" : "border-border",
        )}
      />
      {error ? (
        <p id={errorId} className="mt-2 text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </label>
  );
}

function FieldLabel({ label, required }: { label: string; required: boolean }) {
  return (
    <span>
      {label}
      <span className="ms-2 text-mist">{required ? "مطلوب" : "اختياري"}</span>
    </span>
  );
}

function SummaryRow({ label, amount, emphasis = false }: { label: string; amount: number; emphasis?: boolean }) {
  return (
    <p className={`flex justify-between gap-3 ${emphasis ? "border-t border-border pt-3 text-base" : ""}`}>
      <span className={emphasis ? "font-arabic-display text-2xl" : "text-ink/70"}>{label}</span>
      <span dir="ltr" className={emphasis ? "font-display text-3xl tabular-nums" : "tabular-nums"}>
        {formatPrice(amount)}
      </span>
    </p>
  );
}

function firstInvalidField(errors: Partial<Record<CustomerField, string>>): CustomerField | null {
  if (errors.customerName) return "customerName";
  if (errors.phone) return "phone";
  if (errors.city) return "city";
  if (errors.address) return "address";
  return null;
}

async function postJson<T>(url: string, payload: unknown): Promise<{ ok: true; body: T } | { ok: false; error: string }> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) return { ok: false, error: body.error ?? "تعذّر إرسال الطلب." };
  return { ok: true, body };
}
