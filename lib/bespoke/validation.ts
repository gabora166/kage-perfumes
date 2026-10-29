import { normalizePhoneDigits } from "@/lib/orders/match";
import {
  isBespokeConcentration,
  isBespokeSizeOption,
  type BespokeConcentration,
  type BespokeSizeOption,
} from "@/lib/bespoke/options";

const phonePattern = /^[0-9+\s-]{8,16}$/;
const maximumNameLength = 120;
const maximumBrandLength = 80;
const maximumNotesLength = 800;
const maximumCustomSizeLength = 40;
const maximumQuantity = 20;

export type BespokeRequestDraft = {
  perfumeName: string;
  phone: string;
  brandName: string;
  sizeOption: string;
  customSize: string;
  quantity: number;
  concentration: string;
  notes: string;
};

export type BespokeRequestInput = {
  perfumeName: string;
  phone: string;
  brandName: string;
  sizeOption: BespokeSizeOption | null;
  customSize: string;
  quantity: number;
  concentration: BespokeConcentration | null;
  notes: string;
};

export type BespokeField = keyof BespokeRequestDraft;

export function bespokeFieldErrors(draft: BespokeRequestDraft): Partial<Record<BespokeField, string>> {
  const errors: Partial<Record<BespokeField, string>> = {};
  const perfumeName = draft.perfumeName.trim();
  if (perfumeName.length < 2) errors.perfumeName = "اكتب اسم العطر المطلوب.";
  if (perfumeName.length > maximumNameLength) errors.perfumeName = "اسم العطر أطول من الحد.";
  if (!phonePattern.test(draft.phone.trim())) errors.phone = "رقم الموبايل غير واضح.";
  const digits = normalizePhoneDigits(draft.phone);
  if (digits.length < 8 || digits.length > 15) errors.phone = "رقم الموبايل غير واضح.";
  if (draft.brandName.trim().length > maximumBrandLength) errors.brandName = "اسم الماركة أطول من الحد.";
  if (draft.sizeOption && !isBespokeSizeOption(draft.sizeOption)) {
    errors.sizeOption = "اختر حجماً واضحاً.";
  }
  if (draft.sizeOption === "custom") {
    const customSize = draft.customSize.trim();
    if (customSize.length < 1) errors.customSize = "اكتب الحجم المطلوب.";
    if (customSize.length > maximumCustomSizeLength) errors.customSize = "الحجم المخصص أطول من الحد.";
  }
  if (!Number.isInteger(draft.quantity) || draft.quantity < 1 || draft.quantity > maximumQuantity) {
    errors.quantity = `الكمية من 1 إلى ${maximumQuantity}.`;
  }
  if (draft.concentration && !isBespokeConcentration(draft.concentration)) {
    errors.concentration = "اختر كثافة واضحة.";
  }
  if (draft.notes.trim().length > maximumNotesLength) errors.notes = "الملاحظة أطول من الحد.";
  return errors;
}

export function firstBespokeError(draft: BespokeRequestDraft): string | null {
  const errors = bespokeFieldErrors(draft);
  return (
    errors.perfumeName ??
    errors.phone ??
    errors.brandName ??
    errors.sizeOption ??
    errors.customSize ??
    errors.quantity ??
    errors.concentration ??
    errors.notes ??
    null
  );
}

export function parseBespokeRequestBody(body: unknown): BespokeRequestDraft {
  const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  return {
    perfumeName: typeof raw.perfumeName === "string" ? raw.perfumeName : "",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    brandName: typeof raw.brandName === "string" ? raw.brandName : "",
    sizeOption: typeof raw.sizeOption === "string" ? raw.sizeOption : "",
    customSize: typeof raw.customSize === "string" ? raw.customSize : "",
    quantity: typeof raw.quantity === "number" ? raw.quantity : Number(raw.quantity ?? 1),
    concentration: typeof raw.concentration === "string" ? raw.concentration : "",
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

export function sanitizeBespokeRequest(draft: BespokeRequestDraft): BespokeRequestInput {
  const error = firstBespokeError(draft);
  if (error) throw new Error(error);
  const sizeOption = draft.sizeOption && isBespokeSizeOption(draft.sizeOption) ? draft.sizeOption : null;
  const concentration =
    draft.concentration && isBespokeConcentration(draft.concentration) ? draft.concentration : null;
  return {
    perfumeName: draft.perfumeName.trim().slice(0, maximumNameLength),
    phone: normalizePhoneDigits(draft.phone),
    brandName: draft.brandName.trim().slice(0, maximumBrandLength),
    sizeOption,
    customSize: sizeOption === "custom" ? draft.customSize.trim().slice(0, maximumCustomSizeLength) : "",
    quantity: draft.quantity,
    concentration,
    notes: draft.notes.trim().slice(0, maximumNotesLength),
  };
}

export function readProposedPriceSar(value: unknown): number {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(amount) || amount < 1 || amount > 1_000_000) {
    throw new Error("السعر المقترح غير واضح.");
  }
  return amount;
}

export function readFulfillmentEstimate(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.length > 120) throw new Error("مدة التجهيز أطول من الحد.");
  return trimmed;
}

export function readInternalNote(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.length > 1000) throw new Error("الملاحظة الداخلية أطول من الحد.");
  return trimmed;
}
