"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { ProductVisual } from "@/components/catalog/product-visual";
import { focusableElements, nextTrapTarget } from "@/lib/a11y/focus-trap";
import {
  galleryKinds,
  heroImageSizes,
  imageAlt,
  productVisualState,
  thumbImageSizes,
  visualCaption,
} from "@/lib/catalog/images";
import type { Product, ProductImageKind } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { kageDuration, kageEase } from "@/lib/motion/tokens";

type ProductGalleryProps = {
  product: Product;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  const kinds = galleryKinds(product);
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState<ProductImageKind>("bottle");
  const [isZoomed, setIsZoomed] = useState(false);
  const current = kinds.includes(active) ? active : "bottle";
  const visualState = productVisualState(product, current);
  const canZoom = Boolean(product.images[current]);
  return (
    <figure className="grid gap-3">
      <div className="border-draw relative overflow-hidden border border-border/80 bg-ink shadow-[inset_0_0_0_1px_rgba(179,154,112,0.08)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            className="image-settle"
            initial={prefersReducedMotion ? false : { opacity: 0.35 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0.2 }}
            transition={{ duration: kageDuration.ui, ease: kageEase }}
          >
            <ProductVisual
              product={product}
              kind={current}
              sizes={heroImageSizes}
              priority={current === "bottle"}
              ratio="stage"
              showBadge={visualState === "illustration"}
            />
          </motion.div>
        </AnimatePresence>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_45%_35%,transparent_42%,rgba(17,18,17,0.28)_100%)]"
        />
      </div>
      <figcaption className="text-sm leading-7 text-mist">
        {product.nameAr} — {visualCaption(visualState, current)}
        {visualState === "illustration" ? "، وليس صورة للزجاجة" : ""}
        {visualState === "photograph" ? " · صورة المنتج كما حُفظت في الدار" : ""}
      </figcaption>
      {canZoom ? (
        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          className="inline-flex min-h-11 w-fit items-center text-sm text-brass transition-colors hover:text-ivory"
        >
          تكبير الصورة
        </button>
      ) : null}
      {isZoomed && canZoom ? (
        <ZoomDialog product={product} kind={current} onClose={() => setIsZoomed(false)} />
      ) : null}
      {kinds.length > 1 ? (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3" role="group" aria-label="صور المنتج">
          {kinds.map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={kind === current}
              aria-label={imageAlt(product, kind)}
              onClick={() => setActive(kind)}
              className={cn(
                "block min-h-11 w-full overflow-hidden border transition-colors",
                kind === current
                  ? "border-seal ring-1 ring-seal/40"
                  : "border-border hover:border-brass",
              )}
            >
              <ProductVisual product={product} kind={kind} sizes={thumbImageSizes} ratio="thumb" />
            </button>
          ))}
        </div>
      ) : null}
    </figure>
  );
}

type ZoomDialogProps = {
  product: Product;
  kind: ProductImageKind;
  onClose: () => void;
};

function ZoomDialog({ product, kind, onClose }: ZoomDialogProps) {
  const src = product.images[kind];
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("[data-dialog-initial]")?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const next = nextTrapTarget(focusableElements(dialogRef.current), document.activeElement, event.shiftKey);
      if (!next) return;
      event.preventDefault();
      next.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);
  if (!src) return null;
  return (
    <div ref={dialogRef} className="fixed inset-0 z-[75]">
      <button type="button" aria-label="إغلاق التكبير" className="absolute inset-0 bg-ink/80" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={imageAlt(product, kind)}
        className="absolute inset-3 flex flex-col bg-ivory text-ink md:inset-10"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="text-sm text-ink/70">{visualCaption(productVisualState(product, kind), kind)}</p>
          <button
            type="button"
            data-dialog-initial
            onClick={onClose}
            className="inline-flex h-11 items-center px-3 text-sm text-ink"
          >
            إغلاق
          </button>
        </div>
        <div className="relative min-h-[50vh] flex-1">
          <ProductPhoto src={src} alt={imageAlt(product, kind)} sizes="100vw" family={product.family} priority />
        </div>
      </div>
    </div>
  );
}
