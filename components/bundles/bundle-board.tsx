"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { availableSets, comparePriceSar, savingsSar } from "@/lib/catalog/bundles";
import type { BundleOffer } from "@/lib/catalog/bundles";
import { formatPrice, formatSize } from "@/lib/catalog/money";

type BundleBoardProps = {
  bundles: BundleOffer[];
};

export function BundleBoard({ bundles }: BundleBoardProps) {
  const { addBundleItem } = useCart();
  if (bundles.length === 0) {
    return (
      <div className="mt-4 border-t border-border pt-10">
        <p className="font-arabic-display text-3xl text-ivory md:text-4xl">لا توجد عروض باندل منشورة الآن</p>
        <p className="mt-4 max-w-xl leading-8 text-mist">
          يظهر العرض هنا فقط إذا كان منشورًا، مكتمل الأجزاء، وسعره أقل من مجموع أسعار الزجاجات الحالية.
        </p>
        <Link href="/catalog" className="mt-6 inline-flex min-h-11 items-center text-brass">
          تصفّح العطور منفردة
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-4 grid gap-8 lg:grid-cols-2">
      {bundles.map((bundle) => {
        const sets = availableSets(bundle.stockCount, bundle.parts);
        const compare = comparePriceSar(bundle.parts);
        const savings = savingsSar(bundle.priceSar, bundle.parts);
        const canOrder = sets > 0 && savings > 0;
        return (
          <article key={bundle.id} className="flex flex-col border border-border bg-ivory p-6 text-ink md:p-8">
            <p className="text-sm text-brass">عرض باندل</p>
            <h3 className="mt-3 font-arabic-display text-4xl leading-tight">{bundle.nameAr}</h3>
            <p className="mt-1 font-display text-2xl italic text-ink/75">{bundle.nameEn}</p>
            {bundle.descriptionAr.trim() ? (
              <p className="mt-4 leading-8 text-ink/75">{bundle.descriptionAr}</p>
            ) : null}
            <ul className="mt-6 space-y-4 border-y border-ink/10 py-5">
              {bundle.parts.map((part) => (
                <li key={`${part.productId}-${part.sizeMl}`} className="flex items-baseline justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/catalog/${part.slug}`}
                      className="font-arabic-display text-2xl transition-colors hover:text-seal"
                    >
                      {part.nameAr}
                    </Link>
                    <p className="mt-1 text-sm text-ink/70">
                      {formatSize(part.sizeMl)}
                      {part.quantity > 1 ? ` × ${part.quantity}` : ""}
                    </p>
                  </div>
                  <span dir="ltr" className="shrink-0 tabular-nums text-sm">
                    {formatPrice(part.unitPriceSar * part.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2 text-sm">
              <p className="flex justify-between gap-3">
                <span className="text-ink/70">مجموع الزجاجات منفردة</span>
                <span dir="ltr" className="tabular-nums">
                  {formatPrice(compare)}
                </span>
              </p>
              {savings > 0 ? (
                <p className="flex justify-between gap-3">
                  <span className="text-ink/70">الفرق عن الشراء المنفرد</span>
                  <span dir="ltr" className="tabular-nums">
                    {formatPrice(savings)}
                  </span>
                </p>
              ) : null}
            </div>
            <p dir="ltr" className="mt-5 w-fit font-display text-5xl">
              {formatPrice(bundle.priceSar)}
            </p>
            <p className="mt-2 text-sm text-ink/70">{canOrder ? "العرض متاح الآن" : "نفد العرض"}</p>
            <button
              type="button"
              disabled={!canOrder}
              onClick={() => addBundleItem({ bundleId: bundle.id })}
              className="pressable mt-6 h-12 bg-seal px-6 text-sm text-ivory disabled:opacity-40"
            >
              {canOrder ? "أضف العرض إلى الحقيبة" : "نفد العرض"}
            </button>
          </article>
        );
      })}
    </div>
  );
}
