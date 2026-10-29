import { splitNotes } from "@/lib/catalog/story";
import type { FragranceNotes } from "@/lib/catalog/types";

export const noteTiers = [
  { key: "top", labelAr: "المقدمة", labelEn: "Top notes", step: "01" },
  { key: "heart", labelAr: "القلب", labelEn: "Heart notes", step: "02" },
  { key: "base", labelAr: "القاعدة", labelEn: "Base notes", step: "03" },
] as const;

export type NoteTierKey = (typeof noteTiers)[number]["key"];

export type IngredientAsset = {
  /** Canonical Arabic label shown in the UI */
  nameAr: string;
  nameEn: string | null;
  /** Public path under /brand/ingredients when an approved still exists */
  imageSrc: string | null;
};

export type ResolvedIngredient = IngredientAsset & {
  id: string;
  imageAlt: string;
  hasImage: boolean;
};

export type NoteTierView = {
  key: NoteTierKey;
  labelAr: string;
  labelEn: string;
  step: string;
  ingredients: ResolvedIngredient[];
};

/**
 * Approved still-life mapping keyed by Arabic note text as stored on products.
 * Aliases point at the same asset without inventing new fragrance claims.
 */
const ingredientCatalog: Record<string, IngredientAsset> = {
  برغموت: {
    nameAr: "برغموت",
    nameEn: "Bergamot",
    imageSrc: "/brand/ingredients/bergamot.jpg",
  },
  زعفران: {
    nameAr: "زعفران",
    nameEn: "Saffron",
    imageSrc: "/brand/ingredients/saffron.jpg",
  },
  "ورد محروق": {
    nameAr: "ورد محروق",
    nameEn: "Charred rose",
    imageSrc: "/brand/ingredients/rose.jpg",
  },
  لبان: {
    nameAr: "لبان",
    nameEn: "Frankincense",
    imageSrc: "/brand/ingredients/frankincense.jpg",
  },
  عنبر: {
    nameAr: "عنبر",
    nameEn: "Amber",
    imageSrc: "/brand/ingredients/amber.jpg",
  },
  مسك: {
    nameAr: "مسك",
    nameEn: "Musk",
    imageSrc: "/brand/ingredients/musk.jpg",
  },
  "بهار وردي": {
    nameAr: "بهار وردي",
    nameEn: "Pink pepper",
    imageSrc: "/brand/ingredients/pink-pepper.jpg",
  },
  "فلفل وردي": {
    nameAr: "فلفل وردي",
    nameEn: "Pink pepper",
    imageSrc: "/brand/ingredients/pink-pepper.jpg",
  },
  عود: {
    nameAr: "عود",
    nameEn: "Oud",
    imageSrc: "/brand/ingredients/oud.jpg",
  },
  أرز: {
    nameAr: "أرز",
    nameEn: "Cedar",
    imageSrc: "/brand/ingredients/cedar.jpg",
  },
  صندل: {
    nameAr: "صندل",
    nameEn: "Sandalwood",
    imageSrc: "/brand/ingredients/sandalwood.jpg",
  },
  "جلود ناعمة": {
    nameAr: "جلود ناعمة",
    nameEn: "Soft leather",
    imageSrc: "/brand/ingredients/leather.jpg",
  },
  ليتشي: {
    nameAr: "ليتشي",
    nameEn: "Lychee",
    imageSrc: "/brand/ingredients/lychee.jpg",
  },
  "شاي أخضر": {
    nameAr: "شاي أخضر",
    nameEn: "Green tea",
    imageSrc: "/brand/ingredients/green-tea.jpg",
  },
  "ورد دمشقي": {
    nameAr: "ورد دمشقي",
    nameEn: "Damask rose",
    imageSrc: "/brand/ingredients/rose.jpg",
  },
  "مسك أبيض": {
    nameAr: "مسك أبيض",
    nameEn: "White musk",
    imageSrc: "/brand/ingredients/musk.jpg",
  },
  "أخشاب شاحبة": {
    nameAr: "أخشاب شاحبة",
    nameEn: "Pale woods",
    imageSrc: "/brand/ingredients/pale-woods.jpg",
  },
  إيريس: {
    nameAr: "إيريس",
    nameEn: "Iris",
    imageSrc: "/brand/ingredients/iris.jpg",
  },
  أمبروكسان: {
    nameAr: "أمبروكسان",
    nameEn: "Ambroxan",
    imageSrc: null,
  },
  "فانيلا شاحبة": {
    nameAr: "فانيلا شاحبة",
    nameEn: "Pale vanilla",
    imageSrc: "/brand/ingredients/vanilla.jpg",
  },
  هيل: {
    nameAr: "هيل",
    nameEn: "Cardamom",
    imageSrc: "/brand/ingredients/cardamom.jpg",
  },
  "حليب خشب": {
    nameAr: "حليب خشب",
    nameEn: "Milky woods",
    imageSrc: "/brand/ingredients/sandalwood.jpg",
  },
  كمثرى: {
    nameAr: "كمثرى",
    nameEn: "Pear",
    imageSrc: "/brand/ingredients/pear.jpg",
  },
  ياسمين: {
    nameAr: "ياسمين",
    nameEn: "Jasmine",
    imageSrc: "/brand/ingredients/jasmine.jpg",
  },
  "زهر البرتقال": {
    nameAr: "زهر البرتقال",
    nameEn: "Orange blossom",
    imageSrc: "/brand/ingredients/orange-blossom.jpg",
  },
  تونكا: {
    nameAr: "تونكا",
    nameEn: "Tonka",
    imageSrc: "/brand/ingredients/tonka.jpg",
  },
  "بخور خفيف": {
    nameAr: "بخور خفيف",
    nameEn: "Soft incense",
    imageSrc: "/brand/ingredients/incense.jpg",
  },
  ورد: {
    nameAr: "ورد",
    nameEn: "Rose",
    imageSrc: "/brand/ingredients/rose.jpg",
  },
};

export function normalizeIngredientKey(nameAr: string): string {
  return nameAr.trim().replace(/\s+/g, " ");
}

export function resolveIngredient(nameAr: string): ResolvedIngredient {
  const key = normalizeIngredientKey(nameAr);
  const mapped = ingredientCatalog[key];
  const asset: IngredientAsset = mapped ?? {
    nameAr: key,
    nameEn: null,
    imageSrc: null,
  };
  const hasImage = Boolean(asset.imageSrc);
  return {
    ...asset,
    id: key,
    hasImage,
    imageAlt: hasImage
      ? `صورة تمثيلية لمكوّن ${asset.nameAr}${asset.nameEn ? ` · ${asset.nameEn}` : ""}`
      : `مكوّن ${asset.nameAr} دون صورة معتمدة`,
  };
}

export function buildNoteTiers(notes: FragranceNotes): NoteTierView[] {
  return noteTiers.flatMap((tier) => {
    const ingredients = splitNotes(notes[tier.key]).map(resolveIngredient);
    if (ingredients.length === 0) return [];
    return [
      {
        key: tier.key,
        labelAr: tier.labelAr,
        labelEn: tier.labelEn,
        step: tier.step,
        ingredients,
      },
    ];
  });
}
