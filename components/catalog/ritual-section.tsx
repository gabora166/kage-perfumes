import Link from "next/link";
import { ProductCard } from "@/components/catalog/product-card";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import type { Product } from "@/lib/catalog/types";

type RitualSectionProps = {
  product: Product;
  companions: Product[];
};

export function RitualSection({ product, companions }: RitualSectionProps) {
  const discovery = product.offers.some((offer) => offer.sizeMl === 30);
  if (companions.length === 0) return null;
  return (
    <section className="mt-14 border-t border-border pt-12 md:mt-16 md:pt-14">
      <Reveal variant="fade">
        <p className="text-[0.7rem] tracking-[0.2em] text-brass uppercase">Continue</p>
        <h2 className="mt-2 font-arabic-display text-3xl text-ivory md:text-4xl">أكمل طقوسك العطرية</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-mist">
          عطور من عائلات مجاورة، كل واحدة بحجمها وسعرها.
          {discovery ? ` ${product.nameAr} متاح أيضًا في زجاجة 30 مل.` : ""}{" "}
          <Link href="/discovery" className="text-brass underline-offset-4 hover:underline">
            للتجربة الأقصر: عيّنات 2 مل ومجموعة الاكتشاف
          </Link>
          .
        </p>
      </Reveal>
      <Stagger className="mt-7 grid gap-5 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        {companions.map((item) => (
          <StaggerItem key={item.id}>
            <p className="mb-2 text-sm text-brass">
              {item.offers.some((offer) => offer.sizeMl === 30) ? "زجاجة سفر · 30 مل" : "زجاجة مكملة"}
            </p>
            <ProductCard product={item} tone="dark" />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
