export const fragranceFamilies = ["oriental", "woody", "floral"] as const;

export type FragranceFamily = (typeof fragranceFamilies)[number];

export const bottleSizes = [30, 50, 100] as const;

export type BottleSize = (typeof bottleSizes)[number];

export type FamilyFilter = FragranceFamily | "all";

export type SizeFilter = BottleSize | "all";

export type ProductOffer = {
  sizeMl: BottleSize;
  priceSar: number;
  stockCount: number;
  isListed: boolean;
};

export type SampleOffer = {
  priceSar: number;
  stockCount: number;
  /** When false, sample price/stock stay saved but ordering is closed. */
  isEnabled: boolean;
};

export type FragranceNotes = {
  top: string;
  heart: string;
  base: string;
};

/** Storefront product gallery kinds (pyramid is dossier-only). */
export const galleryImageKinds = ["bottle", "liquid", "texture"] as const;

export const productImageKinds = ["bottle", "liquid", "texture", "pyramid"] as const;

export type ProductImageKind = (typeof productImageKinds)[number];

export type GalleryImageKind = (typeof galleryImageKinds)[number];

export type ProductImages = Record<ProductImageKind, string | null>;

export const wearLevels = [1, 2, 3, 4, 5] as const;

export type WearLevel = (typeof wearLevels)[number];

export type Product = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  family: FragranceFamily;
  descriptionAr: string;
  notes: FragranceNotes;
  offers: ProductOffer[];
  isFeatured: boolean;
  isPublished: boolean;
  images: ProductImages;
  longevity: WearLevel;
  sillage: WearLevel;
  longevitySpan: string;
  sillageSpan: string;
  sensoryVibe: string;
  mood: string;
  season: string;
  occasion: string;
  attire: string;
  sample: SampleOffer | null;
};
