"use client";

import Link from "next/link";
import { brand } from "@/lib/brand";

type StoreErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Customer-facing error boundary — no internal details. */
export default function StoreError({ reset }: StoreErrorProps) {
  return (
    <div className="mx-auto flex min-h-[50svh] max-w-xl flex-col justify-center px-5 py-24 text-center text-ivory md:px-8">
      <p className="font-sans text-[0.68rem] uppercase tracking-[0.38em] text-brass">Interrupted</p>
      <h1 className="mt-4 font-arabic-display text-4xl md:text-5xl">تعذّر عرض هذه الصفحة</h1>
      <p className="mt-4 leading-8 text-mist">
        حدث خلل مؤقت في الواجهة. أعد المحاولة، أو عد إلى {brand.nameAr}.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="pressable inline-flex h-12 items-center bg-seal px-6 text-sm text-ivory"
        >
          إعادة المحاولة
        </button>
        <Link href="/" className="inline-flex h-12 items-center border border-border px-6 text-sm text-ivory">
          الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
