export const fulfillmentStatuses = ["pending", "processing", "shipped", "delivered"] as const;

export const orderStatuses = [...fulfillmentStatuses, "cancelled", "returned"] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "قيد الانتظار",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
  returned: "مرتجع",
};

export function isClosedOrderStatus(status: OrderStatus): status is "cancelled" | "returned" {
  return status === "cancelled" || status === "returned";
}

export function isOrderStatus(value: string): value is OrderStatus {
  return orderStatuses.some((status) => status === value);
}

export function readOrderStatusFilter(value: string | null): OrderStatus | "" {
  if (!value || !isOrderStatus(value)) return "";
  return value;
}
