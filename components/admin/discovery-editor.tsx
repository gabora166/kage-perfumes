"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DiscoverySet } from "@/lib/catalog/samples";

type DiscoveryEditorProps = {
  discoverySet: DiscoverySet | null;
};

export function DiscoveryEditor({ discoverySet }: DiscoveryEditorProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  if (!discoverySet) return null;

  async function handleSave(formData: FormData): Promise<void> {
    setError("");
    setIsSaving(true);
    const response = await fetch("/api/admin/discovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceSar: Number(formData.get("priceSar")),
        stockCount: Number(formData.get("stockCount")),
        isPublished: formData.get("isPublished") === "on",
      }),
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(body.error ?? "تعذّر حفظ المجموعة.");
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    router.refresh();
  }

  return (
    <form action={handleSave} className="mb-10 grid gap-4 border border-gold/30 p-5 md:grid-cols-[1fr_1fr_auto]">
      <div className="md:col-span-3">
        <h2 className="font-arabic-display text-3xl">مجموعة الاكتشاف</h2>
        <p className="mt-2 text-sm text-mist">تشمل كل عطر منشور له سعر عيّنة 2 مل. السعر ثابت ولا يُجمع من أسعار العيّنات.</p>
      </div>
      <label className="block text-sm">
        السعر
        <input name="priceSar" required dir="ltr" defaultValue={discoverySet.priceSar} className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3" />
      </label>
      <label className="block text-sm">
        المخزون
        <input name="stockCount" required dir="ltr" defaultValue={discoverySet.stockCount} className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3" />
      </label>
      <label className="flex items-center gap-3 text-sm md:mt-7">
        <input name="isPublished" type="checkbox" defaultChecked={discoverySet.isPublished} />
        منشورة
      </label>
      {error ? <p className="text-gold-bright md:col-span-3">{error}</p> : null}
      <button type="submit" disabled={isSaving} className="h-12 bg-gold text-sm text-ink disabled:opacity-40 md:col-span-3">
        {isSaving ? "جارٍ الحفظ" : "حفظ المجموعة"}
      </button>
    </form>
  );
}
