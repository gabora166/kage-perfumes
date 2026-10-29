import type { FragranceFamily } from "@/lib/catalog/types";

export const familyLabels: Record<
  FragranceFamily,
  { ar: string; en: string; description: string }
> = {
  oriental: {
    ar: "شرقي",
    en: "Oriental",
    description: "عنبر، بخور، ودفء يلتصق بالذاكرة.",
  },
  woody: {
    ar: "خشبي",
    en: "Woody",
    description: "عود مصقول وصندل هادئ، قريب من النبض.",
  },
  floral: {
    ar: "زهري",
    en: "Floral",
    description: "زهور تُقطف قبل الفجر، ناعمة ومضيئة.",
  },
};

export const concentrationLabels = {
  "eau-de-parfum": {
    ar: "أو دو بارفان",
    en: "Eau de Parfum",
    description: "حضور متوازن يبقى قريبًا دون أن يثقل.",
  },
  extrait: {
    ar: "إكستريه",
    en: "Extrait",
    description: "تركيز أعلى، أثر أعمق، وهمسة أطول.",
  },
} as const;

export type Concentration = keyof typeof concentrationLabels;
