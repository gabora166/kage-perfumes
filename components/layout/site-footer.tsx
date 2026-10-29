import Link from "next/link";
import { BrandSeal } from "@/components/brand/brand-seal";
import { Wordmark } from "@/components/brand/wordmark";
import { AtelierNote } from "@/components/layout/atelier-note";
import { Reveal } from "@/components/motion/reveal";
import { brand, storeLinks } from "@/lib/brand";
import { trustLinks } from "@/lib/trust/policies";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-panel text-ivory">
      <Reveal variant="fade" className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8 xl:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="seal-hover inline-flex transition-transform duration-300 ease-out hover:scale-[1.05] hover:rotate-[-2deg] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:rotate-0">
              <BrandSeal size={36} />
            </span>
            <Wordmark className="text-2xl" />
          </div>
          <p className="mt-2 font-arabic text-sm text-mist">{brand.nameAr}</p>
          <p className="mt-5 max-w-sm leading-8 text-mist">{brand.conceptLine}</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-mist">
            {brand.supportLine} · {brand.city}
          </p>
          <p className="mt-4 font-sans text-[0.65rem] uppercase tracking-[0.32em] text-brass">{brand.taglineEn}</p>
        </div>
        <div>
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.35em] text-brass">الدار</p>
          <ul className="mt-5 space-y-3">
            {storeLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link href={link.href} className="text-ivory/80 transition-colors hover:text-brass">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#collections" className="text-ivory/80 transition-colors hover:text-brass">
                المجموعات
              </Link>
            </li>
            <li>
              <Link href="/track" className="text-ivory/80 transition-colors hover:text-brass">
                تتبع الطلب
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.35em] text-brass">الوضوح</p>
          <ul className="mt-5 space-y-3">
            {trustLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-ivory/80 transition-colors hover:text-brass">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.35em] text-brass">المراسلة</p>
          <a
            href={`mailto:${brand.email}`}
            className="mt-5 block text-ivory/80 transition-colors hover:text-brass"
            dir="ltr"
          >
            {brand.email}
          </a>
          <div className="mt-6">
            <AtelierNote />
          </div>
        </div>
      </Reveal>
      <div className="border-t border-border px-5 py-6 text-center font-sans text-[0.68rem] tracking-[0.32em] text-mist md:px-8">
        <span className="text-brass">{brand.name}</span>
        <span className="mx-3 text-border" aria-hidden="true">
          ·
        </span>
        <span aria-hidden="true">影</span>
        <span className="mx-3 text-border" aria-hidden="true">
          ·
        </span>
        {brand.taglineEn}
      </div>
    </footer>
  );
}
