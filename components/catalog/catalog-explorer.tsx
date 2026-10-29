"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { ProductCard } from "@/components/catalog/product-card";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import {
  catalogCountLabel,
  filterProducts,
  parseFamily,
  parseMood,
  parsePrice,
  parseSize,
  parseSort,
  priceFilterLabel,
  publishedFamilies,
  publishedPriceFilters,
  publishedSizes,
  sortProducts,
} from "@/lib/catalog/filters";
import type { CatalogSort, PriceFilter } from "@/lib/catalog/filters";
import { familyLabels } from "@/lib/catalog/labels";
import { formatSize } from "@/lib/catalog/money";
import { searchProducts } from "@/lib/catalog/search";
import type { FamilyFilter, Product, SizeFilter } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { kageDuration, kageEase } from "@/lib/motion/tokens";

type CatalogExplorerProps = {
  products: Product[];
};

type CatalogQuery = {
  family: FamilyFilter;
  size: SizeFilter;
  price: PriceFilter;
  sort: CatalogSort;
  mood: string | null;
  q: string;
};

export function CatalogExplorer({ products }: CatalogExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const sortId = useId();
  const searchId = useId();
  const panelId = useId();
  const [moreOpen, setMoreOpen] = useState(false);
  const family = parseFamily(searchParams.get("family") ?? undefined);
  const size = parseSize(searchParams.get("size") ?? undefined);
  const price = parsePrice(searchParams.get("price") ?? undefined);
  const sort = parseSort(searchParams.get("sort") ?? undefined);
  const mood = parseMood(searchParams.get("mood") ?? undefined);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 80);
  const query: CatalogQuery = { family, size, price, sort, mood, q };
  const families = publishedFamilies(products);
  const inFamily = filterProducts(products, family, "all", "all", mood);
  const sizes = publishedSizes(inFamily, size, price);
  const priceBands = publishedPriceFilters(inFamily, size);
  const visibleBands = price !== "all" && !priceBands.includes(price) ? [...priceBands, price] : priceBands;
  const filtered = filterProducts(products, family, size, price, mood);
  const searched = q.length >= 2 ? searchProducts(filtered, q) : filtered;
  const visibleProducts = sortProducts(searched, sort, size, price);
  const selectedFamily = family === "all" ? null : familyLabels[family];
  const activeChips = buildActiveChips(query);
  const hasActiveFilter = activeChips.length > 0;
  const secondaryActive = size !== "all" || price !== "all" || mood === "fresh";
  const reduce = Boolean(prefersReducedMotion);

  function applyQuery(next: CatalogQuery): void {
    replaceCatalog(router, next);
  }

  function selectFamily(nextFamily: FamilyFilter): void {
    applyQuery({ ...query, family: nextFamily, mood: null });
  }

  function selectSize(nextSize: SizeFilter): void {
    applyQuery({ ...query, size: nextSize });
  }

  function selectPrice(nextPrice: PriceFilter): void {
    applyQuery({ ...query, price: nextPrice });
  }

  function selectSort(nextSort: CatalogSort): void {
    applyQuery({ ...query, sort: nextSort });
  }

  function resetFilters(): void {
    applyQuery({ family: "all", size: "all", price: "all", sort: "default", mood: null, q: "" });
  }

  function clearChip(chip: ActiveChip): void {
    if (chip.key === "family") applyQuery({ ...query, family: "all" });
    else if (chip.key === "size") applyQuery({ ...query, size: "all" });
    else if (chip.key === "price") applyQuery({ ...query, price: "all" });
    else if (chip.key === "mood") applyQuery({ ...query, mood: null });
    else applyQuery({ ...query, q: "" });
  }

  function handleSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextQ = String(form.get("q") ?? "")
      .trim()
      .slice(0, 80);
    applyQuery({ ...query, q: nextQ });
  }

  return (
    <section className="px-5 pb-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-2">
          <div
            role="group"
            aria-label="العائلة العطرية"
            className="flex min-w-0 shrink-0 gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <FilterChip isActive={family === "all" && !mood} onClick={() => selectFamily("all")}>
              الكل
            </FilterChip>
            {families.map((entry) => (
              <FilterChip key={entry} isActive={family === entry} onClick={() => selectFamily(entry)}>
                {familyLabels[entry].ar}
              </FilterChip>
            ))}
          </div>
          <div className="relative shrink-0">
            <label htmlFor={sortId} className="sr-only">
              الترتيب
            </label>
            <select
              id={sortId}
              value={sort}
              onChange={(event) => selectSort(parseSort(event.target.value))}
              className="h-9 w-[9.25rem] appearance-none rounded-[3px] border border-ivory/16 bg-ink/70 pe-8 ps-3 text-sm text-ivory outline-none focus-visible:border-brass"
            >
              <option value="default">ترتيب حسب</option>
              <option value="price-asc">السعر من الأقل</option>
              <option value="price-desc">السعر من الأعلى</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-brass"
              aria-hidden="true"
              strokeWidth={1.5}
            />
          </div>
          <form
            onSubmit={handleSearch}
            className="flex min-w-0 flex-1 rounded-[3px] border border-ivory/16 bg-ink/70 lg:max-w-[20rem]"
            role="search"
          >
            <label className="sr-only" htmlFor={searchId}>
              بحث في العطور
            </label>
            <span className="grid place-items-center ps-2.5 text-brass" aria-hidden="true">
              <Search className="size-3.5" strokeWidth={1.5} />
            </span>
            <input
              id={searchId}
              name="q"
              key={q}
              defaultValue={q}
              maxLength={80}
              placeholder="ابحث عن عطر أو نوتة..."
              className="h-9 w-full bg-transparent px-2.5 text-sm text-ivory outline-none placeholder:text-mist/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brass"
            />
            <button type="submit" className="pressable h-9 shrink-0 px-2.5 text-sm text-brass hover:text-ivory">
              ابحث
            </button>
          </form>
          <button
            type="button"
            aria-expanded={moreOpen}
            aria-controls={panelId}
            onClick={() => setMoreOpen((open) => !open)}
            className={cn(
              "pressable inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[3px] border px-2.5 text-sm transition-colors",
              moreOpen || secondaryActive
                ? "border-brass/45 bg-ink/70 text-ivory"
                : "border-ivory/16 text-mist hover:border-brass/40 hover:text-ivory",
            )}
          >
            <SlidersHorizontal className="size-3.5" aria-hidden="true" strokeWidth={1.5} />
            المزيد
            {secondaryActive ? <span className="size-1.5 rounded-full bg-seal" aria-hidden="true" /> : null}
          </button>
        </div>

        {q.length > 0 && q.length < 2 ? (
          <p className="mt-2 text-sm text-mist">اكتب حرفين على الأقل للبحث في الأسماء والنوتات.</p>
        ) : null}

        <AnimatePresence initial={false}>
          {moreOpen ? (
            <motion.div
              id={panelId}
              key="more-filters"
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0.01 : kageDuration.quick, ease: kageEase }}
              className="overflow-hidden"
            >
              <div className="mt-2.5 space-y-3 rounded-[3px] border border-ivory/12 bg-ink/45 px-3 py-3">
                {sizes.length > 1 ? (
                  <FilterRow label="حجم الزجاجة">
                    <FilterChip isActive={size === "all"} onClick={() => selectSize("all")}>
                      كل الأحجام
                    </FilterChip>
                    {sizes.map((entry) => (
                      <FilterChip key={entry} isActive={size === entry} onClick={() => selectSize(entry)}>
                        {formatSize(entry)}
                      </FilterChip>
                    ))}
                  </FilterRow>
                ) : null}
                {visibleBands.length > 1 || price !== "all" ? (
                  <FilterRow label="السعر">
                    <FilterChip isActive={price === "all"} onClick={() => selectPrice("all")}>
                      كل الأسعار
                    </FilterChip>
                    {visibleBands.map((entry) => (
                      <FilterChip key={entry} isActive={price === entry} onClick={() => selectPrice(entry)}>
                        {priceFilterLabel(entry)}
                      </FilterChip>
                    ))}
                  </FilterRow>
                ) : null}
                {mood === "fresh" ? (
                  <p className="text-sm leading-7 text-mist">
                    مجموعة الضباب (MIST): عطور وردت في نصوصها المنشورة كلمات انتعاش أو خفة أو نهار.
                  </p>
                ) : null}
                {selectedFamily ? (
                  <p className="text-sm leading-7 text-mist">
                    {selectedFamily.ar}. {selectedFamily.description}
                  </p>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {hasActiveFilter ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-2" aria-label="التصفية النشطة">
            <AnimatePresence initial={false}>
              {activeChips.map((chip) => (
                <motion.button
                  key={chip.key}
                  type="button"
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                  transition={{ duration: kageDuration.micro, ease: kageEase }}
                  onClick={() => clearChip(chip)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[3px] border border-ivory/14 bg-ink/50 px-2.5 text-xs text-ivory transition-colors hover:border-brass"
                >
                  <span>{chip.label}</span>
                  <span aria-hidden="true" className="text-mist">
                    ×
                  </span>
                  <span className="sr-only">إزالة {chip.label}</span>
                </motion.button>
              ))}
            </AnimatePresence>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-8 items-center px-1.5 text-xs text-brass transition-colors hover:text-ivory"
            >
              مسح الكل
            </button>
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite">
          {catalogCountLabel(visibleProducts.length)}
          {q.length >= 2 ? ` لـ «${q}»` : ""}
        </p>

        {visibleProducts.length === 0 ? (
          <div className="mt-6 border-t border-ivory/10 pt-8">
            <p className="font-arabic-display text-3xl text-ivory md:text-4xl">
              {q.length >= 2 ? "لا توجد زجاجة بهذا الاسم أو هذه النوتة" : "لا توجد عطور في هذا الاختيار"}
            </p>
            <p className="mt-3 max-w-md leading-7 text-mist">
              {q.length >= 2
                ? "جرّب اسمًا أقصر، أو امسح البحث وصرّح بالمجموعة حسب العائلة والحجم."
                : "غيّر العائلة أو الحجم أو نطاق السعر، أو اعرض المجموعة كاملة."}
            </p>
            <button type="button" onClick={resetFilters} className="mt-6 inline-flex min-h-11 items-center text-brass">
              اعرض كل العطور
            </button>
          </div>
        ) : (
          <Stagger className="mt-3 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4" delay={0.03}>
            {visibleProducts.map((product) => (
              <StaggerItem key={product.id} className="h-full">
                <ProductCard product={product} size={size} price={price} tone="dark" layout="catalog" />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}

type ActiveChip = {
  key: "family" | "size" | "price" | "mood" | "q";
  label: string;
};

function buildActiveChips(query: CatalogQuery): ActiveChip[] {
  const chips: ActiveChip[] = [];
  if (query.family !== "all") {
    chips.push({ key: "family", label: familyLabels[query.family].ar });
  }
  if (query.size !== "all") {
    chips.push({ key: "size", label: formatSize(query.size) });
  }
  if (query.price !== "all") {
    chips.push({ key: "price", label: priceFilterLabel(query.price) });
  }
  if (query.mood === "fresh") {
    chips.push({ key: "mood", label: "الضباب · انتعاش" });
  }
  if (query.q.length > 0) {
    chips.push({ key: "q", label: `بحث: ${query.q}` });
  }
  return chips;
}

type FilterRowProps = {
  label: string;
  children: ReactNode;
};

function FilterRow({ label, children }: FilterRowProps) {
  return (
    <div>
      <p className="mb-2 text-xs text-brass">{label}</p>
      <div
        role="group"
        aria-label={label}
        className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}

type FilterChipProps = {
  children: ReactNode;
  isActive: boolean;
  onClick: () => void;
};

function FilterChip({ children, isActive, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        "pressable relative inline-flex h-9 shrink-0 items-center rounded-[3px] border px-3 text-sm transition-[border-color,background-color,color] duration-200",
        isActive ? "border-seal bg-seal text-ivory" : "border-ivory/16 text-ivory hover:border-brass",
      )}
    >
      {children}
    </button>
  );
}

function replaceCatalog(router: ReturnType<typeof useRouter>, query: CatalogQuery): void {
  const params = new URLSearchParams();
  if (query.family !== "all") params.set("family", query.family);
  if (query.size !== "all") params.set("size", String(query.size));
  if (query.price !== "all") params.set("price", query.price);
  if (query.sort !== "default") params.set("sort", query.sort);
  if (query.mood) params.set("mood", query.mood);
  if (query.q.length > 0) params.set("q", query.q);
  const next = params.toString();
  router.replace(next.length > 0 ? `/catalog?${next}` : "/catalog", { scroll: false });
}
