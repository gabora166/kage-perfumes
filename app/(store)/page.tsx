import { Suspense } from "react";
import { BlendBand } from "@/components/home/blend-band";
import { BrandStory } from "@/components/home/brand-story";
import { BundleSection } from "@/components/home/bundle-section";
import { CollectionsSection } from "@/components/home/collections-section";
import { DiscoveryBand } from "@/components/home/discovery-band";
import { FeaturedSection } from "@/components/home/featured-section";
import { FinalPaths } from "@/components/home/final-paths";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { SceneBridge } from "@/components/motion/scene-bridge";
import { brand, brandSeo } from "@/lib/brand";
import { listStoreBundles } from "@/lib/db/bundles";
import { getDiscoverySet } from "@/lib/db/discovery";
import { listPublishedProducts } from "@/lib/db/products";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Product } from "@/lib/catalog/types";

export const metadata = buildPageMetadata({
  description: brandSeo.description,
  path: "/",
});

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-paper" />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const products = await listPublishedProducts();
  const discoverySet = await getDiscoverySet(products);
  const bundles = await listStoreBundles();
  const featured = products.filter((product) => product.isFeatured);
  const discoveryReady = Boolean(
    discoverySet?.isPublished && discoverySet.stockCount > 0 && discoverySet.vials.length >= 2,
  );
  return (
    <>
      <Hero product={selectHeroProduct(products)} />
      <TrustStrip />
      <SceneBridge from="night" to="washi" withSeal />
      <FeaturedSection
        products={featured.length > 0 ? featured : products}
        title={featured.length > 0 ? "مختارات الدار" : "المجموعة"}
        note={
          featured.length > 0
            ? "الاسم، الحجم المتاح، والسعر كما تحسبه الدار."
            : `العطور المنشورة في ${brand.name}، بالحجم والسعر.`
        }
      />
      <SceneBridge from="washi" to="night" />
      <CollectionsSection />
      {discoveryReady && discoverySet ? <DiscoveryBand discoverySet={discoverySet} /> : null}
      {bundles.length > 0 ? <BundleSection bundles={bundles} /> : null}
      <BlendBand />
      <SceneBridge from="night" to="washi" />
      <BrandStory />
      <SceneBridge from="washi" to="night" />
      <FinalPaths />
    </>
  );
}

function selectHeroProduct(products: readonly Product[]): Product | null {
  const stocked = products.filter((product) => product.offers.some((offer) => offer.stockCount > 0));
  const pool = stocked.length > 0 ? stocked : products;
  return pool.find((product) => product.isFeatured) ?? pool[0] ?? null;
}
