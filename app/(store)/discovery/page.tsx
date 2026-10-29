import { Suspense } from "react";
import { DiscoveryShop } from "@/components/discovery/discovery-shop";
import { PageHero } from "@/components/layout/page-hero";
import { brand } from "@/lib/brand";
import { getDiscoverySet } from "@/lib/db/discovery";
import { listPublishedProducts } from "@/lib/db/products";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "مجموعة الاكتشاف",
  description: `عيّنات 2 مل ومجموعة اكتشاف ${brand.name}، لتجربة العطر على الجلد قبل الزجاجة.`,
  path: "/discovery",
});

export default function DiscoveryPage() {
  return (
    <>
      <PageHero
        eyebrow="العيّنات"
        title="مجموعة الاكتشاف"
        description="قارورة صغيرة من 2 مل، أو المجموعة كاملة. الثمن يُحسب في الدار، لا في المتصفح."
      />
      <div className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
        <Suspense fallback={<div className="h-40 bg-paper" aria-hidden="true" />}>
          <DiscoveryFromDb />
        </Suspense>
      </div>
    </>
  );
}

async function DiscoveryFromDb() {
  const products = await listPublishedProducts();
  const discoverySet = await getDiscoverySet(products);
  return <DiscoveryShop products={products} discoverySet={discoverySet} />;
}
