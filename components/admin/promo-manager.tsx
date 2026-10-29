"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/catalog/money";
import type { PromoRecord } from "@/lib/promos/code";

type PromoManagerProps = {
  promos: PromoRecord[];
};

export function PromoManager({ promos }: PromoManagerProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreate(formData: FormData): Promise<void> {
    setError("");
    setIsSaving(true);
    const response = await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: formData.get("code"),
        kind: formData.get("kind"),
        amount: Number(formData.get("amount")),
        expiresAt: formData.get("expiresAt"),
        maxUses: formData.get("maxUses"),
      }),
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(body.error ?? "تعذّر حفظ الرمز.");
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    router.refresh();
  }

  async function handleDeactivate(id: string): Promise<void> {
    const response = await fetch(`/api/admin/promos/${id}`, { method: "PATCH" });
    if (!response.ok) {
      setError("تعذّر إيقاف الرمز.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-10">
      <div>
        <h1 className="font-arabic-display text-5xl">رموز خاصة</h1>
        <p className="mt-3 max-w-xl text-mist">لا تُعرض هذه الرموز في المتجر. يدخلها الضيف عند إتمام الطلب فقط.</p>
      </div>
      <form action={handleCreate} className="grid max-w-3xl gap-4 border border-white/10 p-5 md:grid-cols-2">
        <label className="block text-sm">
          الرمز
          <input name="code" required dir="ltr" className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3" />
        </label>
        <label className="block text-sm">
          النوع
          <select name="kind" defaultValue="percent" className="mt-2 w-full border border-white/15 bg-ink px-4 py-3">
            <option value="percent">نسبة مئوية</option>
            <option value="fixed">مبلغ ثابت</option>
          </select>
        </label>
        <label className="block text-sm">
          القيمة
          <input name="amount" required dir="ltr" inputMode="numeric" className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3" />
        </label>
        <label className="block text-sm">
          صالح حتى
          <input name="expiresAt" type="date" dir="ltr" className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3" />
        </label>
        <label className="block text-sm md:col-span-2">
          حد الاستخدام
          <input name="maxUses" dir="ltr" inputMode="numeric" placeholder="فارغ يعني بلا حد" className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3" />
        </label>
        {error ? <p className="text-gold-bright md:col-span-2">{error}</p> : null}
        <button type="submit" disabled={isSaving} className="h-12 bg-gold text-sm text-ink disabled:opacity-40 md:col-span-2">
          {isSaving ? "جارٍ الحفظ" : "حفظ الرمز"}
        </button>
      </form>
      <ul className="space-y-3">
        {promos.map((promo) => (
          <li key={promo.id} className="flex flex-wrap items-center justify-between gap-4 border border-white/10 px-4 py-3">
            <div>
              <p dir="ltr" className="font-display text-2xl text-gold-bright">{promo.code}</p>
              <p className="text-sm text-mist">
                {promo.kind === "percent" ? `${promo.amount}%` : formatPrice(promo.amount)}
                {promo.expiresAt ? ` · حتى ${promo.expiresAt}` : " · بلا انتهاء"}
                {` · ${promo.usedCount}${promo.maxUses ? `/${promo.maxUses}` : ""}`}
                {promo.isActive ? "" : " · متوقف"}
              </p>
            </div>
            {promo.isActive ? (
              <button type="button" onClick={() => void handleDeactivate(promo.id)} className="text-sm text-mist">
                إيقاف
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
