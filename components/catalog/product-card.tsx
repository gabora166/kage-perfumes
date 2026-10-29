"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandSeal } from "@/components/brand/brand-seal";
import { useCart } from "@/components/cart/cart-provider";
import { ProductVisual } from "@/components/catalog/product-visual";
import { collectionForFamily } from "@/lib/brand";
import { matchingOffer } from "@/lib/catalog/filters";
import type { PriceFilter } from "@/lib/catalog/filters";
import { cardImageSizes } from "@/lib/catalog/images";
import { familyLabels } from "@/lib/catalog/labels";
import { formatPrice, formatSize } from "@/lib/catalog/money";
import { isSampleListed, isSamplePurchasable } from "@/lib/catalog/samples";
import { splitNotes } from "@/lib/catalog/story";
import type { BottleSize, Product, ProductOffer, SizeFilter } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { kageDuration, kageEase } from "@/lib/motion/tokens";

type ProductCardProps = {
  product: Product;
  size?: SizeFilter;
  price?: PriceFilter;
  /** light = ivory editorial panels; dark = Obsidian catalog */
  tone?: "light" | "dark";
  /** catalog = bordered reference card; editorial = home featured treatment */
  layout?: "catalog" | "editorial";
};

export function ProductCard({
  product,
  size = "all",
  price = "all",
  tone = "light",
  layout = "editorial",
}: ProductCardProps) {
  const { addCatalogItem, addSampleItem } = useCart();
  const prefersReducedMotion = useReducedMotion();
  const listedOffers = product.offers.filter((offer) => offer.isListed);
  const filterOffer = matchingOffer(product, size, price);
  const selectable = listedOffers.filter((offer) => offerMatchesFilters(offer, size, price));
  const preferredSize = resolveInitialSize(selectable, filterOffer, size);
  const [pickedSize, setPickedSize] = useState<BottleSize | null>(null);
  const [addedLabel, setAddedLabel] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const selectedSize =
    pickedSize !== null && selectable.some((entry) => entry.sizeMl === pickedSize)
      ? pickedSize
      : preferredSize;
  const offer =
    selectable.find((entry) => entry.sizeMl === selectedSize) ??
    filterOffer ??
    selectable.find((entry) => entry.stockCount > 0) ??
    selectable[0];
  const canAdd = Boolean(offer && offer.stockCount > 0);
  const topNotes = splitNotes(product.notes.top);
  const openingNote = topNotes[0];
  const notesLine = topNotes.slice(0, 3).join("، ");
  const label = familyLabels[product.family];
  const collection = collectionForFamily(product.family);
  const sampleListed = isSampleListed(product.sample);
  const sampleReady = isSamplePurchasable(product.sample);
  const isLight = tone === "light";
  const isCatalog = layout === "catalog";
  const showSizePicker = selectable.length > 1;

  useEffect(() => {
    if (!addedLabel) return undefined;
    const timer = window.setTimeout(() => setAddedLabel(""), 2200);
    return () => window.clearTimeout(timer);
  }, [addedLabel]);

  function handleAddBottle(): void {
    if (!offer || !canAdd || isAdding) return;
    setIsAdding(true);
    addCatalogItem({ productId: product.id, sizeMl: offer.sizeMl });
    setAddedLabel(`أُضيف ${formatSize(offer.sizeMl)}`);
    window.setTimeout(() => setIsAdding(false), 450);
  }

  function handleAddSample(): void {
    if (!sampleListed || !sampleReady || isAdding) return;
    setIsAdding(true);
    addSampleItem({ productId: product.id });
    setAddedLabel("أُضيفت العيّنة");
    window.setTimeout(() => setIsAdding(false), 450);
  }

  if (isCatalog) {
    return (
      <article className="catalog-card card-lift group flex h-full flex-col overflow-hidden rounded-[4px] border border-ivory/14 bg-ink/90 text-ivory">
        <Link
          href={`/catalog/${product.slug}`}
          className="relative block overflow-hidden outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-seal"
        >
          <div className="card-media">
            <ProductVisual
              product={product}
              sizes={cardImageSizes}
              ratio="card"
              inset={product.images.bottle ? "padded" : "flush"}
              fallback="stage"
              showBadge={false}
            />
          </div>
          {collection ? (
            <span className="pointer-events-none absolute top-3 start-3 z-[2] font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ivory/90">
              {collection.nameEn}
            </span>
          ) : null}
        </Link>

        <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3.5 text-center md:px-4">
          <p className="text-[0.7rem] text-mist">
            {collection ? `${collection.nameAr} - ${label.ar}` : label.ar}
          </p>
          <h3 className="mt-1 font-arabic-display text-[1.55rem] leading-tight text-ivory md:text-[1.7rem]">
            <Link href={`/catalog/${product.slug}`} className="transition-colors hover:text-brass">
              {product.nameAr}
            </Link>
          </h3>
          <p className="mt-0.5 font-display text-[0.95rem] italic text-mist md:text-base">{product.nameEn}</p>
          {notesLine ? <p className="mt-1.5 text-[0.68rem] text-mist/85">المقدمة : {notesLine}</p> : null}

          {selectable.length > 0 ? (
            <div
              className="mt-3 flex flex-wrap justify-center gap-1.5"
              role="group"
              aria-label={`حجم ${product.nameAr}`}
            >
              {selectable.map((entry) => {
                const isActive = entry.sizeMl === selectedSize;
                const isEmpty = entry.stockCount < 1;
                return (
                  <button
                    key={entry.sizeMl}
                    type="button"
                    aria-pressed={isActive}
                    disabled={isEmpty}
                    onClick={() => setPickedSize(entry.sizeMl)}
                    className={cn(
                      "pressable inline-flex h-10 w-[5.65rem] shrink-0 flex-col items-center justify-center rounded-[3px] border px-1 text-[0.65rem] leading-tight disabled:cursor-not-allowed disabled:opacity-40",
                      isActive
                        ? "border-seal bg-seal text-ivory"
                        : "border-ivory/18 text-ivory hover:border-brass",
                    )}
                  >
                    <span>{formatSize(entry.sizeMl)}</span>
                    <span dir="ltr" className="mt-0.5 tabular-nums opacity-85">
                      {formatPrice(entry.priceSar)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="mt-auto border-t border-ivory/12 pt-3">
            <div className="flex items-stretch gap-2">
              {canAdd && offer ? (
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={handleAddBottle}
                  className="pressable inline-flex h-10 min-w-0 flex-[1.45] items-center justify-center gap-1.5 rounded-[3px] bg-seal px-2.5 text-sm text-ivory disabled:opacity-60"
                >
                  <ShoppingBag className="size-3.5 shrink-0" aria-hidden="true" strokeWidth={1.5} />
                  <span>{isAdding ? "..." : "أضف إلى السلة"}</span>
                </button>
              ) : (
                <span className="inline-flex h-10 flex-[1.45] items-center justify-center rounded-[3px] border border-ivory/10 px-2.5 text-sm text-mist">
                  نفدت الأحجام
                </span>
              )}
              <Link
                href={`/catalog/${product.slug}`}
                className="inline-flex h-10 min-w-[5rem] flex-1 items-center justify-center rounded-[3px] border border-ivory/18 px-2.5 text-sm text-mist transition-colors hover:border-brass hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal"
              >
                التفاصيل
              </Link>
            </div>
            {sampleListed && product.sample ? (
              <button
                type="button"
                disabled={isAdding || !sampleReady}
                onClick={handleAddSample}
                className="pressable mt-2 inline-flex min-h-8 w-full items-center justify-center text-xs text-brass transition-colors hover:text-ivory disabled:opacity-60"
              >
                {sampleReady ? `عيّنة · ${formatPrice(product.sample.priceSar)}` : "نفدت العيّنة"}
              </button>
            ) : null}
            <p className="mt-1.5 min-h-4 text-xs text-brass" role="status" aria-live="polite">
              {addedLabel}
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("card-lift border-draw group flex h-full flex-col", isLight ? "text-ink" : "text-ivory")}>
      <Link
        href={`/catalog/${product.slug}`}
        className="relative block overflow-hidden border border-transparent outline-offset-4 transition-[border-color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-seal group-hover:border-border/80"
      >
        <div className="card-media">
          <ProductVisual product={product} sizes={cardImageSizes} ratio="stage" showBadge={!product.images.bottle} />
        </div>
        <BrandSeal size={22} className="pointer-events-none absolute bottom-3 end-3 opacity-90" />
        {collection ? (
          <span
            className={cn(
              "pointer-events-none absolute top-3 start-3 z-[2] px-2 py-1 font-sans text-[0.62rem] uppercase tracking-[0.28em]",
              isLight ? "bg-ink/55 text-ivory" : "bg-ink/70 text-brass",
            )}
          >
            {collection.nameEn}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col pt-5">
        <p className={cn("text-sm", isLight ? "text-bronze" : "text-brass")}>
          {collection ? `${collection.nameAr} · ${label.ar}` : label.ar}
        </p>
        <h3 className={cn("mt-2 font-arabic-display text-[1.85rem] leading-tight md:text-[2.15rem]", isLight ? "text-ink" : "text-ivory")}>
          <Link href={`/catalog/${product.slug}`} className="transition-colors hover:text-seal">
            {product.nameAr}
          </Link>
        </h3>
        <p className={cn("mt-1 font-display text-lg italic md:text-xl", isLight ? "text-ink/75" : "text-mist")}>
          {product.nameEn}
        </p>
        {openingNote ? (
          <p className={cn("mt-3 text-sm", isLight ? "text-ink/70" : "text-mist")}>المقدمة · {openingNote}</p>
        ) : null}

        {showSizePicker && size === "all" ? (
          <div className="mt-4" role="group" aria-label={`حجم ${product.nameAr}`}>
            <div className="flex flex-wrap gap-2">
              {selectable.map((entry) => {
                const isActive = entry.sizeMl === selectedSize;
                const isEmpty = entry.stockCount < 1;
                return (
                  <button
                    key={entry.sizeMl}
                    type="button"
                    aria-pressed={isActive}
                    disabled={isEmpty}
                    onClick={() => setPickedSize(entry.sizeMl)}
                    className={cn(
                      "pressable inline-flex min-h-10 min-w-[3.75rem] flex-col items-center justify-center border px-2.5 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40",
                      isActive
                        ? "border-seal bg-seal text-ivory"
                        : isLight
                          ? "border-ink/25 text-ink hover:border-ink"
                          : "border-border text-ivory hover:border-brass",
                    )}
                  >
                    <span>{formatSize(entry.sizeMl)}</span>
                    <span dir="ltr" className="mt-0.5 tabular-nums opacity-80">
                      {formatPrice(entry.priceSar)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-auto pt-4">
          <div className={cn("flex items-end justify-between gap-4 border-t pt-4", isLight ? "border-ink/10" : "border-border")}>
            {offer && canAdd ? (
              <>
                <p className={cn("text-sm", isLight ? "text-ink/70" : "text-mist")}>
                  {size === "all" && price === "all" && !(showSizePicker && size === "all")
                    ? `من ${formatSize(offer.sizeMl)}`
                    : formatSize(offer.sizeMl)}
                </p>
                <div className="relative min-h-[2.25rem] overflow-hidden" aria-live="polite">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={`${offer.sizeMl}-${offer.priceSar}`}
                      dir="ltr"
                      className={cn(
                        "font-display text-3xl tabular-nums md:text-4xl",
                        isLight ? "text-ink" : "text-ivory",
                      )}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: kageDuration.micro, ease: kageEase }}
                    >
                      {formatPrice(offer.priceSar)}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <p className={cn("text-sm", isLight ? "text-ink/70" : "text-mist")}>نفدت الأحجام</p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {canAdd && offer ? (
              <button
                type="button"
                disabled={isAdding}
                onClick={handleAddBottle}
                className="pressable inline-flex h-11 min-w-[7.5rem] items-center justify-center bg-seal px-4 text-sm text-ivory disabled:opacity-60"
              >
                {isAdding ? "..." : `أضف ${formatSize(offer.sizeMl)}`}
              </button>
            ) : null}
            {sampleListed && product.sample ? (
              <button
                type="button"
                disabled={isAdding || !sampleReady}
                onClick={handleAddSample}
                className={cn(
                  "pressable inline-flex h-11 items-center border px-3.5 text-sm disabled:opacity-60",
                  isLight ? "border-ink/40 text-ink hover:border-ink" : "border-border text-ivory hover:border-ivory/40",
                )}
              >
                {sampleReady ? `عيّنة · ${formatPrice(product.sample.priceSar)}` : "نفدت العيّنة"}
              </button>
            ) : null}
            <Link
              href={`/catalog/${product.slug}`}
              className={cn(
                "inline-flex h-11 items-center px-1 text-sm underline-offset-4 transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal",
                isLight ? "text-bronze" : "text-brass",
              )}
            >
              التفاصيل
            </Link>
          </div>
          <p className={cn("mt-2 min-h-5 text-sm", isLight ? "text-seal" : "text-brass")} role="status" aria-live="polite">
            {addedLabel}
          </p>
        </div>
      </div>
    </article>
  );
}

function resolveInitialSize(
  selectable: readonly ProductOffer[],
  filterOffer: ProductOffer | undefined,
  size: SizeFilter,
): BottleSize {
  if (size !== "all") return size;
  if (filterOffer && selectable.some((offer) => offer.sizeMl === filterOffer.sizeMl)) {
    return filterOffer.sizeMl;
  }
  const stocked = selectable.find((offer) => offer.stockCount > 0);
  return stocked?.sizeMl ?? selectable[0]?.sizeMl ?? 50;
}

function offerMatchesFilters(offer: ProductOffer, size: SizeFilter, price: PriceFilter): boolean {
  if (size !== "all" && offer.sizeMl !== size) return false;
  if (price === "under-700") return offer.priceSar < 700;
  if (price === "700-1000") return offer.priceSar >= 700 && offer.priceSar <= 1000;
  if (price === "over-1000") return offer.priceSar > 1000;
  return true;
}
