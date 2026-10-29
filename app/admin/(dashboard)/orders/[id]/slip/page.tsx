import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminFallback } from "@/components/admin/admin-fallback";
import { PrintButton } from "@/components/admin/print-button";
import { formatPrice } from "@/lib/catalog/money";
import { getOrder } from "@/lib/db/orders";

type SlipPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "ورقة التجهيز",
};

export default function SlipPage({ params }: SlipPageProps) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Slip params={params} />
    </Suspense>
  );
}

async function Slip({ params }: SlipPageProps) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin/orders" className="text-sm text-gold">العودة للطلبات</Link>
        <PrintButton />
      </div>
      <article className="print-sheet max-w-3xl border border-white/10 bg-cream p-8 text-ink">
        <p className="font-sans text-[0.68rem] uppercase tracking-[0.36em]">KAGE</p>
        <h1 className="mt-3 font-arabic-display text-5xl">ورقة التجهيز</h1>
        <p dir="ltr" className="mt-2 font-display text-3xl">{order.reference}</p>
        <dl className="mt-8 space-y-3 text-sm leading-7">
          <div>
            <dt className="text-ink/60">الاسم</dt>
            <dd>{order.customerName}</dd>
          </div>
          <div>
            <dt className="text-ink/60">الجوال</dt>
            <dd dir="ltr">{order.phone}</dd>
          </div>
          <div>
            <dt className="text-ink/60">العنوان</dt>
            <dd>{order.city} — {order.address}</dd>
          </div>
        </dl>
        <ul className="mt-8 space-y-3 border-t border-ink/10 pt-6">
          {order.items.map((item, index) => (
            <li key={`${item.nameAr}-${index}`} className="flex justify-between gap-4 text-sm">
              <span>{item.nameAr} · {item.detail} × {item.quantity}</span>
              <span dir="ltr">{formatPrice(item.unitPriceSar * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-ink/10 pt-6 text-sm">
          <p>التغليف: {order.giftWrap ? "تغليف هدية" : "بدون تغليف هدية"}</p>
          <p>بطاقة الهدية: {order.giftMessage || "بدون بطاقة"}</p>
          <p className="flex justify-between">
            <span>المجموع</span>
            <span dir="ltr">{formatPrice(order.totalSar)}</span>
          </p>
        </div>
      </article>
    </div>
  );
}
