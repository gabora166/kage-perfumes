"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useId, useState } from "react";
import {
  buildNoteTiers,
  type NoteTierKey,
  type NoteTierView,
  type ResolvedIngredient,
} from "@/lib/catalog/ingredients";
import type { FragranceNotes } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { kageDuration, kageEase, kageStagger } from "@/lib/motion/tokens";

type FragrancePyramidProps = {
  notes: FragranceNotes;
  /** Hide the local heading when the parent dossier already provides one */
  embedded?: boolean;
};

type Selection =
  | { kind: "tier"; tier: NoteTierKey }
  | { kind: "ingredient"; tier: NoteTierKey; ingredientId: string }
  | null;

export function FragrancePyramid({ notes, embedded = false }: FragrancePyramidProps) {
  const tiers = buildNoteTiers(notes);
  const titleId = useId();
  const stageGroupId = useId();
  const prefersReducedMotion = useReducedMotion();
  const [selection, setSelection] = useState<Selection>(null);
  if (tiers.length === 0) return null;

  const selectedIngredient = findSelectedIngredient(tiers, selection);
  const activeTierKey = selection?.tier ?? null;

  function selectTier(tier: NoteTierKey): void {
    setSelection((current) => (current?.kind === "tier" && current.tier === tier ? null : { kind: "tier", tier }));
  }

  function selectIngredient(tier: NoteTierKey, ingredientId: string): void {
    setSelection((current) =>
      current?.kind === "ingredient" && current.ingredientId === ingredientId
        ? null
        : { kind: "ingredient", tier, ingredientId },
    );
  }

  return (
    <div>
      {embedded ? (
        <h3 id={titleId} className="sr-only">
          الهرم العطري
        </h3>
      ) : (
        <>
          <p className="text-[0.7rem] tracking-[0.2em] text-brass uppercase">Fragrance pyramid</p>
          <h3 id={titleId} className="mt-2 font-arabic-display text-3xl text-ivory">
            الهرم العطري
          </h3>
          <p className="mt-2 max-w-lg text-sm leading-7 text-mist">
            المقدمة فالقلب فالقاعدة، مع صور تمثيلية للمكوّنات كما وردت في بيانات العطر.
          </p>
        </>
      )}

      <div
        className={cn("relative mx-auto w-full max-w-xl", embedded ? "mt-0" : "mt-7")}
        aria-labelledby={titleId}
      >
        <PyramidFrame />
        <p id={stageGroupId} className="sr-only">
          طبقات الهرم العطري
        </p>
        <motion.div
          className="relative z-[1] flex flex-col items-center"
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: prefersReducedMotion ? 0 : kageStagger.tight,
                delayChildren: prefersReducedMotion ? 0 : 0.03,
              },
            },
          }}
        >
          {tiers.map((tier, index) => (
            <PyramidLevel
              key={tier.key}
              tier={tier}
              index={index}
              tierCount={tiers.length}
              selection={selection}
              activeTierKey={activeTierKey}
              prefersReducedMotion={Boolean(prefersReducedMotion)}
              stageGroupId={stageGroupId}
              onSelectTier={selectTier}
              onSelectIngredient={selectIngredient}
            />
          ))}
        </motion.div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {selectedIngredient ? (
          <motion.div
            key={selectedIngredient.id}
            role="status"
            aria-live="polite"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: kageDuration.instant, ease: kageEase }}
            className="mx-auto mt-4 max-w-xl border-t border-border pt-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="font-arabic-display text-lg text-ivory">{selectedIngredient.nameAr}</p>
                {selectedIngredient.nameEn ? (
                  <p className="font-display text-sm italic text-mist">{selectedIngredient.nameEn}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setSelection(null)}
                className="inline-flex min-h-10 items-center text-sm text-brass underline-offset-4 hover:underline"
              >
                إلغاء التحديد
              </button>
            </div>
            <p className="mt-1.5 text-sm leading-6 text-mist">
              {selectedIngredient.hasImage
                ? "مكوّن من هرم هذا العطر، مع صورة تمثيلية معتمدة."
                : "مكوّن من هرم هذا العطر. لا تتوفر صورة معتمدة بعد."}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type PyramidLevelProps = {
  tier: NoteTierView;
  index: number;
  tierCount: number;
  selection: Selection;
  activeTierKey: NoteTierKey | null;
  prefersReducedMotion: boolean;
  stageGroupId: string;
  onSelectTier: (tier: NoteTierKey) => void;
  onSelectIngredient: (tier: NoteTierKey, ingredientId: string) => void;
};

function PyramidLevel({
  tier,
  index,
  tierCount,
  selection,
  activeTierKey,
  prefersReducedMotion,
  stageGroupId,
  onSelectTier,
  onSelectIngredient,
}: PyramidLevelProps) {
  const isActive = activeTierKey === tier.key;
  const isSecondary = activeTierKey !== null && !isActive;
  const widthPercent = pyramidWidthPercent(index, tierCount);
  const count = tier.ingredients.length;

  return (
    <motion.div
      className="w-full"
      style={{ maxWidth: `${widthPercent}%` }}
      variants={{
        hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: kageDuration.quick, ease: kageEase },
        },
      }}
    >
      {index > 0 ? (
        <div className="relative mx-auto h-3 w-px bg-brass/30" aria-hidden="true">
          <span className="absolute start-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass/60" />
        </div>
      ) : null}

      <div
        className={cn(
          "border transition-[border-color,background-color,opacity] duration-300",
          isActive ? "border-seal bg-seal/[0.1]" : "border-border/70 bg-panel/30",
          isSecondary && "opacity-40",
        )}
      >
        <button
          type="button"
          aria-pressed={isActive}
          aria-describedby={stageGroupId}
          aria-label={`${tier.labelAr}، ${tier.labelEn}`}
          onClick={() => onSelectTier(tier.key)}
          className={cn(
            "flex min-h-10 w-full items-center gap-2.5 border-b border-border/60 px-3 py-2 text-start outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-brass",
            isActive ? "text-ivory" : "text-mist hover:text-ivory",
          )}
        >
          <span className="font-display text-[0.65rem] tabular-nums tracking-[0.16em] text-brass">{tier.step}</span>
          <span className="font-arabic-display text-lg text-ivory">{tier.labelAr}</span>
          <span className="ms-auto hidden text-[0.6rem] tracking-[0.14em] text-mist/70 uppercase sm:inline">
            {tier.labelEn}
          </span>
        </button>

        <ul
          className={cn(
            "grid gap-2 p-2.5 sm:p-3",
            count === 1 && "mx-auto max-w-[7.25rem] grid-cols-1",
            count === 2 && "grid-cols-2",
            count === 3 && "grid-cols-3",
            count >= 4 && "grid-cols-2 sm:grid-cols-4",
          )}
        >
          {tier.ingredients.map((ingredient) => {
            const isSelected =
              selection?.kind === "ingredient" && selection.ingredientId === ingredient.id;
            const dimCard =
              selection !== null &&
              !(selection.kind === "tier" && selection.tier === tier.key) &&
              !isSelected;
            return (
              <li
                key={`${tier.key}-${ingredient.id}`}
                className={cn("transition-opacity duration-300", dimCard && "opacity-35")}
              >
                <IngredientCard
                  ingredient={ingredient}
                  isSelected={isSelected}
                  onSelect={() => onSelectIngredient(tier.key, ingredient.id)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
}

type IngredientCardProps = {
  ingredient: ResolvedIngredient;
  isSelected: boolean;
  onSelect: () => void;
};

function IngredientCard({ ingredient, isSelected, onSelect }: IngredientCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = ingredient.hasImage && Boolean(ingredient.imageSrc) && !imageFailed;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      className={cn(
        "group flex w-full flex-col overflow-hidden border text-start outline-none transition-[border-color,background-color] duration-300 focus-visible:ring-1 focus-visible:ring-brass",
        isSelected ? "border-seal bg-seal/10" : "border-border/60 bg-ink/30 hover:border-brass",
      )}
    >
      <span className="relative block aspect-square overflow-hidden bg-ink">
        {showImage && ingredient.imageSrc ? (
          <Image
            src={ingredient.imageSrc}
            alt={ingredient.imageAlt}
            fill
            sizes="(min-width: 1024px) 7vw, 22vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="absolute inset-0 flex items-end bg-[linear-gradient(160deg,#161412_0%,#1A1C1B_55%,#111211_100%)] px-2 py-2">
            <span className="font-display text-[0.6rem] tracking-[0.16em] text-brass/60">KAGE</span>
          </span>
        )}
      </span>
      <span className="flex flex-col gap-0.5 px-2 py-2">
        <span className="font-arabic-display text-sm leading-snug text-ivory sm:text-[0.95rem]">
          {ingredient.nameAr}
        </span>
        {ingredient.nameEn ? (
          <span className="font-display text-[0.7rem] italic leading-tight text-mist">{ingredient.nameEn}</span>
        ) : null}
      </span>
    </button>
  );
}

function PyramidFrame() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1 bottom-1 -z-0">
      <div
        className="mx-auto h-full w-full border border-brass/10"
        style={{ clipPath: "polygon(20% 0, 80% 0, 100% 100%, 0 100%)" }}
      />
    </div>
  );
}

function pyramidWidthPercent(index: number, count: number): number {
  if (count <= 1) return 82;
  if (count === 2) return index === 0 ? 70 : 94;
  const widths = [62, 82, 100];
  return widths[Math.min(index, widths.length - 1)] ?? 100;
}

function findSelectedIngredient(
  tiers: NoteTierView[],
  selection: Selection,
): ResolvedIngredient | null {
  if (!selection || selection.kind !== "ingredient") return null;
  const tier = tiers.find((entry) => entry.key === selection.tier);
  return tier?.ingredients.find((entry) => entry.id === selection.ingredientId) ?? null;
}
