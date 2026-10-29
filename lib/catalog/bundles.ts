import { bottleSizes } from "@/lib/catalog/types";
import type { BottleSize } from "@/lib/catalog/types";

export const minimumBundleParts = 2;
export const maximumBundleParts = 4;
export const maximumBundlePartQuantity = 3;

export type BundleComponent = {
  productId: string;
  /** Catalog slug for product links — may match productId for seed data. */
  slug: string;
  nameAr: string;
  nameEn: string;
  sizeMl: BottleSize;
  quantity: number;
  unitPriceSar: number;
  stockCount: number;
};

export type BundleOffer = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  priceSar: number;
  stockCount: number;
  isPublished: boolean;
  isComplete: boolean;
  parts: BundleComponent[];
};

export function comparePriceSar(parts: readonly Pick<BundleComponent, "unitPriceSar" | "quantity">[]): number {
  return parts.reduce((sum, part) => sum + part.unitPriceSar * part.quantity, 0);
}

export function savingsSar(priceSar: number, parts: readonly Pick<BundleComponent, "unitPriceSar" | "quantity">[]): number {
  return comparePriceSar(parts) - priceSar;
}

export function availableSets(stockCount: number, parts: readonly Pick<BundleComponent, "stockCount" | "quantity">[]): number {
  if (parts.length < minimumBundleParts) return 0;
  return parts.reduce((limit, part) => {
    if (part.quantity < 1) return 0;
    return Math.min(limit, Math.floor(part.stockCount / part.quantity));
  }, stockCount);
}

export function isVisibleBundle(bundle: BundleOffer): boolean {
  return bundle.isPublished && bundle.isComplete && savingsSar(bundle.priceSar, bundle.parts) > 0;
}

export function isBottleSize(value: number): value is BottleSize {
  return bottleSizes.some((size) => size === value);
}
