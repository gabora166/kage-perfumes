import assert from "node:assert/strict";
import test from "node:test";

const memory = new Map<string, string>();

Object.assign(globalThis, {
  window: {
    localStorage: {
      getItem(key: string): string | null {
        return memory.get(key) ?? null;
      },
      setItem(key: string, value: string): void {
        memory.set(key, value);
      },
    },
  },
});

test("the cart stores a bottle and a sample, then changes quantity without a server price", async () => {
  const store = await import("./cart-store.ts");
  assert.deepEqual(store.getCartServerSnapshot(), []);
  store.addCatalogItem({ productId: "layl", sizeMl: 50 });
  store.addSampleItem({ productId: "layl" });
  store.updateStoredQuantity("catalog:layl:50", 2);
  const items = store.getCartSnapshot();
  assert.deepEqual(items.map((item) => `${item.kind}:${item.quantity}`), ["catalog:2", "sample:1"]);
  assert.equal("priceSar" in items[0], false);
  store.removeStoredItem("sample:layl");
  assert.deepEqual(store.getCartSnapshot().map((item) => item.kind), ["catalog"]);
  assert.deepEqual(store.getCartServerSnapshot(), []);
  store.clearStoredCart();
});
