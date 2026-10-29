import { brand } from "@/lib/brand";
import { formatPrice } from "@/lib/catalog/money";

type MessageItem = {
  nameAr: string;
  detail: string;
  quantity: number;
  lineTotalSar: number;
};

type MessageInput = {
  reference: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  giftWrap: boolean;
  giftMessage: string;
  promoCode: string | null;
  discountSar: number;
  totalSar: number;
  items: MessageItem[];
};

export function composeOrderMessage(input: MessageInput): string {
  const lines = input.items.map((item) => {
    return `• ${item.nameAr} — ${item.detail} × ${item.quantity} — ${formatPrice(item.lineTotalSar)}`;
  });
  return [
    `طلب جديد من ${brand.name}`,
    `الرقم: ${input.reference}`,
    `الاسم: ${input.customerName}`,
    `الجوال: ${input.phone}`,
    `المدينة: ${input.city}`,
    `العنوان: ${input.address}`,
    input.notes ? `ملاحظة: ${input.notes}` : "",
    input.giftWrap ? "تغليف هدية: نعم" : "",
    input.giftMessage ? `بطاقة الإهداء: ${input.giftMessage}` : "",
    input.promoCode ? `رمز خاص: ${input.promoCode}` : "",
    input.discountSar > 0 ? `الخصم: ${formatPrice(input.discountSar)}` : "",
    "الدفع: عند الاستلام",
    ...lines,
    `المجموع: ${formatPrice(input.totalSar)}`,
  ].filter(Boolean).join("\n");
}

export function buildWhatsAppUrl(phone: string | undefined, message: string): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
