import type { Product } from "./types";

const minimumQueryLength = 2;
const maximumQueryLength = 80;

export function searchProducts(products: readonly Product[], query: string): Product[] {
  const needle = normalizeSearch(query).slice(0, maximumQueryLength);
  if (needle.length < minimumQueryLength) return [];
  return products.filter((product) => normalizeSearch(productSearchText(product)).includes(needle));
}

export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function productSearchText(product: Product): string {
  return [
    product.nameAr,
    product.nameEn,
    product.notes.top,
    product.notes.heart,
    product.notes.base,
  ].join(" ");
}
