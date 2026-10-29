"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/catalog/money";
import { fulfillmentStatuses, isClosedOrderStatus, orderStatusLabels } from "@/lib/orders/status";
import type { OrderStatus } from "@/lib/orders/status";

type TrackedOrder = {
  reference: string;
  status: OrderStatus;
  totalSar: number;
  createdAt: string;
  items: Array<{ nameAr: string; detail: string; quantity: number }>;
};

export function TrackForm() {
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [orders, setOrders] = useState<TrackedOrder[]>([]);

  async function handleSubmit(formData: FormData): Promise<void> {
    setError("");
    setOrders([]);
    setIsSearching(true);
    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.get("phone") }),
      });
      const body = (await response.json()) as { orders?: TrackedOrder[]; error?: string };
      if (!response.ok || !body.orders || body.orders.length === 0) {
        setError(body.error ?? "لا يوجد طلب بهذا الجوال.");
        setIsSearching(false);
        return;
      }
      setOrders(body.orders);
      setIsSearching(false);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
      setIsSearching(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
      <form action={handleSubmit} className="space-y-5">
        <label className="block text-sm text-ivory">
          رقم الجوال المستخدم في الطلب
          <input
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="01xxxxxxxxx"
            className="mt-2 w-full border border-border bg-ivory px-4 py-3 text-ink outline-none focus:border-brass"
          />
        </label>
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSearching}
          aria-busy={isSearching}
          className="pressable h-12 bg-seal px-8 text-sm text-ivory disabled:opacity-40"
        >
          {isSearching ? "جارٍ البحث" : "اعرض الطلبات"}
        </button>
      </form>
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderStatusCard key={order.reference} order={order} />
          ))}
        </div>
      ) : (
        <p className="text-mist">
          اكتب الجوال نفسه الذي استخدمته عند الشراء. تظهر طلباتك فقط، من دون الاسم أو العنوان.
        </p>
      )}
    </div>
  );
}

function OrderStatusCard({ order }: { order: TrackedOrder }) {
  const placedOn = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { dateStyle: "medium" }).format(
    new Date(order.createdAt),
  );
  const activeIndex = fulfillmentStatuses.findIndex((entry) => entry === order.status);
  return (
    <section className="border border-border bg-ivory p-6 text-ink md:p-8">
      <p dir="ltr" className="font-display text-4xl">
        {order.reference}
      </p>
      <p className="mt-2 text-sm text-ink/70">{placedOn}</p>
      {isClosedOrderStatus(order.status) ? (
        <p className="mt-8 border border-ink/15 px-4 py-3">{orderStatusLabels[order.status]}</p>
      ) : (
        <ol className="mt-8 space-y-3">
          {fulfillmentStatuses.map((status, index) => (
            <li key={status} className={index <= activeIndex ? "text-ink" : "text-ink/40"}>
              {orderStatusLabels[status]}
            </li>
          ))}
        </ol>
      )}
      <ul className="mt-8 space-y-3 border-t border-ink/10 pt-6 text-sm">
        {order.items.map((item, index) => (
          <li key={`${item.nameAr}-${index}`}>
            {item.nameAr}
            <span className="mt-1 block text-ink/70">
              {item.detail} × {item.quantity}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-6 flex justify-between border-t border-ink/10 pt-4">
        <span>المجموع</span>
        <span dir="ltr" className="tabular-nums">
          {formatPrice(order.totalSar)}
        </span>
      </p>
    </section>
  );
}
