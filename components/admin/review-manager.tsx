"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ReviewStars } from "@/components/catalog/review-stars";
import type { ProductReview } from "@/lib/reviews/voice";

type ReviewProduct = {
  id: string;
  nameAr: string;
};

type ReviewManagerProps = {
  products: ReviewProduct[];
  reviews: ProductReview[];
};

export function ReviewManager({ products, reviews }: ReviewManagerProps) {
  const router = useRouter();
  const [kind, setKind] = useState<"written" | "screenshot">("written");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreate(formData: FormData): Promise<void> {
    setError("");
    setIsSaving(true);
    const response = await fetch("/api/admin/reviews", { method: "POST", body: formData });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(body.error ?? "تعذّر حفظ الرأي.");
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    router.refresh();
  }

  async function handleVisibility(id: string, isVisible: boolean): Promise<void> {
    const response = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible }),
    });
    if (!response.ok) {
      setError("تعذّر تحديث الظهور.");
      return;
    }
    router.refresh();
  }

  async function handleClearImage(id: string): Promise<void> {
    const response = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearImage: true }),
    });
    if (!response.ok) {
      setError("تعذّر إزالة الصورة.");
      return;
    }
    router.refresh();
  }

  async function handleDelete(id: string): Promise<void> {
    const response = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("تعذّر حذف الرأي.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-arabic-display text-5xl">الآراء</h1>
      <p className="mt-3 max-w-2xl leading-8 text-mist">
        ارفع سكرين واتساب بعد قص رقم العميل، أو اكتب الرأي كما وصل الدار. العميل لا يضيف تقييمًا من الموقع.
      </p>
      <form action={handleCreate} className="mt-8 max-w-xl space-y-4 border border-white/10 p-5">
        <label className="block text-sm">
          العطر
          <select name="productId" required className="mt-2 w-full border border-white/15 bg-ink px-3 py-2">
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.nameAr}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          النوع
          <select
            name="kind"
            value={kind}
            onChange={(event) => setKind(event.target.value === "screenshot" ? "screenshot" : "written")}
            className="mt-2 w-full border border-white/15 bg-ink px-3 py-2"
          >
            <option value="written">رأي مكتوب</option>
            <option value="screenshot">سكرين واتساب</option>
          </select>
        </label>
        {kind === "written" ? (
          <>
            <label className="block text-sm">
              الاسم الأول
              <input name="authorName" required className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-gold" />
            </label>
            <label className="block text-sm">
              النجوم
              <select name="stars" required className="mt-2 w-full border border-white/15 bg-ink px-3 py-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <option key={stars} value={stars}>{stars}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              الرأي
              <textarea name="body" required rows={3} className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-gold" />
            </label>
          </>
        ) : (
          <>
            <label className="block text-sm">
              صورة الرسالة
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp" required className="mt-2 block w-full text-sm" />
            </label>
            <p className="text-sm text-mist">اقصص رقم العميل وصورته. لا ترفع صورة منتج آخر، ولا صورة لا تخص هذا العطر.</p>
            <label className="block text-sm">
              سطر تحت الصورة
              <input name="caption" required placeholder="القاهرة · بعد أسبوعين" className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-gold" />
            </label>
          </>
        )}
        <label className="block text-sm">
          الترتيب
          <input name="sortOrder" type="number" min={0} max={999} defaultValue={0} className="mt-2 w-28 border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-gold" />
        </label>
        {error ? <p className="text-gold-bright">{error}</p> : null}
        <button type="submit" disabled={isSaving} className="h-11 bg-gold px-6 text-sm text-ink disabled:opacity-40">
          {isSaving ? "جارٍ الحفظ" : "أضف الرأي"}
        </button>
      </form>
      <ul className="mt-10 space-y-4">
        {reviews.length === 0 ? <li className="text-mist">لا آراء بعد.</li> : null}
        {reviews.map((review) => (
          <li key={review.id} className="border border-white/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gold">{review.productName}</p>
                {review.kind === "written" ? (
                  <>
                    <p className="mt-2 font-arabic-display text-2xl">{review.authorName}</p>
                    {review.stars ? <div className="mt-2"><ReviewStars value={review.stars} /></div> : null}
                    <p className="mt-2 leading-7">{review.body}</p>
                  </>
                ) : (
                  <>
                    <p className="mt-2">{review.caption}</p>
                    {review.imagePath ? (
                      <a href={review.imagePath} target="_blank" rel="noreferrer" className="mt-3 block w-28">
                        <span className="relative block aspect-[3/4] bg-ink">
                          <Image src={review.imagePath} alt="" fill unoptimized className="object-contain" />
                        </span>
                        <span className="mt-2 inline-block text-sm text-gold">عرض الصورة</span>
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-mist">لا صورة مرفقة.</p>
                    )}
                  </>
                )}
                <p className="mt-2 text-sm text-mist">{reviewStatus(review)} · ترتيب {review.sortOrder}</p>
              </div>
              <div className="flex gap-3 text-sm">
                {review.imagePath ? (
                  <button type="button" onClick={() => { void handleClearImage(review.id); }} className="text-gold">
                    إزالة الصورة
                  </button>
                ) : null}
                <button type="button" onClick={() => { void handleVisibility(review.id, !review.isVisible); }} className="text-gold">
                  {review.isVisible ? "إخفاء" : "إظهار"}
                </button>
                <button type="button" onClick={() => { void handleDelete(review.id); }} className="text-cream/70">حذف</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function reviewStatus(review: ProductReview): string {
  if (review.kind === "screenshot" && !review.imagePath) return "بلا صورة · غير ظاهرة";
  return review.isVisible ? "ظاهر في الصفحة" : "مخفي";
}
