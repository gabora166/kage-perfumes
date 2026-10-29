"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { PromoField } from "@/components/checkout/promo-field";
import { useCart } from "@/components/cart/cart-provider";
import { focusableElements, nextTrapTarget } from "@/lib/a11y/focus-trap";
import { lineTotalSar } from "@/lib/cart/lines";
import { formatPrice } from "@/lib/catalog/money";
import { kageDuration, kageEase } from "@/lib/motion/tokens";
import {
  complimentaryTesterCopy,
  mansouraShippingCopy,
  trustPolicyPaths,
} from "@/lib/trust/offers";

export function CartDrawer() {
  const { lines, subtotalSar, appliedPromo, isOpen, closeCart, updateQuantity, removeItem } = useCart();
  const prefersReducedMotion = useReducedMotion();
  const discountSar = appliedPromo?.discountSar ?? 0;
  const hasUnavailableLine = lines.some((line) => line.stockCount !== null && line.quantity > line.stockCount);
  const dialogRef = useRef<HTMLDivElement>(null);
  const payableSar = subtotalSar - discountSar;

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("[data-dialog-initial]")?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCart();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const next = nextTrapTarget(focusableElements(dialog), document.activeElement, event.shiftKey);
      if (!next) return;
      event.preventDefault();
      next.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [closeCart, isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div ref={dialogRef} className="fixed inset-0 z-[70]">
          <motion.button
            type="button"
            aria-label="إغلاق الحقيبة"
            className="absolute inset-0 bg-black/55"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : kageDuration.quick, ease: kageEase }}
            onClick={closeCart}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="حقيبة العطور"
            className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col border-s border-border bg-panel text-ivory shadow-none"
            initial={prefersReducedMotion ? false : { x: "-100%", opacity: 0.96 }}
            animate={{ x: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: "-100%", opacity: 0.96 }}
            transition={{ duration: prefersReducedMotion ? 0 : kageDuration.settle, ease: kageEase }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-sm text-brass">الطلب</p>
                <h2 className="mt-1 font-arabic-display text-3xl">الحقيبة</h2>
              </div>
              <button
                type="button"
                data-dialog-initial
                onClick={closeCart}
                aria-label="إغلاق"
                className="grid size-11 place-items-center text-ivory"
              >
                <X className="size-5" />
              </button>
            </div>
            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col justify-center px-5 py-10">
                <p className="font-arabic-display text-4xl leading-tight">الحقيبة فارغة</p>
                <p className="mt-4 max-w-xs leading-7 text-mist">
                  اختر زجاجة بالحجم والسعر، أو عيّنة 2 مل، من المجموعة.
                </p>
                <Link
                  href="/catalog"
                  onClick={closeCart}
                  className="mt-8 inline-flex h-12 items-center justify-center bg-seal px-6 text-sm text-ivory"
                >
                  العودة إلى العطور
                </Link>
              </div>
            ) : (
              <ul className="flex-1 space-y-0 overflow-y-auto px-5">
                {lines.map((line) => {
                  const canIncrease = line.quantity < line.quantityLimit;
                  const stockNote = stockSentence(line.quantity, line.stockCount);
                  const kind = lineKind(line.unitLabel);
                  return (
                    <li key={line.key} className="border-b border-border py-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-brass">{kind}</p>
                          <p className="mt-1 font-arabic-display text-2xl leading-tight">{line.titleAr}</p>
                          <p className="mt-1 font-display text-lg italic text-mist">{line.titleEn}</p>
                          <p className="mt-2 text-sm leading-6 text-mist">{line.detail}</p>
                        </div>
                        <button
                          type="button"
                          className="grid size-11 shrink-0 place-items-center text-ivory"
                          aria-label={`حذف ${line.titleAr}`}
                          onClick={() => removeItem(line.key)}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                        <span className="text-mist">{line.unitLabel}</span>
                        <span dir="ltr" className="tabular-nums text-ivory">
                          {formatPrice(line.unitPriceSar)}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1" role="group" aria-label={`كمية ${line.titleAr}`}>
                          <button
                            type="button"
                            aria-label={`تقليل كمية ${line.titleAr}`}
                            disabled={line.quantity < 2}
                            className="grid size-11 place-items-center border border-border text-ivory disabled:opacity-40"
                            onClick={() => updateQuantity(line.key, line.quantity - 1)}
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="min-w-10 text-center tabular-nums" aria-live="polite">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`زيادة كمية ${line.titleAr}`}
                            disabled={!canIncrease}
                            className="grid size-11 place-items-center border border-border text-ivory disabled:opacity-40"
                            onClick={() => updateQuantity(line.key, line.quantity + 1)}
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                        <p className="text-end">
                          <span className="block text-sm text-mist">إجمالي البند</span>
                          <span dir="ltr" className="font-display text-2xl tabular-nums text-ivory">
                            {formatPrice(lineTotalSar(line.unitPriceSar, line.quantity))}
                          </span>
                        </p>
                      </div>
                      {stockNote ? <p className="mt-3 text-sm leading-6 text-danger">{stockNote}</p> : null}
                    </li>
                  );
                })}
              </ul>
            )}
            {lines.length > 0 ? (
              <div className="border-t border-border bg-ivory px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink">
                <PromoField />
                <div className="mt-5 space-y-2 text-sm">
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-ink/70">ثمن العطور</span>
                    <span dir="ltr" className="tabular-nums">
                      {formatPrice(subtotalSar)}
                    </span>
                  </p>
                  {discountSar > 0 ? (
                    <p className="flex items-center justify-between gap-3">
                      <span className="text-ink/70">خصم الرمز</span>
                      <span dir="ltr" className="tabular-nums">
                        {formatPrice(discountSar)}
                      </span>
                    </p>
                  ) : null}
                  <p className="flex items-baseline justify-between gap-3 border-t border-ink/10 pt-3">
                    <span className="font-arabic-display text-2xl">المجموع</span>
                    <span dir="ltr" className="font-display text-3xl tabular-nums text-ink">
                      {formatPrice(payableSar)}
                    </span>
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-ink/70">
                  {mansouraShippingCopy.general}{" "}
                  <Link href={trustPolicyPaths.delivery} onClick={closeCart} className="text-seal">
                    صفحة التوصيل
                  </Link>
                  . {complimentaryTesterCopy.short}{" "}
                  <Link href={trustPolicyPaths.returns} onClick={closeCart} className="text-seal">
                    سياسة الإرجاع
                  </Link>
                  . التغليف يُختار عند إتمام الطلب.
                </p>
                {hasUnavailableLine ? (
                  <p className="mt-3 text-sm leading-6 text-danger">
                    أحد البنود تجاوز المتوفر. عدّل الكمية أو احذفه.
                  </p>
                ) : (
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="mt-5 flex h-12 items-center justify-center bg-seal text-sm text-ivory"
                  >
                    إتمام الطلب
                  </Link>
                )}
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function lineKind(unitLabel: string): string {
  if (unitLabel === "سعر العيّنة") return "عيّنة 2 مل";
  if (unitLabel === "سعر المجموعة") return "مجموعة اكتشاف";
  if (unitLabel === "سعر العرض") return "عرض باندل";
  if (unitLabel === "سعر التركيبة") return "تركيبة خاصة";
  return "زجاجة";
}

function stockSentence(quantity: number, stockCount: number | null): string | null {
  if (stockCount === null) return null;
  if (stockCount < 1) return "نفد هذا الحجم.";
  if (quantity > stockCount) return `المتوفر ${stockCount}.`;
  if (quantity === stockCount) return `المتوفر ${stockCount}.`;
  return null;
}
