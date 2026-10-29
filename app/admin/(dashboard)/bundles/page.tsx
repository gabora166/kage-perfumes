import { Suspense } from "react";
import { BundleManager } from "@/components/admin/bundle-manager";
import type { BundleProductChoice } from "@/components/admin/bundle-manager";
import { AdminFallback } from "@/components/admin/admin-fallback";
import { isBottleSize } from "@/lib/catalog/bundles";
import { listBundles } from "@/lib/db/bundles";
import { listAllProducts } from "@/lib/db/products";

export const metadata = {
  title: "الباندل",
};

export default function AdminBundlesPage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Bundles />
    </Suspense>
  );
}

async function Bundles() {
  const bundles = await listBundles();
  const products = await listAllProducts();
  const choices: BundleProductChoice[] = products.flatMap((product) => {
    if (!product.isPublished) return [];
    const offers = product.offers.flatMap((offer) => {
      if (!offer.isListed || !isBottleSize(offer.sizeMl)) return [];
      return [{ sizeMl: offer.sizeMl, priceSar: offer.priceSar, stockCount: offer.stockCount }];
    });
    if (offers.length === 0) return [];
    return [{ id: product.id, nameAr: product.nameAr, offers }];
  });
  return <BundleManager bundles={bundles} products={choices} />;
}
