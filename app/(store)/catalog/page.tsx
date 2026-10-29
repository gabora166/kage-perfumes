import { Suspense } from "react";
import { CatalogExplorer } from "@/components/catalog/catalog-explorer";
import { CatalogHero } from "@/components/catalog/catalog-hero";
import { brand } from "@/lib/brand";
import { listPublishedProducts } from "@/lib/db/products";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "العطور",
  description: `تصفح عطور ${brand.name} حسب العائلة العطرية وحجم الزجاجة والسعر.`,
  path: "/catalog",
});

export default function CatalogPage() {
  return (
    <div className="catalog-obsidian min-h-svh">
      <CatalogHero />
      <Suspense fallback={<CatalogFallback />}>
        <CatalogFromDb />
      </Suspense>
    </div>
  );
}

async function CatalogFromDb() {
  const products = await listPublishedProducts();
  return <CatalogExplorer products={products} />;
}

function CatalogFallback() {
  return (
    <div className="px-5 pb-24 md:px-8" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-7xl">
        <div className="h-12 max-w-xl border border-border bg-panel" aria-hidden="true" />
        <div className="mt-6 flex flex-wrap gap-2 border-y border-border py-5" aria-hidden="true">
          {["a", "b", "c", "d"].map((key) => (
            <div key={key} className="h-11 w-24 border border-border bg-panel" />
          ))}
        </div>
        <div className="mt-3 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {["one", "two", "three"].map((item) => (
            <div key={item} className="overflow-hidden rounded-[4px] border border-border/60" aria-hidden="true">
              <div className="aspect-[4/5] bg-panel" />
              <div className="space-y-3 px-4 py-4">
                <div className="mx-auto h-3 w-24 bg-panel" />
                <div className="mx-auto h-7 w-36 bg-panel" />
                <div className="mx-auto h-3 w-28 bg-panel" />
                <div className="h-10 w-full bg-panel" />
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only">جارٍ تحميل العطور</span>
      </div>
    </div>
  );
}
