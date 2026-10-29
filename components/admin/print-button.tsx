"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="h-11 bg-gold px-6 text-sm text-ink">
      اطبع ورقة التجهيز
    </button>
  );
}
