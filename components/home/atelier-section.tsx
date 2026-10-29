import { ArrowLeft } from "lucide-react";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";

export function AtelierSection() {
  return (
    <section className="bg-cream text-ink">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:items-center md:px-8 md:py-32">
        <Reveal>
          <p className="text-sm text-amber">طلب خاص</p>
          <h2 className="mt-4 font-arabic-display text-5xl leading-tight md:text-6xl">
            عطر في بالك؟ خلّيه علينا.
          </h2>
          <p className="mt-6 max-w-md leading-8 text-ink/75">
            بتدور على عطر معين ومش لاقيه عندنا؟ ابعتلنا اسمه وتفاصيل طلبك، وإحنا هنراجع إمكانية توفيره وتحضيره ليك، ونبلغك بالسعر قبل ما تأكد طلبك.
          </p>
          <div className="mt-8">
            <MagneticButton href="/blend" variant="ink">
              اطلب عطراً خاصاً
              <ArrowLeft className="size-4" />
            </MagneticButton>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <ol className="space-y-8 border-s border-ink/15 ps-6">
            <li>
              <p className="font-sans text-xs tracking-[0.32em] text-amber">01</p>
              <h3 className="mt-2 font-arabic-display text-3xl">الطلب</h3>
              <p className="mt-2 text-ink/70">اسم العطر، والتفاصيل الاختيارية، ورقم للتواصل.</p>
            </li>
            <li>
              <p className="font-sans text-xs tracking-[0.32em] text-amber">02</p>
              <h3 className="mt-2 font-arabic-display text-3xl">المراجعة</h3>
              <p className="mt-2 text-ink/70">الدار تتحقق من إمكانية التوفير أو التحضير.</p>
            </li>
            <li>
              <p className="font-sans text-xs tracking-[0.32em] text-amber">03</p>
              <h3 className="mt-2 font-arabic-display text-3xl">الموافقة</h3>
              <p className="mt-2 text-ink/70">مفيش التزام بالشراء قبل موافقتك على السعر.</p>
            </li>
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
