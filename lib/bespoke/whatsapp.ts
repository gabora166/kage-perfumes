import { brand } from "@/lib/brand";
import { bespokeConcentrationLabels } from "@/lib/bespoke/options";
import { bespokeSizeLabels } from "@/lib/bespoke/options";
import type { BespokeConcentration, BespokeSizeOption } from "@/lib/bespoke/options";
import { formatPrice } from "@/lib/catalog/money";
import { buildWhatsAppUrl } from "@/lib/orders/whatsapp";
import { absoluteUrl } from "@/lib/seo/site";

type QuoteMessageInput = {
  reference: string;
  perfumeName: string;
  brandName: string;
  sizeOption: BespokeSizeOption | null;
  customSize: string;
  quantity: number;
  concentration: BespokeConcentration | null;
  proposedPriceSar: number;
  fulfillmentEstimate: string;
  approvalToken: string;
};

export function composeBespokeQuoteMessage(input: QuoteMessageInput): string {
  const sizeLabel = formatSize(input.sizeOption, input.customSize);
  const concentrationLabel = input.concentration
    ? bespokeConcentrationLabels[input.concentration]
    : "حسب الاتفاق";
  const approvalUrl = absoluteUrl(`/blend/quote/${input.approvalToken}`);
  return [
    `عرض سعر من ${brand.name}`,
    `رقم الطلب الخاص: ${input.reference}`,
    `العطر: ${input.perfumeName}${input.brandName ? ` — ${input.brandName}` : ""}`,
    sizeLabel ? `الحجم: ${sizeLabel}` : "",
    `الكمية: ${input.quantity}`,
    `الكثافة: ${concentrationLabel}`,
    `السعر المقترح: ${formatPrice(input.proposedPriceSar)}`,
    input.fulfillmentEstimate ? `مدة التجهيز: ${input.fulfillmentEstimate}` : "",
    "لا يوجد التزام بالشراء قبل موافقتك.",
    `للموافقة أو الرفض: ${approvalUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildCustomerQuoteWhatsAppUrl(phone: string, message: string): string | null {
  return buildWhatsAppUrl(phone, message);
}

function formatSize(sizeOption: BespokeSizeOption | null, customSize: string): string {
  if (!sizeOption) return "";
  if (sizeOption === "custom") return customSize || bespokeSizeLabels.custom;
  return bespokeSizeLabels[sizeOption];
}
