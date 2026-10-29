import Link from "next/link";
import { Suspense } from "react";
import { AdminFallback } from "@/components/admin/admin-fallback";
import { formatPrice } from "@/lib/catalog/money";
import { lowStockThreshold } from "@/lib/catalog/stock";
import { getAdminAnalytics } from "@/lib/db/analytics";
import type { AdminAnalytics } from "@/lib/db/analytics";
import { orderStatusLabels } from "@/lib/orders/status";

export default function AdminHomePage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const analytics = await getAdminAnalytics();
  return (
    <div>
      <h1 className="font-arabic-display text-5xl">نظرة عامة</h1>
        <p className="mt-3 max-w-xl leading-8 text-mist">
          قيمة الطلبات لا تحسب الملغي والمرتجع. المحصّل هو ما تم تسليمه والدفع عند الاستلام.
        </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="قيمة الطلبات" value={formatPrice(analytics.revenueSar)} />
        <Stat label="المحصّل عند التسليم" value={formatPrice(analytics.deliveredRevenueSar)} />
        <Stat label="الطلبات" value={String(analytics.orderCount)} />
        <Stat label="العطور" value={String(analytics.productCount)} />
      </div>
      <section className="mt-10">
        <h2 className="font-arabic-display text-3xl">حسب الحالة</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {analytics.statuses.map((status) => (
            <article key={status.status} className="border border-white/10 bg-panel px-5 py-6">
              <p className="text-sm text-mist">{orderStatusLabels[status.status]}</p>
              <p className="mt-3 font-display text-4xl text-gold-bright">{status.count}</p>
              <p className="mt-2 text-sm text-cream/80" dir="ltr">{formatPrice(status.revenueSar)}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <PerfumeSales analytics={analytics} />
        <SizeSales analytics={analytics} />
        <LowStock analytics={analytics} />
      </div>
      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/admin/products" className="text-gold">إدارة العطور</Link>
        <Link href="/admin/orders" className="text-gold">الطلبات</Link>
      </div>
    </div>
  );
}

type AnalyticsProps = {
  analytics: AdminAnalytics;
};

function PerfumeSales({ analytics }: AnalyticsProps) {
  return (
    <section className="border border-white/10 bg-panel px-5 py-6">
      <h2 className="font-arabic-display text-3xl">العطور الأكثر مبيعًا</h2>
      {analytics.bestPerfumes.length === 0 ? (
        <p className="mt-4 text-sm text-mist">لا مبيعات للعطور بعد.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {analytics.bestPerfumes.map((perfume) => (
            <li key={perfume.nameAr} className="flex items-center justify-between gap-4 text-sm">
              <span>{perfume.nameAr}</span>
              <span dir="ltr">{perfume.units}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SizeSales({ analytics }: AnalyticsProps) {
  return (
    <section className="border border-white/10 bg-panel px-5 py-6">
      <h2 className="font-arabic-display text-3xl">الأحجام الأكثر مبيعًا</h2>
      {analytics.bestSizes.length === 0 ? (
        <p className="mt-4 text-sm text-mist">لا مبيعات للأحجام بعد.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {analytics.bestSizes.map((size) => (
            <li key={size.sizeMl} className="flex items-center justify-between gap-4 text-sm">
              <span>{size.sizeMl === 2 ? "2 مل · عيّنة" : `${size.sizeMl} مل`}</span>
              <span dir="ltr">{size.units}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function LowStock({ analytics }: AnalyticsProps) {
  return (
    <section className="border border-white/10 bg-panel px-5 py-6">
      <h2 className="font-arabic-display text-3xl">تنبيهات المخزون</h2>
      <p className="mt-2 text-sm text-mist">يظهر ما تبقى منه {lowStockThreshold} أو أقل وما زال معروضًا.</p>
      {analytics.lowStock.length === 0 ? (
        <p className="mt-4 text-sm text-mist">المخزون فوق حد التنبيه.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {analytics.lowStock.map((alert) => (
            <li key={`${alert.href}-${alert.label}`}>
              <Link href={alert.href} className="flex items-center justify-between gap-4 text-sm text-gold">
                <span>{alert.label}</span>
                <span dir="ltr">{alert.stockCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type StatProps = {
  label: string;
  value: string;
};

function Stat({ label, value }: StatProps) {
  return (
    <article className="border border-white/10 bg-panel px-5 py-6">
      <p className="text-sm text-mist">{label}</p>
      <p className="mt-3 font-display text-4xl text-gold-bright">{value}</p>
    </article>
  );
}
