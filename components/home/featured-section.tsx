import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/brand/section-heading";
import { ProductCard } from "@/components/catalog/product-card";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import type { Product } from "@/lib/catalog/types";

type FeaturedSectionProps = {
  products: Product[];
  title?: string;
  note?: string;
};

export function FeaturedSection({
  products,
  title = "مختارات الدار",
  note = "الاسم، الحجم المتاح، والسعر كما تحسبه الدار.",
}: FeaturedSectionProps) {
  if (products.length === 0) return null;
  return (
    <section className="washi relative px-5 py-16 text-ink md:px-8 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-ink/15 to-transparent"
      />
      <div className="mx-auto max-w-7xl">
        <Reveal variant="fade">
          <SectionHeading
            tone="light"
            eyebrow="House selection"
            title={title}
            description={note}
            action={
              <Link
                href="/catalog"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-seal transition-colors hover:text-ink"
              >
                كل العطور
                <ArrowLeft className="size-4" />
              </Link>
            }
          />
        </Reveal>
        <Stagger className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3 xl:gap-y-16" delay={0.04}>
          {products.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
