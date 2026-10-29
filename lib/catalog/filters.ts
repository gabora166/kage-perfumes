import { getAvailableStartingOffer, getStartingOffer } from "@/lib/catalog/money";
import { bottleSizes, fragranceFamilies } from "@/lib/catalog/types";
import type {
  BottleSize,
  FamilyFilter,
  FragranceFamily,
  Product,
  ProductOffer,
  SizeFilter,
} from "@/lib/catalog/types";

export const catalogSorts = ["default", "price-asc", "price-desc"] as const;

export type CatalogSort = (typeof catalogSorts)[number];

export const priceFilters = ["all", "under-700", "700-1000", "over-1000"] as const;

export type PriceFilter = (typeof priceFilters)[number];

const priceLabels: Record<Exclude<PriceFilter, "all">, string> = {
  "under-700": "أقل من 700 ج.م",
  "700-1000": "700–1000 ج.م",
  "over-1000": "أكثر من 1000 ج.م",
};

export function parseFamily(value: string | undefined): FamilyFilter {
  if (value && isFragranceFamily(value)) return value;
  return "all";
}

export function parseSize(value: string | undefined): SizeFilter {
  const parsed = Number(value);
  if (isBottleSize(parsed)) return parsed;
  return "all";
}

export function parseSort(value: string | undefined): CatalogSort {
  if (value === "price-asc" || value === "price-desc") return value;
  return "default";
}

export function parsePrice(value: string | undefined): PriceFilter {
  if (value === "under-700" || value === "700-1000" || value === "over-1000") return value;
  return "all";
}

export function priceFilterLabel(price: Exclude<PriceFilter, "all">): string {
  return priceLabels[price];
}

const mistMoodTokens = ["خفيف", "انتعاش", "منعش", "أخضر", "نهار", "ربيع", "نظيف", "fresh", "green", "clean"] as const;

export function parseMood(value: string | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

/** Soft text match for merchandising moods (e.g. MIST) — uses existing product copy only. */
export function productMatchesMood(product: Product, mood: string): boolean {
  if (mood === "fresh") {
    const haystack = [
      product.descriptionAr,
      product.mood,
      product.season,
      product.occasion,
      product.sensoryVibe,
      ...product.notes.top,
      ...product.notes.heart,
      ...product.notes.base,
    ]
      .join(" ")
      .toLowerCase();
    return mistMoodTokens.some((token) => haystack.includes(token.toLowerCase()));
  }
  return false;
}

export function filterProducts(
  products: readonly Product[],
  family: FamilyFilter,
  size: SizeFilter,
  price: PriceFilter = "all",
  mood: string | null = null,
): Product[] {
  return products.filter((product) => {
    if (!product.isPublished) return false;
    if (family !== "all" && product.family !== family) return false;
    if (mood && !productMatchesMood(product, mood)) return false;
    if (size === "all" && price === "all") return true;
    return product.offers.some((offer) => offerMatches(offer, size, price));
  });
}

export function matchingOffer(
  product: Product,
  size: SizeFilter = "all",
  price: PriceFilter = "all",
): ProductOffer | undefined {
  if (size === "all" && price === "all") return getAvailableStartingOffer(product);
  const matched = product.offers.filter((offer) => offerMatches(offer, size, price));
  const available = matched.filter((offer) => offer.stockCount > 0);
  const pool = available.length > 0 ? available : matched;
  if (pool.length === 0) return undefined;
  return pool.reduce((lowest, offer) => (offer.priceSar < lowest.priceSar ? offer : lowest));
}

export function publishedPriceFilters(
  products: readonly Product[],
  size: SizeFilter = "all",
): Array<Exclude<PriceFilter, "all">> {
  return priceFilters.filter((band): band is Exclude<PriceFilter, "all"> => {
    if (band === "all") return false;
    return products.some((product) => product.isPublished && product.offers.some((offer) => offerMatches(offer, size, band)));
  });
}

export function sortProducts(
  products: readonly Product[],
  sort: CatalogSort,
  size: SizeFilter = "all",
  price: PriceFilter = "all",
): Product[] {
  const copy = [...products];
  if (sort === "default") return copy;
  const direction = sort === "price-asc" ? 1 : -1;
  return copy.sort((left, right) => {
    const gap = catalogPrice(left, size, price) - catalogPrice(right, size, price);
    if (gap !== 0) return gap * direction;
    return left.nameAr.localeCompare(right.nameAr, "ar");
  });
}

export function publishedFamilies(products: readonly Product[]): FragranceFamily[] {
  return fragranceFamilies.filter((family) => {
    return products.some((product) => product.isPublished && product.family === family);
  });
}

export function publishedSizes(
  products: readonly Product[],
  selected: SizeFilter,
  price: PriceFilter = "all",
): BottleSize[] {
  const present = bottleSizes.filter((size) => {
    return products.some((product) => product.offers.some((offer) => offerMatches(offer, size, price)));
  });
  if (selected !== "all" && !present.includes(selected)) return [...present, selected];
  return present;
}

export function catalogCountLabel(count: number): string {
  if (count === 0) return "لا عطور في هذا الاختيار";
  if (count === 1) return "عطر واحد";
  if (count === 2) return "عطران";
  return `${count} عطور`;
}

function isFragranceFamily(value: string): value is FragranceFamily {
  return fragranceFamilies.some((family) => family === value);
}

function isBottleSize(value: number): value is BottleSize {
  return bottleSizes.some((size) => size === value);
}

function offerMatches(offer: ProductOffer, size: SizeFilter, price: PriceFilter): boolean {
  const matchesSize = size === "all" || offer.sizeMl === size;
  const matchesPrice = price === "all" || priceContains(offer.priceSar, price);
  return matchesSize && matchesPrice;
}

function priceContains(amount: number, price: Exclude<PriceFilter, "all">): boolean {
  if (price === "under-700") return amount < 700;
  if (price === "700-1000") return amount >= 700 && amount <= 1000;
  return amount > 1000;
}

function catalogPrice(product: Product, size: SizeFilter, price: PriceFilter): number {
  const offer = matchingOffer(product, size, price) ?? (product.offers.length > 0 ? getStartingOffer(product) : undefined);
  if (!offer) return Number.POSITIVE_INFINITY;
  return offer.priceSar;
}
