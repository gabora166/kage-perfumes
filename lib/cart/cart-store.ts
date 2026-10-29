"use client";

import type { Concentration } from "@/lib/catalog/labels";
import { bottleSizes } from "@/lib/catalog/types";
import type { BottleSize } from "@/lib/catalog/types";
import { blendLimits, isBlendNoteId } from "@/lib/pricing/custom-blend";

export type CatalogCartItem = {
  kind: "catalog";
  productId: string;
  sizeMl: BottleSize;
  quantity: number;
};

export type CustomCartItem = {
  kind: "custom";
  id: string;
  sizeMl: BottleSize;
  concentration: Concentration;
  noteIds: string[];
  quantity: number;
};

export type SampleCartItem = {
  kind: "sample";
  productId: string;
  quantity: number;
};

export type DiscoveryCartItem = {
  kind: "discovery";
  quantity: number;
};

export type BundleCartItem = {
  kind: "bundle";
  bundleId: string;
  quantity: number;
};

export type CartItem = CatalogCartItem | CustomCartItem | SampleCartItem | DiscoveryCartItem | BundleCartItem;

const storageKey = "ateeqperfumes.cart";
export const cartQuantityLimit = 6;
export const discoveryQuantityLimit = 2;
const maxQuantity = cartQuantityLimit;
const emptyItems: CartItem[] = [];

let items: CartItem[] = emptyItems;
let isHydrated = false;
const listeners = new Set<() => void>();

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCartSnapshot(): CartItem[] {
  if (!isHydrated) {
    isHydrated = true;
    items = readStorage();
  }
  return items;
}

export function getCartServerSnapshot(): CartItem[] {
  return emptyItems;
}

export function cartLineKey(item: CartItem): string {
  if (item.kind === "catalog") return `catalog:${item.productId}:${item.sizeMl}`;
  if (item.kind === "sample") return `sample:${item.productId}`;
  if (item.kind === "discovery") return "discovery";
  if (item.kind === "bundle") return `bundle:${item.bundleId}`;
  return `custom:${item.id}`;
}

export function cartSignature(items: CartItem[]): string {
  return items.map((item) => `${cartLineKey(item)}:${item.quantity}`).join("|");
}

export function addCatalogItem(input: { productId: string; sizeMl: BottleSize }): void {
  const current = getCartSnapshot();
  const key = cartLineKey({ kind: "catalog", ...input, quantity: 1 });
  const existing = current.find((item) => cartLineKey(item) === key);
  if (!existing) {
    commit([...current, { kind: "catalog", productId: input.productId, sizeMl: input.sizeMl, quantity: 1 }]);
    return;
  }
  commit(current.map((item) => {
    if (cartLineKey(item) !== key) return item;
    return { ...item, quantity: Math.min(item.quantity + 1, maxQuantity) };
  }));
}

export function addCustomItem(input: {
  sizeMl: BottleSize;
  concentration: Concentration;
  noteIds: string[];
}): void {
  const noteIds = [...new Set(input.noteIds)].sort();
  const id = `${input.sizeMl}|${input.concentration}|${noteIds.join(",")}`;
  const nextItem: CustomCartItem = {
    kind: "custom",
    id,
    sizeMl: input.sizeMl,
    concentration: input.concentration,
    noteIds,
    quantity: 1,
  };
  const current = getCartSnapshot();
  const key = cartLineKey(nextItem);
  const existing = current.find((item) => cartLineKey(item) === key);
  if (!existing) {
    commit([...current, nextItem]);
    return;
  }
  commit(current.map((item) => {
    if (cartLineKey(item) !== key) return item;
    return { ...item, quantity: Math.min(item.quantity + 1, maxQuantity) };
  }));
}

export function addSampleItem(input: { productId: string }): void {
  addQuantityItem({ kind: "sample", productId: input.productId, quantity: 1 });
}

export function addDiscoveryItem(): void {
  addQuantityItem({ kind: "discovery", quantity: 1 });
}

export function addBundleItem(input: { bundleId: string }): void {
  addQuantityItem({ kind: "bundle", bundleId: input.bundleId, quantity: 1 });
}

export function updateStoredQuantity(key: string, quantity: number): void {
  const current = getCartSnapshot();
  if (quantity < 1) {
    commit(current.filter((item) => cartLineKey(item) !== key));
    return;
  }
  commit(current.map((item) => {
    if (cartLineKey(item) !== key) return item;
    const limit = item.kind === "discovery" ? discoveryQuantityLimit : maxQuantity;
    return { ...item, quantity: Math.min(quantity, limit) };
  }));
}

export function removeStoredItem(key: string): void {
  commit(getCartSnapshot().filter((item) => cartLineKey(item) !== key));
}

export function clearStoredCart(): void {
  commit(emptyItems);
}

function addQuantityItem(nextItem: SampleCartItem | DiscoveryCartItem | BundleCartItem): void {
  const current = getCartSnapshot();
  const key = cartLineKey(nextItem);
  const limit = nextItem.kind === "discovery" ? discoveryQuantityLimit : maxQuantity;
  const existing = current.find((item) => cartLineKey(item) === key);
  if (!existing) {
    commit([...current, nextItem]);
    return;
  }
  commit(current.map((item) => {
    if (cartLineKey(item) !== key) return item;
    return { ...item, quantity: Math.min(item.quantity + 1, limit) };
  }));
}

function commit(next: CartItem[]): void {
  items = next.length === 0 ? emptyItems : next;
  window.localStorage.setItem(storageKey, JSON.stringify(items));
  listeners.forEach((listener) => listener());
}

function readStorage(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return emptyItems;
    const parsed = sanitizeCart(JSON.parse(stored) as unknown);
    return parsed.length === 0 ? emptyItems : parsed;
  } catch {
    return emptyItems;
  }
}

function sanitizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): CartItem[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as Record<string, unknown>;
    const quantity = record.quantity;
    if (typeof quantity !== "number" || quantity < 1) return [];
    const safeQuantity = Math.min(Math.floor(quantity), maxQuantity);
    if (record.kind === "sample" && typeof record.productId === "string" && record.productId.length <= 80) {
      return [{ kind: "sample", productId: record.productId, quantity: safeQuantity }];
    }
    if (record.kind === "discovery") return [{ kind: "discovery", quantity: Math.min(safeQuantity, 2) }];
    if (record.kind === "bundle" && typeof record.bundleId === "string" && record.bundleId.length > 0 && record.bundleId.length <= 80) {
      return [{ kind: "bundle", bundleId: record.bundleId, quantity: safeQuantity }];
    }
    const sizeMl = record.sizeMl;
    if (typeof sizeMl !== "number" || !isBottleSize(sizeMl)) return [];
    if (record.kind === "catalog" && typeof record.productId === "string") {
      return [{ kind: "catalog", productId: record.productId, sizeMl, quantity: safeQuantity }];
    }
    if (record.kind !== "custom" || typeof record.id !== "string") return [];
    if (record.concentration !== "eau-de-parfum" && record.concentration !== "extrait") return [];
    if (!Array.isArray(record.noteIds)) return [];
    const noteIds = record.noteIds.filter((id): id is string => typeof id === "string" && isBlendNoteId(id));
    if (noteIds.length < blendLimits.minimumNotes || noteIds.length > blendLimits.maximumNotes) return [];
    return [{
      kind: "custom",
      id: record.id,
      sizeMl,
      concentration: record.concentration,
      noteIds,
      quantity: safeQuantity,
    }];
  });
}

function isBottleSize(value: number): value is BottleSize {
  return bottleSizes.some((size) => size === value);
}
