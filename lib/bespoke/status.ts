export const bespokeStatuses = [
  "new",
  "under_review",
  "quoted",
  "awaiting_customer_approval",
  "approved",
  "rejected",
  "unavailable",
  "cancelled",
] as const;

export type BespokeStatus = (typeof bespokeStatuses)[number];

export const bespokeStatusLabels: Record<BespokeStatus, string> = {
  new: "جديد",
  under_review: "قيد المراجعة",
  quoted: "تم التسعير",
  awaiting_customer_approval: "بانتظار موافقة العميل",
  approved: "موافق عليه",
  rejected: "رفضه العميل",
  unavailable: "غير متاح",
  cancelled: "ملغى",
};

export function isBespokeStatus(value: string): value is BespokeStatus {
  return bespokeStatuses.some((status) => status === value);
}

export function readBespokeStatusFilter(value: string | null): BespokeStatus | "" {
  if (!value || !isBespokeStatus(value)) return "";
  return value;
}

export const customerRespondableStatuses = ["quoted", "awaiting_customer_approval"] as const;

export function canCustomerRespond(status: BespokeStatus): boolean {
  return customerRespondableStatuses.some((entry) => entry === status);
}
