import Image from "next/image";
import { FragrancePyramid } from "@/components/catalog/fragrance-pyramid";
import { Reveal } from "@/components/motion/reveal";
import { buildNoteTiers } from "@/lib/catalog/ingredients";
import { imageAlt } from "@/lib/catalog/images";
import type { Product } from "@/lib/catalog/types";

type ProductDossierProps = {
  product: Product;
};

export function ProductDossier({ product }: ProductDossierProps) {
  const hasLongevity = product.longevitySpan.trim().length > 0;
  const hasSillage = product.sillageSpan.trim().length > 0;
  const hasMood = product.mood.trim().length > 0;
  const hasGuide =
    product.occasion.trim().length > 0 || product.season.trim().length > 0 || product.attire.trim().length > 0;
  const hasNotes = buildNoteTiers(product.notes).length > 0;
  const pyramidImage = product.images.pyramid;
  const hasPyramid = Boolean(pyramidImage) || hasNotes;
  const hasImpression = product.sensoryVibe.trim().length > 0;
  if (!hasPyramid && !hasImpression && !hasLongevity && !hasSillage && !hasMood && !hasGuide) return null;

  return (
    <section className="relative mt-14 overflow-hidden border-t border-border pt-12 md:mt-16 md:pt-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 end-[-10%] size-[min(28rem,70vw)] rounded-full bg-[radial-gradient(circle,rgba(141,32,40,0.09)_0%,transparent_68%)] mist-drift-slow"
      />
      <Reveal variant="fade">
        <header className="relative max-w-2xl">
          <p className="text-[0.7rem] tracking-[0.2em] text-brass uppercase">Fragrance</p>
          <h2 className="mt-2 font-arabic-display text-3xl leading-tight text-ivory md:text-4xl">
            الإحساس والهرم العطري
          </h2>
          <p className="mt-3 text-sm leading-7 text-mist">
            وصف الدار للعطر، ثم طبقاته العطرية بصور تمثيلية للمكوّنات المعتمدة.
          </p>
        </header>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-8 xl:gap-x-12">
          <div className="order-1 space-y-6 lg:col-span-5 lg:self-start">
            {hasImpression ? (
              <div>
                <p className="text-sm text-mist">الإحساس العام</p>
                <p className="mt-3 font-arabic-display text-2xl leading-relaxed text-ivory md:text-[1.75rem]">
                  {product.sensoryVibe}
                </p>
              </div>
            ) : null}

            {hasLongevity || hasSillage ? (
              <div>
                <p className="text-sm leading-6 text-mist">
                  وصف الدار للثبات والفوحان — انطباع وصفي، وليس قياسًا معمليًا.
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-4">
                  {hasLongevity ? (
                    <div>
                      <dt className="text-sm text-mist">الثبات</dt>
                      <dd className="mt-1 font-arabic-display text-xl text-ivory">{product.longevitySpan}</dd>
                    </div>
                  ) : null}
                  {hasSillage ? (
                    <div>
                      <dt className="text-sm text-mist">الفوحان</dt>
                      <dd className="mt-1 font-arabic-display text-xl text-ivory">{product.sillageSpan}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}

            {hasMood ? (
              <div>
                <p className="text-sm text-mist">الإحساس العطري</p>
                <p className="mt-1.5 font-arabic-display text-xl leading-relaxed text-ivory">{product.mood}</p>
              </div>
            ) : null}
          </div>

          <div className="order-2 lg:col-span-7 lg:row-span-2 lg:self-start">
            {pyramidImage ? (
              <figure className="overflow-hidden border border-border/80 bg-ink">
                <div className="relative aspect-[4/5] w-full md:aspect-[5/6]">
                  <Image
                    src={pyramidImage}
                    alt={imageAlt(product, "pyramid")}
                    fill
                    sizes="(min-width: 1024px) 36rem, 92vw"
                    className="object-contain object-center p-3 md:p-4"
                  />
                </div>
                <figcaption className="border-t border-border/70 px-4 py-3 text-sm text-mist">
                  الهرم العطري — {product.nameAr}
                </figcaption>
              </figure>
            ) : hasNotes ? (
              <FragrancePyramid notes={product.notes} embedded />
            ) : null}
          </div>

          {hasGuide ? (
            <div className="order-3 border-t border-border pt-6 lg:col-span-5 lg:self-start">
              <WearGuide
                occasion={product.occasion}
                season={product.season}
                attire={product.attire}
              />
            </div>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}

function WearGuide({
  occasion,
  season,
  attire,
}: {
  occasion: string;
  season: string;
  attire: string;
}) {
  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.2em] text-brass uppercase">Wear</p>
      <h3 className="mt-2 font-arabic-display text-2xl text-ivory">دليل الارتداء</h3>
      <dl className="mt-4 space-y-3">
        <GuideItem label="المناسبات" value={occasion} />
        <GuideItem label="الوقت الأنسب" value={season} />
        <GuideItem label="الملبس" value={attire} />
      </dl>
    </div>
  );
}

function GuideItem({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="border-t border-border pt-3">
      <dt className="text-sm text-mist">{label}</dt>
      <dd className="mt-1 font-arabic-display text-lg leading-relaxed text-ivory">{value}</dd>
    </div>
  );
}
