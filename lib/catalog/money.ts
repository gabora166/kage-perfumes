import type { Product, ProductOffer } from "@/lib/catalog/types";

export const storeCurrency = "EGP";

const priceFormatter = new Intl.NumberFormat("ar-EG-u-nu-latn", {
  style: "currency",
  currency: storeCurrency,
  maximumFractionDigits: 0,
});

export function formatPrice(amountSar: number): string {
  return priceFormatter.format(amountSar);
}

export function formatSize(sizeMl: number): string {
  return `${sizeMl} مل`;
}

export function getStartingOffer(product: Product): ProductOffer {
  return product.offers.reduce((lowest, offer) => {
    if (offer.priceSar < lowest.priceSar) return offer;
    return lowest;
  });
}

export function getAvailableStartingOffer(product: Product): ProductOffer | undefined {
  const available = product.offers.filter((offer) => offer.stockCount > 0);
  if (available.length === 0) return undefined;
  return available.reduce((lowest, offer) => {
    if (offer.priceSar < lowest.priceSar) return offer;
    return lowest;
  });
}
