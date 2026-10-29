import type { SampleOffer } from "@/lib/catalog/types";

export const sampleSizeMl = 2;

export const discoverySetId = "house-discovery";

export const defaultDiscoveryPriceSar = 360;

export const defaultDiscoveryStock = 8;

export const houseSamples: Record<string, SampleOffer> = {
  "layl-al-anbar": { priceSar: 75, stockCount: 20, isEnabled: true },
  "oud-al-malik": { priceSar: 95, stockCount: 12, isEnabled: true },
  "ward-dimashq": { priceSar: 65, stockCount: 20, isEnabled: true },
  "misk-al-harir": { priceSar: 60, stockCount: 20, isEnabled: true },
  "sandal-al-qamar": { priceSar: 70, stockCount: 16, isEnabled: true },
  "yasmin-layl": { priceSar: 65, stockCount: 20, isEnabled: true },
};

export function sampleForHouse(id: string): SampleOffer | null {
  return houseSamples[id] ?? null;
}

/** Sample appears as an orderable offer on the storefront. */
export function isSampleListed(sample: SampleOffer | null | undefined): boolean {
  return Boolean(sample?.isEnabled);
}

/** Sample can be added to cart right now (enabled and in stock). */
export function isSamplePurchasable(sample: SampleOffer | null | undefined): boolean {
  return Boolean(sample?.isEnabled && sample.stockCount > 0);
}

export type DiscoveryVial = {
  productId: string;
  nameAr: string;
  nameEn: string;
};

export type DiscoverySet = {
  id: string;
  nameAr: string;
  nameEn: string;
  priceSar: number;
  stockCount: number;
  isPublished: boolean;
  vials: DiscoveryVial[];
};
