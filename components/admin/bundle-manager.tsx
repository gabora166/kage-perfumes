"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { comparePriceSar, savingsSar } from "@/lib/catalog/bundles";
import type { BundleOffer } from "@/lib/catalog/bundles";
import { formatPrice } from "@/lib/catalog/money";
import type { BottleSize } from "@/lib/catalog/types";

export type BundleProductChoice = {
  id: string;
  nameAr: string;
  offers: Array<{ sizeMl: BottleSize; priceSar: number; stockCount: number }>;
};

type BundleManagerProps = {
  bundles: BundleOffer[];
  products: BundleProductChoice[];
};

const partSlots = [1, 2, 3, 4] as const;

export function BundleManager({ bundles, products }: BundleManagerProps) {
  const [draftKey, setDraftKey] = useState(0);
  return (
    <div className="grid max-w-4xl gap-10">
      <div>
        <h1 className="font-arabic-display text-5xl">عروض الباندل</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-mist">
          العرض زجاجتان منشورتان على الأقل، بسعر أقل من مجموع أسعارهما الحالية. لا يُحسب خصم تلقائي، ولا يظهر في المتجر إلا إذا بقي أرخص من الزجاجات منفردة.
        </p>
      </div>
      <BundleForm key={draftKey} products={products} onSaved={() => setDraftKey((value) => value + 1)} />
      {bundles.map((bundle) => (
        <BundleForm key={bundle.id} products={products} bundle={bundle} />
      ))}
    </div>
  );
}

function BundleForm({
  products,
  bundle,
  onSaved,
}: {
  products: BundleProductChoice[];
  bundle?: BundleOffer;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const compare = bundle && bundle.isComplete ? comparePriceSar(bundle.parts) : null;

  async function handleSave(formData: FormData): Promise<void> {
    setError("");
    setIsSaving(true);
    const parts = partSlots.flatMap((slot) => {
      const offer = String(formData.get(`offer${slot}`) ?? "");
      if (!offer) return [];
      const [productId, sizeMl] = offer.split(":");
      return [{ productId, sizeMl: Number(sizeMl), quantity: Number(formData.get(`qty${slot}`)) }];
    });
    const response = await fetch("/api/admin/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: bundle?.id,
        nameAr: String(formData.get("nameAr") ?? ""),
        nameEn: String(formData.get("nameEn") ?? ""),
        descriptionAr: String(formData.get("descriptionAr") ?? ""),
        priceSar: Number(formData.get("priceSar")),
        stockCount: Number(formData.get("stockCount")),
        isPublished: formData.get("isPublished") === "on",
        parts,
      }),
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(body.error ?? "تعذّر حفظ العرض.");
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    onSaved?.();
    router.refresh();
  }

  async function handleDelete(): Promise<void> {
    if (!bundle) return;
    if (!window.confirm(`حذف ${bundle.nameAr}؟`)) return;
    const response = await fetch(`/api/admin/bundles/${bundle.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("تعذّر الحذف.");
      return;
    }
    router.refresh();
  }

  return (
    <form action={handleSave} className="grid gap-4 border border-white/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-arabic-display text-3xl">{bundle ? bundle.nameAr : "عرض جديد"}</h2>
        {bundle ? (
          <button type="button" onClick={handleDelete} className="text-sm text-mist">حذف</button>
        ) : null}
      </div>
      {compare !== null && bundle ? (
        <p className="text-sm text-mist">
          مجموع الزجاجات الآن {formatPrice(compare)}
          {savingsSar(bundle.priceSar, bundle.parts) > 0 ? "، والسعر المحفوظ ما زال أقل." : "، والسعر المحفوظ لم يعد عرضًا."}
        </p>
      ) : null}
      {bundle && !bundle.isComplete ? (
        <p className="text-sm text-gold">زجاجة داخل العرض لم تعد منشورة أو مسعّرة، لذلك لن يظهر في المتجر.</p>
      ) : null}
      <label className="block text-sm">
        الاسم العربي
        <input name="nameAr" required defaultValue={bundle?.nameAr} className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3" />
      </label>
      <label className="block text-sm">
        الاسم اللاتيني
        <input name="nameEn" required dir="ltr" defaultValue={bundle?.nameEn} className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3 text-start" />
      </label>
      <label className="block text-sm">
        الوصف
        <textarea name="descriptionAr" required rows={3} defaultValue={bundle?.descriptionAr} className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          سعر العرض
          <input name="priceSar" required dir="ltr" defaultValue={bundle?.priceSar} className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3" />
        </label>
        <label className="block text-sm">
          مخزون العروض
          <input name="stockCount" required dir="ltr" defaultValue={bundle?.stockCount ?? 0} className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4">
        {partSlots.map((slot) => (
          <PartSlot key={slot} slot={slot} products={products} part={bundle?.parts[slot - 1]} />
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="isPublished" type="checkbox" defaultChecked={bundle?.isPublished ?? false} />
        منشور في المتجر
      </label>
      {error ? <p className="text-sm text-gold">{error}</p> : null}
      <button type="submit" disabled={isSaving} className="h-12 bg-gold px-6 text-sm text-ink disabled:opacity-40">
        {isSaving ? "جارٍ الحفظ" : "حفظ العرض"}
      </button>
    </form>
  );
}

function PartSlot({
  slot,
  products,
  part,
}: {
  slot: number;
  products: BundleProductChoice[];
  part?: BundleOffer["parts"][number];
}) {
  const selected = part ? `${part.productId}:${part.sizeMl}` : "";
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
      <label className="block text-sm">
        الزجاجة {slot}
        <select name={`offer${slot}`} defaultValue={selected} className="mt-2 w-full border border-white/15 bg-ink px-4 py-3">
          <option value="">بدون</option>
          {products.flatMap((product) => product.offers.map((offer) => (
            <option key={`${product.id}-${offer.sizeMl}`} value={`${product.id}:${offer.sizeMl}`}>
              {product.nameAr} · {offer.sizeMl} مل · {formatPrice(offer.priceSar)}
            </option>
          )))}
        </select>
      </label>
      <label className="block text-sm">
        الكمية
        <input
          name={`qty${slot}`}
          dir="ltr"
          defaultValue={part?.quantity ?? 1}
          className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3"
        />
      </label>
    </div>
  );
}
