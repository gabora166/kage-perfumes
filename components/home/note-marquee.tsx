import { marqueeNotes } from "@/lib/brand";

/** S8 — restrained note ribbon; pauses on hover/focus; static under reduced motion. */
export function NoteMarquee() {
  const loop = [...marqueeNotes, ...marqueeNotes];
  return (
    <section aria-labelledby="house-notes" className="border-t border-ink/10 px-5 py-12 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
        <h2 id="house-notes" className="shrink-0 text-sm text-ink/70">
          نوتات تظهر في عطور الدار
        </h2>
        <div className="note-marquee-viewport min-w-0 flex-1">
          <ul className="note-marquee-track text-sm text-ink" aria-label="نوتات الدار">
            {loop.map((note, index) => (
              <li
                key={`${note}-${index}`}
                className="shrink-0"
                aria-hidden={index >= marqueeNotes.length ? true : undefined}
              >
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
