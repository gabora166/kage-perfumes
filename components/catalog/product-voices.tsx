import Image from "next/image";
import { ReviewStars } from "@/components/catalog/review-stars";
import { isCustomerReviewImage } from "@/lib/reviews/voice";
import type { ProductReview } from "@/lib/reviews/voice";

type ProductVoicesProps = {
  reviews: ProductReview[];
};

export function ProductVoices({ reviews }: ProductVoicesProps) {
  const screenshots = customerImages(reviews);
  const written = reviews.filter((review) => review.kind === "written" && review.body.trim().length > 0);
  if (screenshots.length === 0 && written.length === 0) return null;
  return (
    <section id="voices" className="mt-14 scroll-mt-32 border-t border-border pt-12 md:mt-16 md:pt-14">
      <p className="text-[0.7rem] tracking-[0.2em] text-brass uppercase">Voices</p>
      <h2 className="mt-2 font-arabic-display text-3xl text-ivory md:text-4xl">كلمات وصلت الدار</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-mist">
        تنشر الدار النص كما وصلها. الموقع لا يربطه بطلب، ولا يعدّه مراجعة مستقلة.
      </p>
      {screenshots.length > 0 ? (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {screenshots.map((review) => (
            <li key={review.id} className="border-t border-border pt-5">
              <p className="text-xs text-brass">صورة أرسلها عميل</p>
              <p className="mt-1 text-xs text-mist">ليست صورة منتج الدار.</p>
              <a href={review.imagePath} target="_blank" rel="noreferrer" className="mt-3 block">
                <span className="relative block aspect-[3/4] bg-ink">
                  <Image
                    src={review.imagePath}
                    alt={`صورة أرسلها عميل عن ${review.productName}، وليست صورة المنتج`}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-contain object-center"
                  />
                </span>
              </a>
              {review.caption ? <p className="mt-3 text-sm leading-7 text-mist">{review.caption}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {written.length > 0 ? (
        <ul className="mt-10 space-y-4">
          {written.map((review) => (
            <li key={review.id} className="border-t border-border py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-arabic-display text-2xl">{review.authorName}</p>
                {review.stars ? <ReviewStars value={review.stars} /> : null}
              </div>
              <p className="mt-3 leading-8 text-mist">{review.body}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function customerImages(reviews: ProductReview[]): Array<ProductReview & { imagePath: string }> {
  return reviews.flatMap((review) => {
    if (review.kind !== "screenshot" || !isCustomerReviewImage(review.imagePath)) return [];
    return [{ ...review, imagePath: review.imagePath }];
  });
}
