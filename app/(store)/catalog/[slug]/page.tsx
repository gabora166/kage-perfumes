import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductDossier } from "@/components/catalog/product-dossier";
import { familyLabels } from "@/lib/catalog/labels";
import { ProductJsonLd } from "@/components/catalog/product-json-ld";
import { ProductPurchase } from "@/components/catalog/product-purchase";
import { ProductVoices } from "@/components/catalog/product-voices";
import { RitualSection } from "@/components/catalog/ritual-section";
import { Reveal } from "@/components/motion/reveal";
import { listVisibleReviews } from "@/lib/db/reviews";
import { getProductBySlug, getRitualCompanions } from "@/lib/db/products";
import { summarizeReviews } from "@/lib/reviews/voice";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "العطر" };
  return buildPageMetadata({
    title: product.nameAr,
    description: product.descriptionAr,
    path: `/catalog/${product.slug}`,
  });
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductFromDb params={params} />
    </Suspense>
  );
}

async function ProductFromDb({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const companions = await getRitualCompanions(product);
  const reviews = await listVisibleReviews(product.id);
  return (
    <article className="bg-paper px-5 pb-28 pt-24 md:px-8 md:pb-20 md:pt-28">
      <div className="mx-auto max-w-7xl">
        <Reveal variant="fade" delay={0.04}>
          <nav aria-label="مسار التصفح" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-mist">
            <Link href="/catalog" className="min-h-11 inline-flex items-center text-brass transition-colors hover:text-ivory">
              الكتالوج
            </Link>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <Link
              href={`/catalog?family=${product.family}`}
              className="min-h-11 inline-flex items-center text-brass transition-colors hover:text-ivory"
            >
              {familyLabels[product.family].ar}
            </Link>
            <span aria-hidden="true" className="text-border">
              /
            </span>
            <span className="min-h-11 inline-flex items-center text-ivory">{product.nameAr}</span>
          </nav>
        </Reveal>
        <div className="mt-6 md:mt-8">
          <ProductJsonLd product={product} />
          <ProductPurchase product={product} reviewSummary={summarizeReviews(reviews)} />
          <ProductDossier product={product} />
          <ProductVoices reviews={reviews} />
          <RitualSection product={product} companions={companions} />
        </div>
      </div>
    </article>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="min-h-svh bg-paper px-5 pt-24 md:px-8 md:pt-28" aria-busy="true" aria-label="جاري تحميل العطر">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-12 md:gap-12">
        <div className="space-y-4 md:col-span-5">
          <div className="skeleton-pulse h-3 w-40" />
          <div className="skeleton-pulse h-12 w-3/4" />
          <div className="skeleton-pulse h-6 w-1/2" />
          <div className="skeleton-pulse h-24 w-full" />
        </div>
        <div className="skeleton-pulse aspect-[3/4] md:col-span-7" />
      </div>
    </div>
  );
}
