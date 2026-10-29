"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { ProductVisual } from "@/components/catalog/product-visual";
import { cardImageSizes } from "@/lib/catalog/images";
import { familyLabels } from "@/lib/catalog/labels";
import { formatPrice } from "@/lib/catalog/money";
import { isSampleListed, isSamplePurchasable, sampleSizeMl } from "@/lib/catalog/samples";
import type { DiscoverySet } from "@/lib/catalog/samples";
import type { Product } from "@/lib/catalog/types";

type DiscoveryShopProps = {
  products: Product[];
  discoverySet: DiscoverySet | null;
};

export function DiscoveryShop({ products, discoverySet }: DiscoveryShopProps) {
  const { addSampleItem, addDiscoveryItem } = useCart();
  const samples = products.filter((product) => isSampleListed(product.sample));
  const slugById = new Map(products.map((product) => [product.id, product.slug]));
  const setPublished = discoverySet?.isPublished === true;
  const canOrderSet = Boolean(
    setPublished && discoverySet && discoverySet.stockCount > 0 && discoverySet.vials.length >= 2,
  );
  return (
    <div className="space-y-16">
      {setPublished && discoverySet ? (
        <section className="grid gap-10 border-t border-border pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14">
          <div>
            <p className="text-sm text-brass">تجربة قبل الزجاجة</p>
            <h2 className="mt-3 font-arabic-display text-4xl leading-tight text-ivory md:text-5xl">
              {discoverySet.nameAr}
            </h2>
            <p className="mt-2 font-display text-2xl italic text-mist">{discoverySet.nameEn}</p>
            <p className="mt-5 max-w-xl leading-8 text-mist">
              قارورة {sampleSizeMl} مل من كل عطر له عيّنة منشورة في الدار. تُجرَّب على الجلد قبل اختيار حجم الزجاجة،
              ومخزون المجموعة مستقل عن عيّنات العطور المفردة.
            </p>
            <p className="mt-4 text-sm text-mist">
              المحتوى · {discoverySet.vials.length} قوارير × {sampleSizeMl} مل
            </p>
            <ul className="mt-6 space-y-3 border-t border-border pt-5">
              {discoverySet.vials.map((vial) => {
                const slug = slugById.get(vial.productId) ?? vial.productId;
                return (
                  <li key={vial.productId} className="flex items-baseline justify-between gap-4">
                    <Link href={`/catalog/${slug}`} className="font-arabic-display text-2xl text-ivory transition-colors hover:text-brass">
                      {vial.nameAr}
                    </Link>
                    <span className="text-sm text-mist">{sampleSizeMl} مل</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="bg-ivory px-6 py-8 text-ink md:px-8">
            <p className="text-sm text-brass">سعر المجموعة</p>
            <p dir="ltr" className="mt-3 w-fit font-display text-5xl">
              {formatPrice(discoverySet.priceSar)}
            </p>
            <p className="mt-3 text-sm leading-7 text-mist">
              {canOrderSet ? "المجموعة متاحة الآن." : "نفدت المجموعة حاليًا."}
            </p>
            <button
              type="button"
              disabled={!canOrderSet}
              onClick={addDiscoveryItem}
              className="pressable mt-6 h-12 w-full bg-seal px-8 text-sm text-ivory disabled:opacity-40"
            >
              {canOrderSet ? "أضف المجموعة إلى الحقيبة" : "نفدت مجموعة الاكتشاف"}
            </button>
            <p className="mt-4 text-sm leading-7 text-mist">
              يمكنك أيضًا شراء عيّنة واحدة من القائمة أدناه.
            </p>
          </div>
        </section>
      ) : (
        <section className="border-t border-border pt-10">
          <p className="font-arabic-display text-3xl text-ivory">مجموعة الاكتشاف غير منشورة الآن</p>
          <p className="mt-3 max-w-xl leading-8 text-mist">
            عيّنات {sampleSizeMl} مل تبقى متاحة لكل عطر منشور له مخزون عيّنة، من الصفحة أدناه أو من صفحة العطر.
          </p>
        </section>
      )}

      <section>
        <p className="text-sm text-brass">عيّنات مفردة</p>
        <h2 className="mt-3 font-arabic-display text-4xl text-ivory md:text-5xl">عيّنات {sampleSizeMl} مل</h2>
        <p className="mt-4 max-w-xl leading-8 text-mist">
          كل عيّنة مرتبطة بعطر منشور. السعر والمخزون كما تحفظهما الدار.
        </p>
        {samples.length === 0 ? (
          <p className="mt-8 text-mist">لا عيّنات منشورة الآن.</p>
        ) : (
          <ul className="mt-10 grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
            {samples.map((product) => {
              const sampleReady = isSamplePurchasable(product.sample);
              return (
                <li key={product.id}>
                  <article className="flex h-full flex-col">
                    <Link href={`/catalog/${product.slug}`} className="block">
                      <ProductVisual
                        product={product}
                        sizes={cardImageSizes}
                        ratio="stage"
                        showBadge={!product.images.bottle}
                      />
                    </Link>
                    <div className="flex flex-1 flex-col pt-5">
                      <p className="text-sm text-brass">
                        {familyLabels[product.family].ar} · {sampleSizeMl} مل
                      </p>
                      <h3 className="mt-2 font-arabic-display text-3xl text-ivory">
                        <Link href={`/catalog/${product.slug}`}>{product.nameAr}</Link>
                      </h3>
                      <p className="mt-1 font-display text-xl italic text-mist">{product.nameEn}</p>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          disabled={!sampleReady}
                          onClick={() => addSampleItem({ productId: product.id })}
                          className="pressable inline-flex h-11 items-center bg-seal px-4 text-sm text-ivory disabled:opacity-40"
                        >
                          {sampleReady && product.sample
                            ? `أضف العيّنة · ${formatPrice(product.sample.priceSar)}`
                            : "نفدت العيّنة"}
                        </button>
                        <Link
                          href={`/catalog/${product.slug}`}
                          className="inline-flex h-11 items-center text-sm text-brass"
                        >
                          الزجاجة الكاملة
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
