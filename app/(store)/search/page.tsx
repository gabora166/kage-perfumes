import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import { PageHero } from "@/components/layout/page-hero";
import { SearchForm } from "@/components/search/search-form";
import { brand } from "@/lib/brand";
import { searchProducts } from "@/lib/catalog/search";
import { listPublishedProducts } from "@/lib/db/products";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "بحث",
  description: `ابحث في عطور ${brand.name} بالاسم العربي أو اللاتيني أو النوتات.`,
  path: "/search",
});

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <>
      <PageHero
        eyebrow="البحث"
        title="بحث"
        description="اسم الزجاجة، اسمها اللاتيني، أو نوتة مثل العنبر والعود والورد."
      />
      <Suspense fallback={<div className="h-40" aria-hidden="true" />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function SearchResults({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 80);
  const products = query ? searchProducts(await listPublishedProducts(), query) : [];
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
      <SearchForm query={query} />
      {query.length < 2 ? (
        <p className="mt-8 text-mist">اكتب حرفين على الأقل للبحث في الأسماء والنوتات المنشورة.</p>
      ) : null}
      {query.length > 1 && products.length === 0 ? (
        <div className="mt-12 border-t border-border pt-10">
          <p className="font-arabic-display text-3xl text-ivory md:text-4xl">
            لا توجد زجاجة بهذا الاسم أو هذه النوتة.
          </p>
          <p className="mt-3 max-w-md leading-7 text-mist">
            جرّب اسمًا أقصر، أو تصفّح المجموعة كاملة بحسب العائلة والحجم.
          </p>
          <Link href="/catalog" className="mt-6 inline-flex min-h-11 items-center text-brass">
            العودة إلى العطور
          </Link>
        </div>
      ) : null}
      {products.length > 0 ? (
        <>
          <p className="mt-8 text-sm text-mist">
            {products.length === 1 ? "نتيجة واحدة" : `${products.length} نتائج`}
          </p>
          <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} tone="dark" />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
