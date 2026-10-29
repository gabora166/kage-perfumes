"use client";

/** Legacy note configurator. /blend now uses BespokeRequestForm; kept because cart/orders still price custom blends. */
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { concentrationLabels } from "@/lib/catalog/labels";
import type { Concentration } from "@/lib/catalog/labels";
import { formatPrice, formatSize } from "@/lib/catalog/money";
import { bottleSizes } from "@/lib/catalog/types";
import type { BottleSize } from "@/lib/catalog/types";
import { blendLimits, blendNotes, canPriceBlend, noteGroupLabels, priceCustomBlend } from "@/lib/pricing/custom-blend";
import { cn } from "@/lib/cn";

const groups = ["top", "heart", "base"] as const;

export function PerfumeBuilder() {
  const { addCustomItem } = useCart();
  const [sizeMl, setSizeMl] = useState<BottleSize>(50);
  const [concentration, setConcentration] = useState<Concentration>("eau-de-parfum");
  const [noteIds, setNoteIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const price = useMemo(() => {
    if (!canPriceBlend(noteIds.length)) return null;
    return priceCustomBlend({ sizeMl, concentration, noteCount: noteIds.length });
  }, [concentration, noteIds.length, sizeMl]);
  const selectedNotes = blendNotes.filter((note) => noteIds.includes(note.id));
  const notesReady = canPriceBlend(noteIds.length);
  const notesShort = noteIds.length > 0 && noteIds.length < blendLimits.minimumNotes;
  const notesFull = noteIds.length >= blendLimits.maximumNotes;

  function toggleNote(id: string): void {
    setNoteIds((current) => {
      if (current.includes(id)) {
        setMessage("");
        return current.filter((noteId) => noteId !== id);
      }
      if (current.length >= blendLimits.maximumNotes) {
        setMessage(`يمكن اختيار ${blendLimits.maximumNotes} نوتات كحد أقصى.`);
        return current;
      }
      setMessage("");
      return [...current, id];
    });
  }

  function handleAdd(): void {
    if (!canPriceBlend(noteIds.length)) {
      setMessage(`اختر من ${blendLimits.minimumNotes} إلى ${blendLimits.maximumNotes} نوتات.`);
      return;
    }
    addCustomItem({ sizeMl, concentration, noteIds });
    setMessage("");
  }

  return (
    <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-16">
      <div className="space-y-12">
        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-1">
            <span className="block text-sm text-brass">1 · الحجم</span>
            <span className="mt-2 block font-arabic-display text-3xl md:text-4xl">حجم الزجاجة</span>
          </legend>
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="حجم الزجاجة">
            {bottleSizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={sizeMl === size}
                onClick={() => setSizeMl(size)}
                className={chipClass(sizeMl === size)}
              >
                {formatSize(size)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="min-w-0 border-0 border-t border-border p-0 pt-10">
          <legend className="mb-1">
            <span className="block text-sm text-brass">2 · الكثافة</span>
            <span className="mt-2 block font-arabic-display text-3xl md:text-4xl">تركيز العطر</span>
          </legend>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {(Object.keys(concentrationLabels) as Concentration[]).map((entry) => (
              <button
                key={entry}
                type="button"
                aria-pressed={concentration === entry}
                onClick={() => setConcentration(entry)}
                className={cn(
                  "border p-5 text-start",
                  concentration === entry ? "border-seal bg-ivory text-ink" : "border-border bg-panel text-ivory",
                )}
              >
                <span className="block text-lg">{concentrationLabels[entry].ar}</span>
                <span className="mt-1 block font-display italic text-mist">{concentrationLabels[entry].en}</span>
                <span className="mt-2 block text-sm leading-7 text-mist">{concentrationLabels[entry].description}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="min-w-0 border-0 border-t border-border p-0 pt-10">
          <legend className="mb-1">
            <span className="block text-sm text-brass">3 · النوتات</span>
            <span className="mt-2 block font-arabic-display text-3xl md:text-4xl">اختر التركيبة</span>
          </legend>
          <p className="mt-4 text-sm leading-7 text-mist">
            من {blendLimits.minimumNotes} إلى {blendLimits.maximumNotes} نوتات. كل نوتة تضيف {formatPrice(blendLimits.noteFeeSar)}.
          </p>
          {notesShort ? (
            <p className="mt-2 text-sm text-mist">اختر نوتة إضافية واحدة على الأقل لإظهار السعر.</p>
          ) : null}
          {notesFull ? (
            <p className="mt-2 text-sm text-mist">وصلت إلى الحد الأقصى. أزل نوتة إن أردت استبدالها.</p>
          ) : null}
          <div className="mt-6 space-y-7">
            {groups.map((group) => (
              <div key={group}>
                <p className="text-sm text-brass">{noteGroupLabels[group]}</p>
                <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={noteGroupLabels[group]}>
                  {blendNotes
                    .filter((note) => note.group === group)
                    .map((note) => {
                      const selected = noteIds.includes(note.id);
                      const blocked = !selected && notesFull;
                      return (
                        <button
                          key={note.id}
                          type="button"
                          aria-pressed={selected}
                          disabled={blocked}
                          onClick={() => toggleNote(note.id)}
                          className={cn(chipClass(selected), blocked ? "opacity-40" : "")}
                        >
                          {note.nameAr}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-mist" aria-live="polite">
            {selectedNotes.length === 0
              ? "لم تُختر نوتات بعد."
              : `المختار (${selectedNotes.length}): ${selectedNotes.map((note) => note.nameAr).join("، ")}`}
          </p>
        </fieldset>

        <div className="border-t border-border pt-8 lg:hidden">
          <BlendSummary
            sizeMl={sizeMl}
            concentration={concentration}
            selectedNotes={selectedNotes.map((note) => note.nameAr)}
            price={price}
            notesReady={notesReady}
            onAdd={handleAdd}
            message={message}
          />
        </div>
      </div>

      <aside className="hidden lg:sticky lg:top-24 lg:block">
        <BlendSummary
          sizeMl={sizeMl}
          concentration={concentration}
          selectedNotes={selectedNotes.map((note) => note.nameAr)}
          price={price}
          notesReady={notesReady}
          onAdd={handleAdd}
          message={message}
        />
      </aside>
    </div>
  );
}

type BlendSummaryProps = {
  sizeMl: BottleSize;
  concentration: Concentration;
  selectedNotes: string[];
  price: number | null;
  notesReady: boolean;
  onAdd: () => void;
  message: string;
};

function BlendSummary({
  sizeMl,
  concentration,
  selectedNotes,
  price,
  notesReady,
  onAdd,
  message,
}: BlendSummaryProps) {
  return (
    <div className="border border-border bg-ivory px-5 py-6 text-ink md:px-6 lg:sticky lg:top-24">
      <p className="text-sm text-brass">ملخص التركيبة</p>
      <h2 className="mt-2 font-arabic-display text-3xl">ما اخترته</h2>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-ink/10 pb-3">
          <dt className="text-ink/70">الحجم</dt>
          <dd>{formatSize(sizeMl)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-ink/10 pb-3">
          <dt className="text-ink/70">الكثافة</dt>
          <dd className="text-end">{concentrationLabels[concentration].ar}</dd>
        </div>
        <div className="border-b border-ink/10 pb-3">
          <dt className="text-ink/70">النوتات</dt>
          <dd className="mt-2 leading-7">
            {selectedNotes.length === 0 ? "—" : selectedNotes.join(" · ")}
          </dd>
        </div>
      </dl>
      <p className="mt-5 text-sm text-ink/70">
        {price === null ? "يظهر السعر بعد اختيار نوتتين على الأقل." : "سعر هذه التركيبة"}
      </p>
      <p dir="ltr" className="mt-1 w-fit font-display text-5xl" aria-live="polite">
        {price === null ? "—" : formatPrice(price)}
      </p>
      <button
        type="button"
        onClick={onAdd}
        disabled={!notesReady}
        className="pressable mt-6 h-12 w-full bg-seal px-8 text-sm text-ivory disabled:opacity-40"
      >
        أضف العطر الخاص
      </button>
      {message ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function chipClass(isActive: boolean): string {
  return isActive
    ? "inline-flex min-h-11 items-center border border-seal bg-seal px-4 text-sm text-ivory"
    : "inline-flex min-h-11 items-center border border-border px-4 text-sm text-ivory disabled:cursor-not-allowed";
}
