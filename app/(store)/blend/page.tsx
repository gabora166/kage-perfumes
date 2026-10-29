import { BespokeRequestForm } from "@/components/blend/bespoke-request-form";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "طلب عطر خاص",
  description:
    "بتدور على عطر معين ومش لاقيه عندنا؟ ابعتلنا اسمه وتفاصيل طلبك، وإحنا هنراجع إمكانية توفيره وتحضيره ليك، ونبلغك بالسعر قبل ما تأكد طلبك.",
  path: "/blend",
});

export default function BlendPage() {
  return (
    <>
      <PageHero
        eyebrow="Bespoke request"
        title="عطر في بالك؟ خلّيه علينا."
        description="بتدور على عطر معين ومش لاقيه عندنا؟ ابعتلنا اسمه وتفاصيل طلبك، وإحنا هنراجع إمكانية توفيره وتحضيره ليك، ونبلغك بالسعر قبل ما تأكد طلبك."
      >
        <p className="mt-4 max-w-xl text-sm leading-7 text-brass">
          مفيش التزام بالشراء قبل موافقتك على السعر.
        </p>
      </PageHero>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:px-8">
        <Reveal variant="ink" className="space-y-6 text-sm leading-8 text-mist">
          <ol className="space-y-4 border border-ivory/12 bg-ink-soft/40 p-6 md:p-8">
            <li>
              <span className="text-brass">01</span> — ابعت اسم العطر ورقم تواصلك
            </li>
            <li>
              <span className="text-brass">02</span> — الدار تراجع إمكانية التوفير أو التحضير
            </li>
            <li>
              <span className="text-brass">03</span> — توصلك بالسعر والمدة قبل أي التزام
            </li>
            <li>
              <span className="text-brass">04</span> — توافق على العرض ثم نكمّل الطلب معاك
            </li>
          </ol>
          <p>
            الخدمة دي لطلب عطر مش موجود حالياً في الكتالوج — مش منشئ تركيبة تلقائي ولا حساب سعر فوري.
          </p>
        </Reveal>
        <div className="border border-ivory/12 bg-ink/35 p-5 md:p-8">
          <BespokeRequestForm />
        </div>
      </div>
    </>
  );
}
