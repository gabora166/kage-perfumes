"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Banknote, FlaskConical, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { BrandSeal } from "@/components/brand/brand-seal";
import { useCart } from "@/components/cart/cart-provider";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { brand, collectionForFamily } from "@/lib/brand";
import { familyLabels } from "@/lib/catalog/labels";
import { formatPrice, formatSize } from "@/lib/catalog/money";
import { isSampleListed, isSamplePurchasable } from "@/lib/catalog/samples";
import { bottleSizeStories } from "@/lib/catalog/story";
import type { BottleSize, Product } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { kageDuration, kageEase, kageEaseStamp } from "@/lib/motion/tokens";
import { reviewCountLabel } from "@/lib/reviews/voice";
import type { ReviewSummary } from "@/lib/reviews/voice";
import {
  complimentaryTesterCopy,
  mansouraShippingCopy,
  refundGuaranteeCopy,
  trustPolicyPaths,
} from "@/lib/trust/offers";

type ProductPurchaseProps = {
  product: Product;
  reviewSummary: ReviewSummary | null;
};

type AddFeedback = "idle" | "added" | "sample";

export function ProductPurchase({ product, reviewSummary }: ProductPurchaseProps) {
  const { addCatalogItem, addSampleItem, openCart } = useCart();
  const purchaseBlockRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const priceRegionId = useId();
  const [size, setSize] = useState<BottleSize>(firstAvailableSize(product));
  const [showBar, setShowBar] = useState(false);
  const [feedback, setFeedback] = useState<AddFeedback>("idle");
  const offer = product.offers.find((entry) => entry.sizeMl === size) ?? product.offers[0];
  const isSoldOut = offer.stockCount < 1;
  const story = bottleSizeStories[size];
  const collection = collectionForFamily(product.family);
  const family = familyLabels[product.family];
  const sampleListed = isSampleListed(product.sample);
  const sampleAvailable = isSamplePurchasable(product.sample);

  useEffect(() => {
    const node = purchaseBlockRef.current;
    if (!node) return undefined;
    const visibility = { purchase: true, footer: false };
    const update = (): void => setShowBar(!visibility.purchase && !visibility.footer);
    const purchaseObserver = new IntersectionObserver(
      ([entry]) => {
        visibility.purchase = entry.isIntersecting;
        update();
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    purchaseObserver.observe(node);
    const footer = document.querySelector("footer");
    const footerObserver = footer
      ? new IntersectionObserver(([entry]) => {
          visibility.footer = entry.isIntersecting;
          update();
        })
      : null;
    if (footer) footerObserver?.observe(footer);
    return () => {
      purchaseObserver.disconnect();
      footerObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (feedback === "idle") return undefined;
    const timer = window.setTimeout(() => setFeedback("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  function addBottle(): void {
    if (isSoldOut || feedback === "added") return;
    addCatalogItem({ productId: product.id, sizeMl: size });
    setFeedback("added");
  }

  function addSample(): void {
    if (!sampleListed || !sampleAvailable || feedback === "sample") return;
    addSampleItem({ productId: product.id });
    setFeedback("sample");
  }

  const addLabel =
    feedback === "added"
      ? "أُضيفت إلى الحقيبة"
      : isSoldOut
        ? "نفد هذا الحجم"
        : `أضف ${formatSize(offer.sizeMl)} إلى الحقيبة`;

  return (
    <>
      <div className="flex flex-col gap-7 md:grid md:grid-cols-12 md:items-start md:gap-x-8 md:gap-y-0 lg:gap-x-12">
        <div className="md:col-span-5 md:col-start-1 md:row-start-1 lg:col-span-5">
          <ProductIdentity
            product={product}
            family={family}
            collectionLabel={
              collection ? `${collection.nameEn} · ${collection.nameAr}` : `${family.ar} · ${family.en}`
            }
          />
        </div>

        <div className="md:col-span-7 md:col-start-6 md:row-span-2 lg:col-span-7">
          <ProductGallery product={product} />
        </div>

        <div className="md:col-span-5 md:col-start-1 md:row-start-2 lg:col-span-5">
          <div className="border-t border-border pt-6 md:pt-7">
            <div ref={purchaseBlockRef}>
              <SizeChoices product={product} size={size} onChoose={setSize} />
              {story.title.trim() ? (
                <p className="mt-3 text-sm leading-7 text-mist">{story.title}</p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2" aria-live="polite" id={priceRegionId}>
                <div className="relative min-h-[3.25rem] overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={`${offer.sizeMl}-${offer.priceSar}`}
                      dir="ltr"
                      className="font-display text-5xl tabular-nums leading-none text-ivory md:text-6xl"
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: kageDuration.instant, ease: kageEase }}
                    >
                      {formatPrice(offer.priceSar)}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <p className="pb-1 text-sm text-mist">{formatSize(offer.sizeMl)}</p>
              </div>
              <p className={cn("mt-2 text-sm", isSoldOut ? "text-seal" : "text-mist")}>
                {isSoldOut ? "هذا الحجم غير متوفر حاليًا." : "هذا الحجم متوفر للطلب."}
              </p>

              <div className="mt-7 flex flex-col gap-3">
                <motion.button
                  type="button"
                  disabled={isSoldOut}
                  onClick={addBottle}
                  aria-describedby={priceRegionId}
                  whileTap={prefersReducedMotion || isSoldOut ? undefined : { scale: 0.985 }}
                  transition={{ duration: kageDuration.instant, ease: kageEaseStamp }}
                  className={cn(
                    "pressable relative h-12 overflow-hidden px-8 text-sm text-ivory transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                    feedback === "added" ? "bg-panel ring-1 ring-seal" : "cta-shine bg-seal",
                  )}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {feedback === "added" ? <BrandSeal size={18} /> : null}
                    {addLabel}
                  </span>
                </motion.button>
                {sampleListed && product.sample ? (
                  <button
                    type="button"
                    disabled={!sampleAvailable}
                    onClick={addSample}
                    className="pressable h-12 border border-border px-8 text-sm text-mist transition-colors hover:border-brass hover:text-ivory disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {feedback === "sample"
                      ? "أُضيفت العيّنة إلى الحقيبة"
                      : sampleAvailable
                        ? `عيّنة 2 مل · ${formatPrice(product.sample.priceSar)}`
                        : "نفدت عيّنة 2 مل"}
                  </button>
                ) : null}
              </div>
            </div>

            <p className="mt-4 min-h-6 text-sm text-brass" role="status" aria-live="polite">
              {feedback === "added" ? (
                <>
                  أُضيفت {product.nameAr}، {formatSize(size)}، إلى الحقيبة.{" "}
                  <button type="button" onClick={openCart} className="underline underline-offset-4">
                    افتح الحقيبة
                  </button>
                </>
              ) : null}
              {feedback === "sample" ? (
                <>
                  أُضيفت عيّنة {product.nameAr} إلى الحقيبة.{" "}
                  <button type="button" onClick={openCart} className="underline underline-offset-4">
                    افتح الحقيبة
                  </button>
                </>
              ) : null}
            </p>

            <PurchaseConfidence />

            {reviewSummary ? (
              <a
                href="#voices"
                className="mt-6 inline-flex min-h-11 items-center border-t border-border pt-5 text-sm text-mist transition-colors hover:text-brass"
              >
                {reviewCountLabel(reviewSummary.count)} وصل الدار، دون ربط بطلب.
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showBar ? (
          <motion.div
            key="sticky-purchase"
            initial={prefersReducedMotion ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ duration: kageDuration.press, ease: kageEase }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-panel/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
          >
            <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-ivory">{product.nameAr}</p>
                <p className="text-sm text-mist" aria-live="polite">
                  {formatSize(offer.sizeMl)}
                  <span dir="ltr" className="ms-2 inline-block font-display text-xl tabular-nums text-ivory">
                    {formatPrice(offer.priceSar)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                disabled={isSoldOut}
                onClick={addBottle}
                className="pressable h-12 shrink-0 bg-seal px-5 text-sm text-ivory disabled:opacity-40"
              >
                {feedback === "added" ? "أُضيفت" : isSoldOut ? "نفد" : "أضف"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

type IdentityProps = {
  product: Product;
  family: { ar: string; en: string };
  collectionLabel: string;
};

function ProductIdentity({ product, family, collectionLabel }: IdentityProps) {
  return (
    <header>
      <div className="flex flex-wrap items-center gap-3">
        <BrandSeal size={24} />
        <p className="text-[0.7rem] tracking-[0.18em] text-brass uppercase">{collectionLabel}</p>
      </div>
      <p className="mt-4 text-sm text-mist">
        {family.ar}
        <span className="mx-2 text-border" aria-hidden="true">
          ·
        </span>
        <span className="font-display italic">{family.en}</span>
      </p>
      <h1 className="mt-2 font-arabic-display text-[2.5rem] leading-[1.15] text-ivory sm:text-5xl md:text-[3.15rem] lg:text-[3.5rem]">
        {product.nameAr}
      </h1>
      <p className="mt-1.5 font-display text-xl italic text-mist md:text-2xl">{product.nameEn}</p>
      {product.descriptionAr.trim() ? (
        <p className="mt-4 max-w-md text-[0.95rem] leading-7 text-mist">{product.descriptionAr}</p>
      ) : null}
    </header>
  );
}

function PurchaseConfidence() {
  return (
    <div className="mt-7 space-y-5 border-t border-border pt-5">
      <p className="text-[0.7rem] tracking-[0.18em] text-brass uppercase">Trust</p>
      <ul className="space-y-3">
        <li className="flex gap-3 text-sm leading-7 text-mist">
          <Truck className="mt-1 size-4 shrink-0 text-brass" aria-hidden="true" strokeWidth={1.5} />
          <span>
            {mansouraShippingCopy.general}{" "}
            <Link href={trustPolicyPaths.delivery} className="text-brass underline-offset-4 hover:underline">
              صفحة التوصيل
            </Link>
            . يُؤكَّد تطبيق الشحن المجاني عند كتابة عنوان داخل المنصورة في الطلب.
          </span>
        </li>
        <li className="flex gap-3 text-sm leading-7 text-mist">
          <FlaskConical className="mt-1 size-4 shrink-0 text-brass" aria-hidden="true" strokeWidth={1.5} />
          <span>{complimentaryTesterCopy.detail}</span>
        </li>
        <li className="flex gap-3 text-sm leading-7 text-mist">
          <ShieldCheck className="mt-1 size-4 shrink-0 text-brass" aria-hidden="true" strokeWidth={1.5} />
          <span>
            {refundGuaranteeCopy.short}{" "}
            <Link href={trustPolicyPaths.returns} className="text-brass underline-offset-4 hover:underline">
              الشروط كاملة
            </Link>
            .
          </span>
        </li>
        <li className="flex gap-3 text-sm leading-7 text-mist">
          <Banknote className="mt-1 size-4 shrink-0 text-brass" aria-hidden="true" strokeWidth={1.5} />
          <span>
            الدفع عند الاستلام نقدًا بالجنيه.{" "}
            <Link href={trustPolicyPaths.cod} className="text-brass underline-offset-4 hover:underline">
              تفاصيل الدفع
            </Link>
          </span>
        </li>
      </ul>
      <div className="border border-border/80 bg-panel/40 px-4 py-4">
        <p className="text-sm text-brass">طلب الاسترداد — باختصار</p>
        <ol className="mt-3 list-decimal space-y-2 pe-5 text-sm leading-7 text-mist">
          {refundGuaranteeCopy.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-3 text-sm leading-7 text-mist">
          المدة والاستثناءات مكتوبة فقط في{" "}
          <Link href={trustPolicyPaths.returns} className="text-brass underline-offset-4 hover:underline">
            سياسة الإرجاع
          </Link>
          . للاستفسار:{" "}
          <a href={`mailto:${brand.email}`} className="text-brass underline-offset-4 hover:underline" dir="ltr">
            {brand.email}
          </a>
        </p>
      </div>
    </div>
  );
}

type SizeChoicesProps = {
  product: Product;
  size: BottleSize;
  onChoose: (size: BottleSize) => void;
};

function SizeChoices({ product, size, onChoose }: SizeChoicesProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div role="radiogroup" aria-label="حجم الزجاجة">
      <p className="text-sm text-brass">اختر الحجم</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {product.offers.map((entry) => {
          const isActive = entry.sizeMl === size;
          const isEmpty = entry.stockCount < 1;
          return (
            <button
              key={entry.sizeMl}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={isEmpty}
              onClick={() => onChoose(entry.sizeMl)}
              className={cn(
                "relative flex min-h-[4.75rem] flex-col items-start justify-center border px-3.5 py-3 text-start transition-[border-color,background-color] duration-200 disabled:cursor-not-allowed disabled:opacity-40",
                isActive
                  ? "border-seal bg-seal/15 text-ivory ring-1 ring-inset ring-seal"
                  : "border-border bg-transparent text-ivory hover:border-brass",
              )}
            >
              {isActive && !prefersReducedMotion ? (
                <motion.span
                  layoutId="size-indicator"
                  className="absolute inset-y-0 start-0 w-0.5 bg-seal"
                  aria-hidden="true"
                  transition={{ duration: kageDuration.press, ease: kageEase }}
                />
              ) : isActive ? (
                <span className="absolute inset-y-0 start-0 w-0.5 bg-seal" aria-hidden="true" />
              ) : null}
              <span className="text-sm font-medium">{formatSize(entry.sizeMl)}</span>
              <span dir="ltr" className="mt-1 font-display text-lg tabular-nums text-ivory/90">
                {formatPrice(entry.priceSar)}
              </span>
              {isEmpty ? <span className="mt-1 text-xs text-mist">نفدت</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function firstAvailableSize(product: Product): BottleSize {
  return product.offers.find((entry) => entry.stockCount > 0)?.sizeMl ?? product.offers[0].sizeMl;
}
