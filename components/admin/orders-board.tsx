"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { formatPrice } from "@/lib/catalog/money";
import { orderStatusLabels, orderStatuses } from "@/lib/orders/status";
import type { OrderStatus } from "@/lib/orders/status";

type BoardItem = {
  nameAr: string;
  detail: string;
  quantity: number;
  unitPriceSar: number;
};

type BoardOrder = {
  id: string;
  reference: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  internalNote: string;
  giftWrap: boolean;
  giftMessage: string;
  promoCode: string | null;
  discountSar: number;
  status: OrderStatus;
  totalSar: number;
  whatsappUrl: string | null;
  items: BoardItem[];
};

type BoardSnapshot = {
  orders: BoardOrder[];
  page: number;
  pageCount: number;
  total: number;
  hasFilter: boolean;
  error: string;
};

const emptyOrders: BoardOrder[] = [];
const serverSnapshot: BoardSnapshot = {
  orders: emptyOrders,
  page: 1,
  pageCount: 1,
  total: 0,
  hasFilter: false,
  error: "",
};
let snapshot: BoardSnapshot = serverSnapshot;
let page = 1;
let search = "";
let statusFilter = "";
const listeners = new Set<() => void>();
let pollId: number | undefined;

function emit(next: BoardSnapshot): void {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function orderQuery(): string {
  const params = new URLSearchParams({ page: String(page) });
  if (search.trim()) params.set("q", search.trim());
  if (statusFilter) params.set("status", statusFilter);
  return params.toString();
}

async function refreshOrders(): Promise<void> {
  const requested = `${page}|${search}|${statusFilter}`;
  try {
    const response = await fetch(`/api/admin/orders?${orderQuery()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("failed");
    if (`${page}|${search}|${statusFilter}` !== requested) return;
    const body = (await response.json()) as { orders: BoardOrder[]; page: number; pageCount: number; total: number };
    page = body.page;
    emit({
      orders: body.orders,
      page: body.page,
      pageCount: body.pageCount,
      total: body.total,
      hasFilter: search.trim().length > 0 || statusFilter.length > 0,
      error: "",
    });
  } catch {
    emit({ ...snapshot, error: "تعذّر تحديث الطلبات." });
  }
}

function showOrderPage(nextPage: number): void {
  page = nextPage;
  void refreshOrders();
}

function showOrderFilters(nextSearch: string, nextStatus: string): void {
  search = nextSearch.trim().slice(0, 80);
  statusFilter = orderStatuses.some((status) => status === nextStatus) ? nextStatus : "";
  page = 1;
  void refreshOrders();
}

function subscribeOrders(listener: () => void): () => void {
  listeners.add(listener);
  void refreshOrders();
  pollId ??= window.setInterval(() => {
    void refreshOrders();
  }, 4000);
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0 || pollId === undefined) return;
    window.clearInterval(pollId);
    pollId = undefined;
  };
}

function getOrdersSnapshot(): BoardSnapshot {
  return snapshot;
}

function getOrdersServerSnapshot(): BoardSnapshot {
  return serverSnapshot;
}

export function OrdersBoard() {
  const board = useSyncExternalStore(subscribeOrders, getOrdersSnapshot, getOrdersServerSnapshot);

  async function handleStatus(id: string, status: OrderStatus): Promise<void> {
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      emit({ ...snapshot, error: body?.error || "تعذّر تحديث الحالة." });
      return;
    }
    emit({
      ...snapshot,
      orders: snapshot.orders.map((order) => (order.id === id ? { ...order, status } : order)),
      error: "",
    });
  }

  async function handleNote(id: string, formData: FormData): Promise<void> {
    const internalNote = String(formData.get("internalNote") ?? "");
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalNote }),
    });
    if (!response.ok) {
      emit({ ...snapshot, error: "تعذّر حفظ الملاحظة." });
      return;
    }
    emit({
      ...snapshot,
      orders: snapshot.orders.map((order) => (order.id === id ? { ...order, internalNote } : order)),
      error: "",
    });
  }

  return (
    <div>
      <h1 className="font-arabic-display text-5xl">الطلبات</h1>
      <p className="mt-3 text-mist">تتجدد الصفحة الحالية كل أربع ثوانٍ. الدفع دائمًا عند الاستلام.</p>
      <form
        className="mt-8 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          showOrderFilters(String(data.get("q") ?? ""), String(data.get("status") ?? ""));
        }}
      >
        <label className="block min-w-64 flex-1 text-sm">
          بحث بالرقم أو الجوال أو الاسم
          <input name="q" className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-gold" />
        </label>
        <label className="block text-sm">
          الحالة
          <select name="status" className="mt-2 border border-white/15 bg-ink px-3 py-2">
            <option value="">كل الحالات</option>
            {orderStatuses.map((status) => (
              <option key={status} value={status}>{orderStatusLabels[status]}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="h-10 bg-gold px-5 text-sm text-ink">تطبيق</button>
      </form>
      {board.error ? <p className="mt-4 text-gold-bright">{board.error}</p> : null}
      {board.total > 0 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
          <p className="text-mist">{board.total} طلبًا · صفحة {board.page} من {board.pageCount}</p>
          <div className="flex gap-2">
            <button type="button" disabled={board.page <= 1} onClick={() => showOrderPage(board.page - 1)} className="border border-white/15 px-4 py-2 disabled:opacity-40">
              السابق
            </button>
            <button type="button" disabled={board.page >= board.pageCount} onClick={() => showOrderPage(board.page + 1)} className="border border-white/15 px-4 py-2 disabled:opacity-40">
              التالي
            </button>
          </div>
        </div>
      ) : null}
      {board.orders.length === 0 ? (
        <div className="mt-10 border border-dashed border-gold/30 px-6 py-16 text-center">
          <p className="font-arabic-display text-3xl">{board.hasFilter ? "لا طلبات مطابقة" : "لا طلبات بعد"}</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {board.orders.map((order) => (
            <li key={order.id} className="border border-white/10 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p dir="ltr" className="font-display text-2xl text-gold-bright">{order.reference}</p>
                  <p className="mt-2">{order.customerName}</p>
                  <p dir="ltr" className="text-sm text-mist">{order.phone}</p>
                  <p className="mt-2 text-sm text-mist">{order.city} · {order.address}</p>
                  {order.notes ? <p className="mt-2 text-sm">{order.notes}</p> : null}
                  {order.giftWrap ? <p className="mt-2 text-sm text-gold">تغليف هدية</p> : null}
                  {order.giftMessage ? <p className="mt-1 text-sm">بطاقة: {order.giftMessage}</p> : null}
                  {order.promoCode ? (
                    <p className="mt-1 text-sm text-mist" dir="ltr">{order.promoCode} · -{formatPrice(order.discountSar)}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {order.whatsappUrl ? (
                      <a href={order.whatsappUrl} target="_blank" rel="noreferrer" className="text-gold">واتساب</a>
                    ) : null}
                    <Link href={`/admin/orders/${order.id}/slip`} className="text-gold">ورقة التجهيز</Link>
                  </div>
                </div>
                <div className="text-end">
                  <p dir="ltr">{formatPrice(order.totalSar)}</p>
                  <label className="mt-3 block text-sm">
                    الحالة
                    <select
                      value={order.status}
                      onChange={(event) => {
                        void handleStatus(order.id, event.target.value as OrderStatus);
                      }}
                      className="mt-2 border border-white/15 bg-ink px-3 py-2"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>{orderStatusLabels[status]}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                {order.items.map((item, index) => (
                  <li key={`${order.id}-${index}`} className="flex justify-between gap-4">
                    <span>{item.nameAr} · {item.detail} × {item.quantity}</span>
                    <span dir="ltr">{formatPrice(item.unitPriceSar * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <form action={(formData) => { void handleNote(order.id, formData); }} className="mt-4 border-t border-white/10 pt-4">
                <label className="block text-sm">
                  ملاحظة داخلية — لا يراها العميل
                  <textarea
                    name="internalNote"
                    key={order.internalNote}
                    defaultValue={order.internalNote}
                    maxLength={500}
                    rows={2}
                    className="mt-2 w-full border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-gold"
                  />
                </label>
                <button type="submit" className="mt-3 border border-white/15 px-4 py-2 text-sm">حفظ الملاحظة</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
