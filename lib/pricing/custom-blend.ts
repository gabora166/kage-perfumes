import type { Concentration } from "@/lib/catalog/labels";
import type { BottleSize } from "@/lib/catalog/types";

export const blendNotes = [
  { id: "bergamot", nameAr: "برغموت", group: "top" },
  { id: "saffron", nameAr: "زعفران", group: "top" },
  { id: "cardamom", nameAr: "هيل", group: "top" },
  { id: "rose", nameAr: "ورد دمشقي", group: "heart" },
  { id: "jasmine", nameAr: "ياسمين", group: "heart" },
  { id: "oud", nameAr: "عود", group: "heart" },
  { id: "amber", nameAr: "عنبر", group: "base" },
  { id: "musk", nameAr: "مسك", group: "base" },
  { id: "sandalwood", nameAr: "صندل", group: "base" },
  { id: "incense", nameAr: "بخور", group: "base" },
] as const;

export type BlendNoteId = (typeof blendNotes)[number]["id"];

export const noteGroupLabels = {
  top: "القمة",
  heart: "القلب",
  base: "القاعدة",
} as const;

const sizeBase: Record<BottleSize, number> = {
  30: 420,
  50: 680,
  100: 980,
};

const concentrationFactor: Record<Concentration, number> = {
  "eau-de-parfum": 1,
  extrait: 1.28,
};

const noteFeeSar = 35;
const minimumNotes = 2;
const maximumNotes = 4;

export function priceCustomBlend(input: {
  sizeMl: BottleSize;
  concentration: Concentration;
  noteCount: number;
}): number {
  const base = sizeBase[input.sizeMl] * concentrationFactor[input.concentration];
  return Math.round(base + input.noteCount * noteFeeSar);
}

export function isBlendNoteId(value: string): value is BlendNoteId {
  return blendNotes.some((note) => note.id === value);
}

export function noteName(id: string): string {
  return blendNotes.find((note) => note.id === id)?.nameAr ?? id;
}

export function canPriceBlend(noteCount: number): boolean {
  return noteCount >= minimumNotes && noteCount <= maximumNotes;
}

export const blendLimits = {
  minimumNotes,
  maximumNotes,
  noteFeeSar,
} as const;
