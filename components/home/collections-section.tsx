import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandSeal } from "@/components/brand/brand-seal";
import { SectionHeading } from "@/components/brand/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { brandAssets, collections } from "@/lib/brand";
import type { CollectionId } from "@/lib/brand";
import { cn } from "@/lib/cn";

const art: Record<CollectionId, string> = {
  shadow: brandAssets.collections.shadow,
  ember: brandAssets.collections.ember,
  mist: brandAssets.collections.mist,
  silk: brandAssets.collections.silk,
};

const veil: Record<CollectionId, string> = {
  shadow: "from-ink via-ink/60 to-ink/25",
  ember: "from-[#1a0c0c] via-ink/55 to-[rgba(141,32,40,0.18)]",
  mist: "from-ink via-[#121618]/70 to-ink/20",
  silk: "from-ink via-[#161218]/55 to-[rgba(196,176,138,0.12)]",
};

const accent: Record<CollectionId, string> = {
  shadow: "border-ivory/15 group-hover:border-ivory/30",
  ember: "border-seal/25 group-hover:border-seal/45",
  mist: "border-mist/20 group-hover:border-mist/40",
  silk: "border-brass/25 group-hover:border-brass/45",
};

export function CollectionsSection() {
  return (
    <section id="collections" className="collection-night relative scroll-mt-28 overflow-hidden px-5 py-16 md:px-8 md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_8%,rgba(141,32,40,0.12),transparent_42%)]"
      />
      <div className="relative mx-auto max-w-7xl">
        <Reveal variant="ink">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Collections"
              title="أربع حركات للظل"
              description="عائلات بصرية مستوحاة من الظل والدقة — خشب، جمر، ضباب، وحرير. مرتبطة فقط بما هو منشور في الدار."
            />
            <div className="flex items-center gap-4">
              <BrandSeal size={32} tone="photo" className="rounded-sm" />
              <span aria-hidden="true" className="h-px w-16 bg-gradient-to-l from-seal to-transparent" />
            </div>
          </div>
        </Reveal>

        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" delay={0.05}>
          {collections.map((collection) => (
            <StaggerItem key={collection.id}>
              <Link
                href={collection.href}
                className={cn(
                  "collection-scroll light-sweep group relative flex min-h-[22rem] flex-col overflow-hidden outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-seal md:min-h-[28rem]",
                  `collection-scroll--${collection.id}`,
                )}
              >
                <Image
                  src={art[collection.id]}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.045]"
                />
                <div aria-hidden="true" className={cn("absolute inset-0 bg-gradient-to-t", veil[collection.id])} />
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-3 border transition-colors duration-500",
                    accent[collection.id],
                  )}
                />
                <p
                  className="absolute top-6 end-5 z-[1] font-sans text-[0.62rem] uppercase tracking-[0.55em] text-brass"
                  style={{ writingMode: "vertical-rl" }}
                >
                  {collection.nameEn}
                </p>
                <div className="relative z-[1] mt-auto flex flex-col justify-end p-6 pt-24 md:p-7 md:pt-28">
                  <h3 className="font-arabic-display text-4xl text-ivory md:text-[2.75rem]">{collection.nameAr}</h3>
                  <p className="mt-3 max-w-[15.5rem] text-sm leading-7 text-mist">{collection.blurbAr}</p>
                  <span className="mt-7 inline-flex items-center gap-2 border-t border-ivory/20 pt-4 text-sm text-ivory">
                    ادخل المجموعة
                    <ArrowLeft className="size-4 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-x-1" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
