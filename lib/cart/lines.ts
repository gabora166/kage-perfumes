import { cartLineKey, cartQuantityLimit, discoveryQuantityLimit } from "@/lib/cart/cart-store";
import type { CartItem } from "@/lib/cart/cart-store";
import { availableSets, savingsSar } from "@/lib/catalog/bundles";
import type { BundleOffer } from "@/lib/catalog/bundles";
import { concentrationLabels } from "@/lib/catalog/labels";
import type { DiscoverySet } from "@/lib/catalog/samples";
import type { Product } from "@/lib/catalog/types";
import { noteName, priceCustomBlend } from "@/lib/pricing/custom-blend";

export type CartLine = {
  key: string;
  titleAr: string;
  titleEn: string;
  detail: string;
  unitLabel: string;
  unitPriceSar: number;
  quantity: number;
  quantityLimit: number;
  stockCount: number | null;
};

export function lineTotalSar(unitPriceSar: number, quantity: number): number {
  return unitPriceSar * quantity;
}

export function merchandiseTotalSar(lines: readonly CartLine[]): number {
  return lines.reduce((total, line) => total + lineTotalSar(line.unitPriceSar, line.quantity), 0);
}

export function buildCartLines(
  items: readonly CartItem[],
  products: readonly Product[],
  discoverySet: DiscoverySet | null,
  bundles: readonly BundleOffer[] = [],
): CartLine[] {
  return items.flatMap((item): CartLine[] => {
    if (item.kind === "discovery") return discoveryLine(item, discoverySet);
    if (item.kind === "sample") return sampleLine(item, products);
    if (item.kind === "bundle") return bundleLine(item, bundles);
    if (item.kind === "custom") return [customLine(item)];
    return catalogLine(item, products);
  });
}

function discoveryLine(item: Extract<CartItem, { kind: "discovery" }>, discoverySet: DiscoverySet | null): CartLine[] {
  if (!discoverySet) return [];
  return [line({
    key: cartLineKey(item),
    titleAr: discoverySet.nameAr,
    titleEn: discoverySet.nameEn,
    detail: `عيّنات 2 مل · ${discoverySet.vials.map((vial) => vial.nameAr).join("، ")}`,
    unitLabel: "سعر المجموعة",
    unitPriceSar: discoverySet.priceSar,
    quantity: item.quantity,
    stockCount: discoverySet.stockCount,
    houseLimit: discoveryQuantityLimit,
  })];
}

function sampleLine(item: Extract<CartItem, { kind: "sample" }>, products: readonly Product[]): CartLine[] {
  const product = products.find((entry) => entry.id === item.productId);
  if (!product?.sample?.isEnabled) return [];
  return [line({
    key: cartLineKey(item),
    titleAr: product.nameAr,
    titleEn: product.nameEn,
    detail: "2 مل · عيّنة",
    unitLabel: "سعر العيّنة",
    unitPriceSar: product.sample.priceSar,
    quantity: item.quantity,
    stockCount: product.sample.stockCount,
    houseLimit: cartQuantityLimit,
  })];
}

function customLine(item: Extract<CartItem, { kind: "custom" }>): CartLine {
  return line({
    key: cartLineKey(item),
    titleAr: "عطر خاص",
    titleEn: "Private Blend",
    detail: `${item.sizeMl} مل · ${concentrationLabels[item.concentration].ar} · ${item.noteIds.map(noteName).join("، ")}`,
    unitLabel: "سعر التركيبة",
    unitPriceSar: priceCustomBlend({
      sizeMl: item.sizeMl,
      concentration: item.concentration,
      noteCount: item.noteIds.length,
    }),
    quantity: item.quantity,
    stockCount: null,
    houseLimit: cartQuantityLimit,
  });
}

function bundleLine(item: Extract<CartItem, { kind: "bundle" }>, bundles: readonly BundleOffer[]): CartLine[] {
  const bundle = bundles.find((entry) => entry.id === item.bundleId);
  if (!bundle || savingsSar(bundle.priceSar, bundle.parts) < 1) return [];
  const detail = bundle.parts
    .map((part) => `${part.nameAr} ${part.sizeMl} مل${part.quantity > 1 ? ` × ${part.quantity}` : ""}`)
    .join("، ");
  return [line({
    key: cartLineKey(item),
    titleAr: bundle.nameAr,
    titleEn: bundle.nameEn,
    detail,
    unitLabel: "سعر العرض",
    unitPriceSar: bundle.priceSar,
    quantity: item.quantity,
    stockCount: availableSets(bundle.stockCount, bundle.parts),
    houseLimit: cartQuantityLimit,
  })];
}

function catalogLine(item: Extract<CartItem, { kind: "catalog" }>, products: readonly Product[]): CartLine[] {
  const product = products.find((entry) => entry.id === item.productId);
  const offer = product?.offers.find((entry) => entry.sizeMl === item.sizeMl);
  if (!product || !offer) return [];
  return [line({
    key: cartLineKey(item),
    titleAr: product.nameAr,
    titleEn: product.nameEn,
    detail: `${item.sizeMl} مل`,
    unitLabel: "سعر الزجاجة",
    unitPriceSar: offer.priceSar,
    quantity: item.quantity,
    stockCount: offer.stockCount,
    houseLimit: cartQuantityLimit,
  })];
}

function line(input: Omit<CartLine, "quantityLimit"> & { houseLimit: number }): CartLine {
  const quantityLimit = input.stockCount === null ? input.houseLimit : Math.min(input.stockCount, input.houseLimit);
  return {
    key: input.key,
    titleAr: input.titleAr,
    titleEn: input.titleEn,
    detail: input.detail,
    unitLabel: input.unitLabel,
    unitPriceSar: input.unitPriceSar,
    quantity: input.quantity,
    quantityLimit,
    stockCount: input.stockCount,
  };
}
