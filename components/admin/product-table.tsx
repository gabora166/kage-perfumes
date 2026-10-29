"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { familyLabels } from "@/lib/catalog/labels";
import { formatPrice, getStartingOffer } from "@/lib/catalog/money";
import type { Product } from "@/lib/catalog/types";

type ProductTableProps = {
  products: Product[];
};

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleDelete(product: Product): Promise<void> {
    const confirmed = window.confirm(`حذف ${product.nameAr}؟`);
    if (!confirmed) return;
    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("تعذّر الحذف.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-arabic-display text-5xl">العطور</h1>
          <p className="mt-3 text-mist">أضف زجاجة وصورها وهرمها العطري، وعدّل السعر ومخزون كل حجم.</p>
        </div>
        <Link href="/admin/products/new" className="bg-gold px-5 py-3 text-sm text-ink">
          عطر جديد
        </Link>
      </div>
      {error ? <p className="mt-4 text-gold-bright">{error}</p> : null}
      <div className="mt-8 overflow-x-auto border border-white/10">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-ink-soft text-mist">
            <tr>
              <th className="px-4 py-3 text-start font-normal">العطر</th>
              <th className="px-4 py-3 text-start font-normal">العائلة</th>
              <th className="px-4 py-3 text-start font-normal">يبدأ من</th>
              <th className="px-4 py-3 text-start font-normal">المخزون</th>
              <th className="px-4 py-3 text-start font-normal">الحالة</th>
              <th className="px-4 py-3 text-start font-normal">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const visibleOffers = product.offers.filter((offer) => offer.isListed);
              const stockLabel = product.offers.map((offer) => (
                `${offer.sizeMl}:${offer.stockCount}${offer.isListed ? "" : " مخفي"}`
              )).join(" · ");
              return (
              <tr key={product.id} className="border-t border-white/10">
                <td className="px-4 py-4">
                  {product.nameAr}
                  <p className="font-display italic text-gold">{product.nameEn}</p>
                </td>
                <td className="px-4 py-4">{familyLabels[product.family].ar}</td>
                <td className="px-4 py-4" dir="ltr">
                  {visibleOffers.length > 0 ? formatPrice(getStartingOffer({ ...product, offers: visibleOffers }).priceSar) : "—"}
                </td>
                <td className="px-4 py-4">
                  {stockLabel || "—"}
                </td>
                <td className="px-4 py-4">{product.isPublished ? "منشور" : "مخفي"}</td>
                <td className="px-4 py-4">
                  <Link href={`/admin/products/${product.id}`} className="text-gold">تعديل</Link>
                  <button type="button" onClick={() => handleDelete(product)} className="ms-4 text-mist">
                    حذف
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
