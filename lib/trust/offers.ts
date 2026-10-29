/**
 * Trust-first marketing copy for confirmed house benefits.
 * Shipping and refund wording must stay aligned with `lib/trust/policies.ts`.
 * Tester inclusion is an owner-confirmed offer — keep the sentence editable here.
 */

export const trustPolicyPaths = {
  delivery: "/trust/delivery",
  returns: "/trust/returns",
  cod: "/trust/cod",
} as const;

/** Owner-editable complimentary tester line (not a catalog SKU). */
export const complimentaryTesterCopy = {
  label: "تيستر مع كل عطر",
  short:
    "يُرفق مع العطر تيستر للتجربة قبل فتح الزجاجة المختومة.",
  detail:
    "جرّب التيستر أولًا. الزجاجة الرئيسية تبقى مختومة حتى تقرر — وهذا يحفظ شرط إرجاع المغلقة وفق سياسة الإرجاع.",
} as const;

export const mansouraShippingCopy = {
  label: "شحن مجاني داخل المنصورة",
  applies:
    "عنوانك داخل المنصورة: الشحن مجاني، ولا يُضاف مبلغ شحن إلى مجموع الطلب.",
  elsewhere:
    "الشحن المجاني يخص المنصورة فقط. الشحن متاح لبقية الجمهورية — التفاصيل في صفحة التوصيل، وغير مضاف تلقائيًا إلى هذا المجموع.",
  general:
    "الشحن مجاني داخل المنصورة. خارجها متاح لجميع أنحاء الجمهورية، ولا يُضاف مبلغ شحن تلقائيًا إلى مجموع الطلب الظاهر هنا.",
} as const;

export const refundGuaranteeCopy = {
  label: "ضمان استرداد الأموال",
  short:
    "استرداد وفق سياسة الإرجاع المعلنة للزجاجة المختومة غير المفتوحة.",
  /** Steps that already exist in the returns policy — do not invent new windows. */
  steps: [
    "تأكد أن الزجاجة لم تُفتح وبختمها وغلافها.",
    "راجع شروط الإرجاع في صفحة السياسة خلال المدة المذكورة هناك.",
    "راسل الدار لإتمام طلب الاسترداد أو الاستبدال إن كان متاحًا.",
  ],
} as const;

export const trustOfferBand = {
  headline: "جرّب الأول. قرّر براحتك.",
  support:
    "عطرك يوصل لحد بابك في المنصورة مجانًا، ومعاه تيستر تجربه الأول. ولو مش مناسب ليك، تقدر تطلب استرداد المبلغ وفقًا لشروط الضمان المعلنة.",
  benefits: [
    {
      key: "shipping",
      label: mansouraShippingCopy.label,
      href: trustPolicyPaths.delivery,
    },
    {
      key: "tester",
      label: complimentaryTesterCopy.label,
      href: trustPolicyPaths.returns,
    },
    {
      key: "refund",
      label: refundGuaranteeCopy.label,
      href: trustPolicyPaths.returns,
    },
  ],
} as const;

const mansouraTokens = ["المنصورة", "المنصوره", "mansoura", "el mansoura", "al mansoura"] as const;

/** Soft city match for messaging only — never changes pricing or cart totals. */
export function isMansouraCity(city: string): boolean {
  const normalized = city.trim().toLowerCase().replace(/\s+/g, " ");
  if (normalized.length === 0) return false;
  return mansouraTokens.some((token) => normalized.includes(token));
}

export function shippingMessageForCity(city: string): {
  tone: "mansoura" | "elsewhere" | "unknown";
  text: string;
} {
  const trimmed = city.trim();
  if (trimmed.length === 0) {
    return { tone: "unknown", text: mansouraShippingCopy.general };
  }
  if (isMansouraCity(trimmed)) {
    return { tone: "mansoura", text: mansouraShippingCopy.applies };
  }
  return { tone: "elsewhere", text: mansouraShippingCopy.elsewhere };
}
