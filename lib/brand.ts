import type { FragranceFamily } from "@/lib/catalog/types";

export const brand = {
  name: "KAGE",
  nameAr: "كاجي",
  city: "القاهرة",
  email: "atelier@ateeqperfumes.com",
  tagline: "العطر الذي لا يحتاج إلى أن يُرى ليُترك أثره",
  taglineEn: "THE ART OF THE INVISIBLE",
  supportLine: "حضور هادئ. أثر لا يُنسى.",
  conceptLine: "دار عطور معاصرة مستوحاة من الظل والدقة والهدوء.",
  announcement: "الدفع عند الاستلام داخل مصر · توصيل مرتب عبر الدار",
} as const;

export const brandAssets = {
  /** Hanko photo — recognizable 影 at small sizes without system fonts */
  emblem: "/brand/kage-seal-hanko.jpg",
  /** Path abstraction for print/mono contexts */
  emblemPath: "/brand/kage-seal-path.svg",
  emblemGlyph: "/brand/kage-seal.svg",
  emblemLight: "/brand/kage-seal-light.svg",
  emblemPhoto: "/brand/kage-seal-hanko.jpg",
  wordmark: "/brand/kage-wordmark.svg",
  favicon: "/brand/favicon.svg",
  socialAvatar: "/brand/kage-avatar.svg",
  /** Landscape hero without baked-in copy — bottle is atmospheric brand art, not a SKU photo */
  heroWide: "/brand/kage-hero-campaign-wide.jpg",
  heroPortrait: "/brand/kage-hero-campaign-portrait.jpg",
  /** Legacy night plates retained for editorial / fallback contexts */
  heroNightWide: "/brand/kage-hero-night.jpg",
  heroNightPortrait: "/brand/kage-hero-night-portrait.jpg",
  collections: {
    shadow: "/brand/collections/shadow.jpg",
    ember: "/brand/collections/ember.jpg",
    mist: "/brand/collections/mist.jpg",
    silk: "/brand/collections/silk.jpg",
  },
  /** Atmospheric illustration stages (not product photography) */
  stages: {
    shadow: "/brand/stages/shadow.jpg",
    ember: "/brand/stages/ember.jpg",
    mist: "/brand/stages/mist.jpg",
    silk: "/brand/stages/silk.jpg",
  },
  campaigns: {
    discovery: "/brand/campaigns/discovery.jpg",
    atelier: "/brand/campaigns/atelier.jpg",
  },
} as const;

export const brandSeo = {
  titleDefault: brand.name,
  titleTemplate: `%s — ${brand.name}`,
  description: `${brand.tagline} ${brand.supportLine} عطور نيش للرجال والنساء، مع طلب بالدفع عند الاستلام في مصر.`,
} as const;

export const storeLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/catalog", label: "العطور" },
  { href: "/discovery", label: "الاكتشاف" },
  { href: "/blend", label: "طلب خاص" },
  { href: "/bundles", label: "الباندل" },
] as const;

export type CollectionId = "shadow" | "ember" | "mist" | "silk";

export type BrandCollection = {
  id: CollectionId;
  nameEn: string;
  nameAr: string;
  blurbAr: string;
  href: string;
  family?: FragranceFamily;
  moodQuery?: string;
};

/** Merchandising collections — mapped to existing catalog data only. */
export const collections: BrandCollection[] = [
  {
    id: "shadow",
    nameEn: "SHADOW",
    nameAr: "الظل",
    blurbAr: "خشبي وجلد الظل — حضور هادئ قريب من النبض.",
    href: "/catalog?family=woody",
    family: "woody",
  },
  {
    id: "ember",
    nameEn: "EMBER",
    nameAr: "الجمر",
    blurbAr: "عنبر ودفء شرقي — أثر يبقى دون ضجيج.",
    href: "/catalog?family=oriental",
    family: "oriental",
  },
  {
    id: "mist",
    nameEn: "MIST",
    nameAr: "الضباب",
    blurbAr: "انتعاش وهدوء — لمن يبحث عن لمسة أخف في النصوص المنشورة.",
    href: "/catalog?mood=fresh",
    moodQuery: "fresh",
  },
  {
    id: "silk",
    nameEn: "SILK",
    nameAr: "الحرير",
    blurbAr: "زهري ومسكي ناعم — قرب الجلد بلا ثقل.",
    href: "/catalog?family=floral",
    family: "floral",
  },
];

/** Merchandising collection for a fragrance family, when one is mapped. */
export function collectionForFamily(family: FragranceFamily): BrandCollection | undefined {
  return collections.find((entry) => entry.family === family);
}

export const marqueeNotes = [
  "عنبر",
  "عود",
  "ورد",
  "مسك",
  "صندل",
  "زعفران",
  "ياسمين",
  "لبان",
  "بخور",
  "إيريس",
] as const;
