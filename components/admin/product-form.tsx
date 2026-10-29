"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { imageAlt } from "@/lib/catalog/images";
import { familyLabels } from "@/lib/catalog/labels";
import { longevityLabels, sillageLabels } from "@/lib/catalog/story";
import { bottleSizes, fragranceFamilies, productImageKinds, wearLevels } from "@/lib/catalog/types";
import type { Product, ProductImageKind, WearLevel } from "@/lib/catalog/types";

type ProductFormProps = {
  product?: Product;
};

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const prices = new Map(product?.offers.map((offer) => [offer.sizeMl, offer.priceSar]) ?? []);
  const stocks = new Map(product?.offers.map((offer) => [offer.sizeMl, offer.stockCount]) ?? []);
  const listed = new Map(product?.offers.map((offer) => [offer.sizeMl, offer.isListed]) ?? []);

  async function handleSubmit(formData: FormData): Promise<void> {
    setError("");
    setIsSaving(true);
    if (product) formData.set("id", product.id);
    const response = await fetch("/api/admin/products", { method: "POST", body: formData });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(body.error ?? "تعذّر الحفظ.");
      setIsSaving(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="grid max-w-3xl gap-5">
      <Field label="الاسم العربي" name="nameAr" defaultValue={product?.nameAr} />
      <Field label="الاسم اللاتيني" name="nameEn" defaultValue={product?.nameEn} dir="ltr" />
      <label className="block text-sm">
        العائلة العطرية
        <select
          name="family"
          defaultValue={product?.family ?? "oriental"}
          className="mt-2 w-full border border-white/15 bg-ink px-4 py-3"
        >
          {fragranceFamilies.map((family) => (
            <option key={family} value={family}>{familyLabels[family].ar}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        الوصف
        <textarea
          name="descriptionAr"
          required
          rows={4}
          defaultValue={product?.descriptionAr}
          className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      <Field label="المقدمة" name="noteTop" defaultValue={product?.notes.top} />
      <Field label="القلب" name="noteHeart" defaultValue={product?.notes.heart} />
      <Field label="القاعدة" name="noteBase" defaultValue={product?.notes.base} />
      <TextArea
        label="الوصف الحسي والشعور العام"
        name="sensoryVibe"
        defaultValue={product?.sensoryVibe}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <LevelField
          label="مقياس الثبات"
          name="longevity"
          labels={longevityLabels}
          defaultValue={product?.longevity ?? 3}
        />
        <LevelField
          label="مقياس الفوحان"
          name="sillage"
          labels={sillageLabels}
          defaultValue={product?.sillage ?? 3}
        />
        <Field label="الثبات" name="longevitySpan" defaultValue={product?.longevitySpan} />
        <Field label="الفوحان" name="sillageSpan" defaultValue={product?.sillageSpan} />
      </div>
      <p className="text-sm text-mist">مثال للثبات: ٧ إلى ٩ ساعات. مثال للفوحان: معتدل إلى قوي.</p>
      <Field label="الإحساس العطري" name="mood" defaultValue={product?.mood} />
      <Field label="المناسبات وأوقات الارتداء" name="occasion" defaultValue={product?.occasion} />
      <Field label="الوقت الأنسب" name="season" defaultValue={product?.season} />
      <Field label="الملبس المناسب" name="attire" defaultValue={product?.attire} />
      <div className="grid gap-4 sm:grid-cols-3">
        {bottleSizes.map((size) => (
          <div key={size} className="space-y-4">
            <Field label={`سعر ${size} مل`} name={`price${size}`} defaultValue={prices.get(size)?.toString()} dir="ltr" required={false} />
            <Field label={`مخزون ${size} مل`} name={`stock${size}`} defaultValue={stocks.get(size)?.toString()} dir="ltr" required={false} />
            <label className="flex items-center gap-2 text-sm">
              <input name={`listed${size}`} type="checkbox" defaultChecked={listed.get(size) !== false} />
              يظهر في المتجر
            </label>
          </div>
        ))}
      </div>
      <p className="text-sm text-mist">أبقِ السعر والمخزون، وألغِ الظهور لإخفاء حجم واحد دون حذف العطر.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="سعر عيّنة 2 مل"
          name="samplePrice"
          defaultValue={product?.sample?.priceSar.toString()}
          dir="ltr"
          required={false}
        />
        <Field
          label="مخزون العيّنة"
          name="sampleStock"
          defaultValue={product?.sample?.stockCount.toString()}
          dir="ltr"
          required={false}
        />
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input
          name="sampleEnabled"
          type="checkbox"
          defaultChecked={product?.sample?.isEnabled ?? Boolean(product?.sample)}
        />
        تفعيل طلب العيّنة في المتجر
      </label>
      <p className="text-sm text-mist">
        اترك سعر العيّنة فارغًا لإزالتها بالكامل. ألغِ التفعيل لإغلاق الطلب مع الإبقاء على السعر والمخزون.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {productImageKinds.map((kind) => (
          <ImageField key={kind} kind={kind} product={product} />
        ))}
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input name="isPublished" type="checkbox" defaultChecked={product?.isPublished ?? true} />
        منشور في المتجر
      </label>
      <label className="flex items-center gap-3 text-sm">
        <input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured ?? false} />
        يظهر في الصفحة الرئيسية
      </label>
      {error ? <p className="text-gold-bright">{error}</p> : null}
      <button type="submit" disabled={isSaving} className="h-12 bg-gold text-sm text-ink disabled:opacity-40">
        {isSaving ? "جارٍ الحفظ" : "حفظ العطر"}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  dir?: "ltr";
  required?: boolean;
};

const imageFields: Record<ProductImageKind, { label: string; name: string }> = {
  bottle: { label: "صورة الزجاجة", name: "bottleImage" },
  liquid: { label: "صورة السائل", name: "liquidImage" },
  texture: { label: "صورة الملمس", name: "textureImage" },
  pyramid: { label: "صورة الهرم العطري", name: "pyramidImage" },
};

type ImageFieldProps = {
  kind: ProductImageKind;
  product?: Product;
};

function ImageField({ kind, product }: ImageFieldProps) {
  const field = imageFields[kind];
  const src = product?.images[kind];
  const alt = product ? imageAlt(product, kind) : field.label;
  return (
    <label className="block text-sm">
      {field.label}
      <input name={field.name} type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" />
      {src && product ? (
        <span className={`relative mt-3 block h-40 overflow-hidden border border-white/10`}>
          <ProductPhoto src={src} alt={alt} sizes="10rem" family={product.family} />
        </span>
      ) : null}
    </label>
  );
}

type LevelFieldProps = {
  label: string;
  name: string;
  labels: Record<WearLevel, string>;
  defaultValue: number;
};

function LevelField({ label, name, labels, defaultValue }: LevelFieldProps) {
  return (
    <label className="block text-sm">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full border border-white/15 bg-ink px-4 py-3"
      >
        {wearLevels.map((level) => (
          <option key={level} value={level}>{labels[level]}</option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="block text-sm">
      {label}
      <textarea
        name={name}
        required
        rows={3}
        defaultValue={defaultValue}
        className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3 outline-none focus:border-gold"
      />
    </label>
  );
}

function Field({ label, name, defaultValue, dir, required = true }: FieldProps) {
  return (
    <label className="block text-sm">
      {label}
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        dir={dir}
        className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3 outline-none focus:border-gold"
      />
    </label>
  );
}
