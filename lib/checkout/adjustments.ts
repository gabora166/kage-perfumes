export const giftWrapFeeSar = 45;

export const giftMessageLimit = 160;

export type PromoKind = "percent" | "fixed";

export type PromoAdjustment = {
  kind: PromoKind;
  amount: number;
};

export type CheckoutTotals = {
  discountSar: number;
  giftWrapSar: number;
  totalSar: number;
};

export function discountFor(subtotalSar: number, promo: PromoAdjustment): number {
  if (subtotalSar < 1) return 0;
  if (promo.kind === "percent") {
    const percent = Math.min(100, Math.max(0, Math.round(promo.amount)));
    return Math.min(subtotalSar, Math.round((subtotalSar * percent) / 100));
  }
  return Math.min(subtotalSar, Math.max(0, Math.round(promo.amount)));
}

export function quoteTotals(input: {
  subtotalSar: number;
  giftWrap: boolean;
  discountSar: number;
}): CheckoutTotals {
  const discountSar = Math.min(input.subtotalSar, Math.max(0, input.discountSar));
  const giftWrapSar = input.giftWrap ? giftWrapFeeSar : 0;
  return {
    discountSar,
    giftWrapSar,
    totalSar: input.subtotalSar - discountSar + giftWrapSar,
  };
}

export function cleanGiftMessage(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, giftMessageLimit);
}

export function isGiftMessageTooLong(value: string): boolean {
  return value.trim().length > giftMessageLimit;
}
