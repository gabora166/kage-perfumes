"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import {
  addBundleItem,
  addCatalogItem,
  addCustomItem,
  addDiscoveryItem,
  addSampleItem,
  cartSignature,
  clearStoredCart,
  getCartServerSnapshot,
  getCartSnapshot,
  removeStoredItem,
  subscribeCart,
  updateStoredQuantity,
} from "@/lib/cart/cart-store";
import type { CartItem } from "@/lib/cart/cart-store";
import type { Concentration } from "@/lib/catalog/labels";
import type { BottleSize, Product } from "@/lib/catalog/types";
import type { BundleOffer } from "@/lib/catalog/bundles";
import type { DiscoverySet } from "@/lib/catalog/samples";
import { buildCartLines, merchandiseTotalSar } from "@/lib/cart/lines";
import type { CartLine } from "@/lib/cart/lines";
import { formatSize } from "@/lib/catalog/money";

export type { CartLine };

type CartContextValue = {
  lines: CartLine[];
  items: CartItem[];
  itemCount: number;
  subtotalSar: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addCatalogItem: (input: { productId: string; sizeMl: BottleSize }) => void;
  addSampleItem: (input: { productId: string }) => void;
  addDiscoveryItem: () => void;
  addBundleItem: (input: { bundleId: string }) => void;
  addCustomItem: (input: { sizeMl: BottleSize; concentration: Concentration; noteIds: string[] }) => void;
  appliedPromo: AppliedPromo | null;
  applyPromo: (code: string) => Promise<string>;
  clearPromo: () => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export type AppliedPromo = {
  code: string;
  discountSar: number;
  signature: string;
};

type CartProviderProps = {
  products: Product[];
  discoverySet: DiscoverySet | null;
  bundles: BundleOffer[];
  children: ReactNode;
};

export function CartProvider({ products, discoverySet, bundles, children }: CartProviderProps) {
  const items = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const openCart = useCallback(() => {
    setNotice(null);
    setIsOpen(true);
  }, []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const dismissNotice = useCallback(() => setNotice(null), []);
  const addCatalog = useCallback((input: { productId: string; sizeMl: BottleSize }) => {
    addCatalogItem(input);
    const product = products.find((entry) => entry.id === input.productId);
    const name = product?.nameAr ?? "الزجاجة";
    setNotice(`أُضيفت ${name}، ${formatSize(input.sizeMl)}، إلى الحقيبة.`);
  }, [products]);
  const addSample = useCallback((input: { productId: string }) => {
    addSampleItem(input);
    const product = products.find((entry) => entry.id === input.productId);
    const name = product?.nameAr ?? "العطر";
    setNotice(`أُضيفت عيّنة 2 مل من ${name} إلى الحقيبة.`);
  }, [products]);
  const addDiscovery = useCallback(() => {
    addDiscoveryItem();
    setNotice("أُضيفت مجموعة الاكتشاف إلى الحقيبة.");
  }, []);
  const addBundle = useCallback((input: { bundleId: string }) => {
    addBundleItem(input);
    const bundle = bundles.find((entry) => entry.id === input.bundleId);
    setNotice(`أُضيف عرض ${bundle?.nameAr ?? "الباندل"} إلى الحقيبة.`);
  }, [bundles]);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const applyPromo = useCallback(async (code: string): Promise<string> => {
    const current = getCartSnapshot();
    const response = await fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: current, promoCode: code, giftWrap: false, giftMessage: "" }),
    });
    const body = (await response.json()) as { error?: string; code?: string; discountSar?: number };
    if (!response.ok || !body.code || typeof body.discountSar !== "number") {
      setAppliedPromo(null);
      return body.error ?? "الرمز غير صالح أو انتهت صلاحيته.";
    }
    setAppliedPromo({ code: body.code, discountSar: body.discountSar, signature: cartSignature(current) });
    return "";
  }, []);
  const clearPromo = useCallback(() => setAppliedPromo(null), []);
  const addCustom = useCallback((input: { sizeMl: BottleSize; concentration: Concentration; noteIds: string[] }) => {
    addCustomItem(input);
    setNotice("أُضيف العطر الخاص إلى الحقيبة.");
  }, []);
  const updateQuantity = useCallback((key: string, quantity: number) => {
    updateStoredQuantity(key, quantity);
  }, []);
  const removeItem = useCallback((key: string) => {
    removeStoredItem(key);
  }, []);
  const clearCart = useCallback(() => {
    clearStoredCart();
    setAppliedPromo(null);
  }, []);
  const lines = useMemo(
    () => buildCartLines(items, products, discoverySet, bundles),
    [bundles, discoverySet, items, products],
  );
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);
  const subtotalSar = merchandiseTotalSar(lines);
  const value = useMemo<CartContextValue>(() => {
    return {
      lines,
      items,
      itemCount,
      subtotalSar,
      isOpen,
      openCart,
      closeCart,
      addCatalogItem: addCatalog,
      addSampleItem: addSample,
      addDiscoveryItem: addDiscovery,
      addBundleItem: addBundle,
      addCustomItem: addCustom,
      appliedPromo: appliedPromo?.signature === cartSignature(items) ? appliedPromo : null,
      applyPromo,
      clearPromo,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [
    addBundle,
    addCatalog,
    addCustom,
    addDiscovery,
    addSample,
    appliedPromo,
    applyPromo,
    clearPromo,
    clearCart,
    closeCart,
    isOpen,
    itemCount,
    items,
    lines,
    openCart,
    removeItem,
    subtotalSar,
    updateQuantity,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {notice ? <AddedNotice message={notice} onOpenCart={openCart} onDismiss={dismissNotice} /> : null}
      <CartDrawer />
    </CartContext.Provider>
  );
}

type AddedNoticeProps = {
  message: string;
  onOpenCart: () => void;
  onDismiss: () => void;
};

function AddedNotice({ message, onOpenCart, onDismiss }: AddedNoticeProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 8000);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);
  return (
    <div
      role="status"
      className="fixed inset-x-4 z-[65] animate-[image-settle_280ms_ease] border border-ink/15 bg-ivory p-4 text-ink shadow-[0_18px_40px_rgba(0,0,0,0.18)] bottom-[max(5.5rem,env(safe-area-inset-bottom))] md:inset-x-auto md:end-6 md:bottom-6 md:w-96"
    >
      <p className="text-sm leading-7">{message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenCart}
          className="pressable inline-flex h-11 items-center bg-ink px-4 text-sm text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal"
        >
          عرض الحقيبة
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="pressable inline-flex h-11 items-center px-4 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal"
        >
          متابعة التصفح
        </button>
      </div>
    </div>
  );
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}

