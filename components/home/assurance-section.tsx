import Link from "next/link";
import { trustOfferBand, trustPolicyPaths } from "@/lib/trust/offers";

const points = [
  {
    href: trustPolicyPaths.delivery,
    title: trustOfferBand.benefits[0].label,
    body: "الشحن مجاني داخل المنصورة. خارجها متاح لبقية الجمهورية وفق صفحة التوصيل.",
  },
  {
    href: trustPolicyPaths.returns,
    title: trustOfferBand.benefits[1].label,
    body: "تيستر للتجربة قبل فتح الزجاجة المختومة — حتى تقرر براحتك.",
  },
  {
    href: trustPolicyPaths.returns,
    title: trustOfferBand.benefits[2].label,
    body: "استرداد وفق سياسة الإرجاع المعلنة للزجاجة المختومة غير المفتوحة.",
  },
] as const;

export function AssuranceSection() {
  return (
    <section className="border-t border-ink/10 px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
        {points.map((point) => (
          <Link key={point.title} href={point.href} className="block border-t border-ink/15 pt-6">
            <h2 className="font-arabic-display text-3xl text-ink">{point.title}</h2>
            <p className="mt-3 leading-8 text-ink/70">{point.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
