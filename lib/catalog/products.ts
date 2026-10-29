import { sampleForHouse } from "@/lib/catalog/samples";
import { defaultStockCount } from "@/lib/catalog/stock";
import { listRitualCompanions, storyForHouse } from "@/lib/catalog/story";
import type { Product, ProductOffer } from "@/lib/catalog/types";

type HouseProduct = Omit<
  Product,
  | "images"
  | "isPublished"
  | "offers"
  | "longevity"
  | "sillage"
  | "longevitySpan"
  | "sillageSpan"
  | "sensoryVibe"
  | "mood"
  | "season"
  | "occasion"
  | "attire"
  | "sample"
> & {
  offers: Array<Omit<ProductOffer, "stockCount" | "isListed">>;
};

const houseCatalog: HouseProduct[] = [
  {
    id: "layl-al-anbar",
    slug: "layl-al-anbar",
    nameAr: "ليل العنبر",
    nameEn: "Nocturne Amber",
    family: "oriental",
    descriptionAr:
      "عنبر دافئ يتنفس ببطء على الجلد. زعفران هادئ في البداية، ثم لبان، ثم مسك يغمق مع ساعات الليل.",
    notes: { top: "برغموت، زعفران", heart: "ورد محروق، لبان", base: "عنبر، مسك" },
    offers: [
      { sizeMl: 30, priceSar: 480 },
      { sizeMl: 50, priceSar: 760 },
      { sizeMl: 100, priceSar: 1120 },
    ],
    isFeatured: true,
  },
  {
    id: "oud-al-malik",
    slug: "oud-al-malik",
    nameAr: "عود الملك",
    nameEn: "Crown Oud",
    family: "woody",
    descriptionAr:
      "عود كمبودي مصقول لا يرفع صوته. يجلس قريبًا من النبض، ويترك خشب الصندل أثرًا ناعمًا بعد الغياب.",
    notes: { top: "بهار وردي", heart: "عود، أرز", base: "صندل، جلود ناعمة" },
    offers: [
      { sizeMl: 50, priceSar: 980 },
      { sizeMl: 100, priceSar: 1680 },
    ],
    isFeatured: true,
  },
  {
    id: "ward-dimashq",
    slug: "ward-dimashq",
    nameAr: "ورد دمشق",
    nameEn: "Damascene Rose",
    family: "floral",
    descriptionAr:
      "وردة مقطوفة قبل الفجر، مبللة بالندى. شاي أخضر يفتحها، ومسك أبيض يُبقيها خفيفة على المعصم.",
    notes: { top: "ليتشي، شاي أخضر", heart: "ورد دمشقي", base: "مسك أبيض، أخشاب شاحبة" },
    offers: [
      { sizeMl: 30, priceSar: 440 },
      { sizeMl: 50, priceSar: 690 },
      { sizeMl: 100, priceSar: 990 },
    ],
    isFeatured: true,
  },
  {
    id: "misk-al-harir",
    slug: "misk-al-harir",
    nameAr: "مسك الحرير",
    nameEn: "Silk Musk",
    family: "oriental",
    descriptionAr:
      "مسك نظيف كقماش فاخر. دافئ دون ثقل، يبقى همسًا بعد الوداع ويظهر أكثر حين يدفأ الجلد.",
    notes: { top: "برغموت، فلفل وردي", heart: "إيريس، مسك", base: "أمبروكسان، فانيلا شاحبة" },
    offers: [
      { sizeMl: 30, priceSar: 420 },
      { sizeMl: 50, priceSar: 640 },
      { sizeMl: 100, priceSar: 920 },
    ],
    isFeatured: false,
  },
  {
    id: "sandal-al-qamar",
    slug: "sandal-al-qamar",
    nameAr: "صندل القمر",
    nameEn: "Lunar Sandal",
    family: "woody",
    descriptionAr:
      "صندل كريمي بارد، كأن الخشب غُسل بضوء فضي. هيل خفيف في الفتحة، ثم حليب خشب هادئ.",
    notes: { top: "برغموت، هيل", heart: "صندل، أرز", base: "حليب خشب، مسك" },
    offers: [
      { sizeMl: 50, priceSar: 720 },
      { sizeMl: 100, priceSar: 1080 },
    ],
    isFeatured: false,
  },
  {
    id: "yasmin-layl",
    slug: "yasmin-layl",
    nameAr: "ياسمين الليل",
    nameEn: "Night Jasmine",
    family: "floral",
    descriptionAr:
      "ياسمين ينفتح بعد العشاء، حلو ومخملي، مع أثر خفيف من الدخان لا يطغى على الزهرة.",
    notes: { top: "كمثرى، برغموت", heart: "ياسمين، زهر البرتقال", base: "تونكا، بخور خفيف" },
    offers: [
      { sizeMl: 30, priceSar: 460 },
      { sizeMl: 50, priceSar: 710 },
      { sizeMl: 100, priceSar: 1040 },
    ],
    isFeatured: false,
  },
];

export const catalog: Product[] = houseCatalog.map((product) => ({
  ...product,
    ...storyForHouse(product.id),
    sample: sampleForHouse(product.id),
    images: { bottle: null, liquid: null, texture: null, pyramid: null },
  isPublished: true,
  offers: product.offers.map((offer) => ({ ...offer, stockCount: defaultStockCount, isListed: true })),
}));

export function getProductBySlug(slug: string): Product | undefined {
  return catalog.find((product) => product.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return catalog.filter((product) => product.isFeatured);
}

export function getRelatedProducts(product: Product): Product[] {
  return listRitualCompanions(product, catalog);
}
