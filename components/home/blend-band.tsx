import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { brandAssets } from "@/lib/brand";

export function BlendBand() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-ink px-5 py-16 text-ivory md:px-8 md:py-24">
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src={brandAssets.campaigns.atelier}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_35%] opacity-[0.42]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/88 to-ink/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(179,154,112,0.1),transparent_45%),radial-gradient(ellipse_at_0%_100%,rgba(141,32,40,0.12),transparent_40%)]" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <Reveal variant="ink">
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.38em] text-brass">Bespoke</p>
          <h2 className="mt-4 max-w-xl font-arabic-display text-4xl leading-tight md:text-5xl lg:text-6xl">
            عطر في بالك؟ خلّيه علينا.
          </h2>
          <p className="mt-5 max-w-lg leading-8 text-mist">
            بتدور على عطر معين ومش لاقيه عندنا؟ ابعتلنا اسمه وتفاصيل طلبك، وإحنا هنراجع إمكانية توفيره وتحضيره ليك، ونبلغك بالسعر قبل ما تأكد طلبك.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <ol className="space-y-4 border border-ivory/15 bg-ink/55 p-6 text-sm leading-7 text-mist backdrop-blur-[2px] md:p-8">
            <li>
              <span className="text-brass">01</span> — اسم العطر ورقم التواصل
            </li>
            <li>
              <span className="text-brass">02</span> — مراجعة الدار لإمكانية التوفير
            </li>
            <li>
              <span className="text-brass">03</span> — عرض السعر قبل أي التزام
            </li>
            <li>
              <span className="text-brass">04</span> — موافقتك ثم استكمال الطلب
            </li>
          </ol>
          <Link
            href="/blend"
            className="pressable mt-6 inline-flex h-12 items-center justify-center gap-2 bg-seal px-7 text-sm text-ivory"
          >
            اطلب عطراً خاصاً
            <ArrowLeft className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
