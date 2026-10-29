import { CheckoutForm } from "@/components/checkout/checkout-form";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "إتمام الطلب",
  description: "الدفع عند الاستلام، مع إرسال ملخص الطلب إلى واتساب الدار.",
  path: "/checkout",
  index: false,
});

export default function CheckoutPage() {
  return (
    <>
      <header className="relative overflow-hidden px-5 pb-8 pt-28 md:px-8 md:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-border to-transparent"
        />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm text-brass">الدفع عند الاستلام</p>
          <h1 className="mt-3 font-arabic-display text-4xl text-ivory md:text-6xl">إتمام الطلب</h1>
          <p className="mt-4 max-w-xl leading-8 text-mist">
            راجع الملخص، ثم اترك عنوان التوصيل. لا يُطلب دفع مسبق.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
        <CheckoutForm />
      </div>
    </>
  );
}
