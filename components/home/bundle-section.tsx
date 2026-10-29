import { ArrowLeft } from "lucide-react";
import { BundleBoard } from "@/components/bundles/bundle-board";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import type { BundleOffer } from "@/lib/catalog/bundles";

type BundleSectionProps = {
  bundles: BundleOffer[];
};

export function BundleSection({ bundles }: BundleSectionProps) {
  if (bundles.length === 0) return null;
  return (
    <section id="bundles" className="scroll-mt-28 border-t border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal variant="rise">
          <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
            <div>
              <p className="text-sm text-brass">الباندل</p>
              <h2 className="mt-3 font-arabic-display text-5xl text-ivory md:text-6xl">عروض الباندل</h2>
            </div>
            <p className="max-w-md leading-8 text-mist">
              زجاجتان أو أكثر بسعر واحد، أقل من مجموع أسعارها في الدار. يظهر العرض فقط إذا بقي سعره المحفوظ أقل من مجموع الزجاجات الحالية.
            </p>
          </div>
        </Reveal>
        <BundleBoard bundles={bundles} />
        <div className="mt-10">
          <MagneticButton href="/bundles">
            صفحة العروض
            <ArrowLeft className="size-4" />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
