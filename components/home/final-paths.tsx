import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/brand/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

const paths = [
  {
    href: "/catalog",
    eyebrow: "Catalog",
    title: "تصفّح العطور",
    body: "كل العطور المنشورة بالحجم والسعر والمخزون كما تحسبه الدار.",
  },
  {
    href: "/discovery",
    eyebrow: "Discovery",
    title: "مجموعة الاكتشاف",
    body: "عيّنات على الجلد قبل اختيار الزجاجة، بمخزون مستقل عن العيّنات المفردة.",
  },
  {
    href: "/blend",
    eyebrow: "Bespoke",
    title: "طلب عطر خاص",
    body: "عطر مش موجود في الكتالوج؟ ابعت الطلب، والدار تبلّغك بالسعر قبل أي التزام.",
  },
] as const;

export function FinalPaths() {
  return (
    <section className="relative overflow-hidden border-t border-border px-5 py-16 md:px-8 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(141,32,40,0.12),transparent_50%)]"
      />
      <div className="relative mx-auto max-w-7xl">
        <Reveal variant="ink">
          <SectionHeading
            eyebrow="Next step"
            title="اختر طريقك إلى العطر"
            description="ثلاث مداخل واضحة — كلها مبنية على وظائف الدار الحالية، دون وعود زائدة."
          />
        </Reveal>
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" delay={0.04}>
          {paths.map((path) => (
            <StaggerItem key={path.href}>
              <Link
                href={path.href}
                className="group flex h-full min-h-52 flex-col justify-between border border-border bg-panel/80 p-6 outline-offset-4 transition-colors hover:border-ivory/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-seal"
              >
                <div>
                  <p className="font-sans text-[0.65rem] uppercase tracking-[0.35em] text-brass">{path.eyebrow}</p>
                  <h3 className="mt-4 font-arabic-display text-3xl text-ivory">{path.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-mist">{path.body}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm text-ivory">
                  تابع
                  <ArrowLeft className="size-4 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-x-1" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
