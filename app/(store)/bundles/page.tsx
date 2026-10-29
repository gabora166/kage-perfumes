import { Suspense } from "react";
import { BundleBoard } from "@/components/bundles/bundle-board";
import { PageHero } from "@/components/layout/page-hero";
import { brand } from "@/lib/brand";
import { listStoreBundles } from "@/lib/db/bundles";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "عروض الباندل",
  description: `عروض الباندل في ${brand.name}: زجاجات مجتمعة بسعر واحد أقل من مجموع أسعارها في الدار.`,
  path: "/bundles",
});

export default function BundlesPage() {
  return (
    <>
      <PageHero
        eyebrow="الباندل"
        title="عروض الباندل"
        description="كل عرض يجمع زجاجات منشورة بسعر واحد تحدده الدار. السعر يبقى ظاهرًا بجانب مجموع الزجاجات لو اشتريتها منفردة."
      />
      <div className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
        <Suspense fallback={<div className="h-40 bg-paper" aria-hidden="true" />}>
          <BundlesFromDb />
        </Suspense>
      </div>
    </>
  );
}

async function BundlesFromDb() {
  const bundles = await listStoreBundles();
  return <BundleBoard bundles={bundles} />;
}
