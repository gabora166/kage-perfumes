import { Reveal } from "@/components/motion/reveal";

const steps = [
  {
    index: "01",
    title: "النبض",
    copy: "يُرش حيث يدفأ الجلد: المعصم، وأعلى الصدر. الحرارة هي التي تفتح التركيب.",
  },
  {
    index: "02",
    title: "الانتظار",
    copy: "اترك العطر دقيقة. القمة تتبخر، والقلب هو ما يبقى في الغرفة.",
  },
  {
    index: "03",
    title: "الأثر",
    copy: "لا تُكثر. الزجاجة الفاخرة تُعرَف بما تتركه بعد الخروج، لا بما تملأ به الدخول.",
  },
] as const;

export function RitualSection() {
  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="font-arabic-display text-5xl md:text-6xl">طقس الارتداء</h2>
        </Reveal>
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.index} className="border-t border-ink/15 pt-6">
              <p className="font-display text-3xl text-gold">{step.index}</p>
              <h3 className="mt-4 font-arabic-display text-4xl">{step.title}</h3>
              <p className="mt-4 leading-8 text-ink/70">{step.copy}</p>
            </article>
          ))}
        </div>
        <Reveal className="mt-20">
          <p className="max-w-xl font-arabic-display text-4xl leading-relaxed text-ink md:text-5xl">«العطر ذاكرةٌ تُرتدى.»</p>
        </Reveal>
      </div>
    </section>
  );
}
