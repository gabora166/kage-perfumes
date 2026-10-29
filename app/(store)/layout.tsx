import { Suspense, type ReactNode } from "react";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StoreChrome } from "@/components/motion/store-chrome";
import { StoreMotion } from "@/components/motion/store-motion";
import { listStoreBundles } from "@/lib/db/bundles";
import { getDiscoverySet } from "@/lib/db/discovery";
import { listPublishedProducts } from "@/lib/db/products";

type StoreLayoutProps = {
  children: ReactNode;
};

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-paper" />}>
      <StoreFrame>{children}</StoreFrame>
    </Suspense>
  );
}

async function StoreFrame({ children }: StoreLayoutProps) {
  const products = await listPublishedProducts();
  const discoverySet = await getDiscoverySet(products);
  const bundles = await listStoreBundles();
  return (
    <CartProvider products={products} discoverySet={discoverySet} bundles={bundles}>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[90] focus:bg-seal focus:px-4 focus:py-2 focus:text-ivory"
      >
        تخطي إلى المحتوى
      </a>
      <SiteHeader />
      <main id="content" className="flex-1 bg-paper text-ivory">
        <Suspense fallback={<div className="min-h-[40svh] bg-paper" aria-busy="true" />}>
          <StoreMotion>{children}</StoreMotion>
        </Suspense>
      </main>
      <SiteFooter />
      <StoreChrome />
    </CartProvider>
  );
}
