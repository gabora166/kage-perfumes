import type { BottleSize, Product, WearLevel } from "@/lib/catalog/types";

export type ProductStory = Pick<
  Product,
  "longevity" | "sillage" | "longevitySpan" | "sillageSpan" | "sensoryVibe" | "mood" | "season" | "occasion" | "attire"
>;

export const houseStories: Record<string, ProductStory> = {
  "layl-al-anbar": {
    longevity: 5,
    sillage: 4,
    longevitySpan: "٧ إلى ٩ ساعات",
    sillageSpan: "معتدل إلى قوي",
    sensoryVibe: "عنبر يهدأ على الجلد كغرفة أُطفئ نورها. دفء بطيء، قريب، ويبقى بعد أن يغادر الحديث.",
    mood: "دافئ، ليلي، حميمي",
    season: "مساء الخريف والشتاء",
    occasion: "عشاء هادئ وسهرة",
    attire: "معطف داكن أو حرير المساء",
  },
  "oud-al-malik": {
    longevity: 5,
    sillage: 3,
    longevitySpan: "٨ إلى ١٠ ساعات",
    sillageSpan: "معتدل",
    sensoryVibe: "عود يجلس قريبًا من النبض ولا يرفع صوته. حضور وقور، خشبي، ويترك أثرًا بعد الغياب.",
    mood: "وقور، خشبي، هادئ القوة",
    season: "شتاء، ومجالس المساء",
    occasion: "مجالس رسمية",
    attire: "بدلة داكنة أو ثوب رسمي",
  },
  "ward-dimashq": {
    longevity: 3,
    sillage: 3,
    longevitySpan: "٤ إلى ٦ ساعات",
    sillageSpan: "ناعم إلى معتدل",
    sensoryVibe: "وردة مبللة بالندى، خفيفة على المعصم، كأن الصباح ما زال على الجلد.",
    mood: "زهري، رقيق، مضيء",
    season: "نهار الربيع",
    occasion: "لقاءات خفيفة",
    attire: "قطن فاتح أو فستان نهاري",
  },
  "misk-al-harir": {
    longevity: 4,
    sillage: 2,
    longevitySpan: "٦ إلى ٨ ساعات",
    sillageSpan: "قريب من الجلد",
    sensoryVibe: "مسك ناعم يلامس الجلد كحرير. حضور شخصي لا يسبقك إلى الغرفة، ويبقى لمن اقترب.",
    mood: "ناعم، نظيف، حميمي",
    season: "طوال العام",
    occasion: "يومي، قريب من الجلد",
    attire: "كشمير أو قطن يومي",
  },
  "sandal-al-qamar": {
    longevity: 4,
    sillage: 2,
    longevitySpan: "٦ إلى ٨ ساعات",
    sillageSpan: "ناعم",
    sensoryVibe: "صندل كريمي بارد، كخشب غُسل بضوء. هدوء نهاري يليق بالمكتب والظل.",
    mood: "هادئ، كريمي، بارد الدفء",
    season: "نهار الصيف والربيع",
    occasion: "المكتب ونهار هادئ",
    attire: "كتان أو ملابس المكتب",
  },
  "yasmin-layl": {
    longevity: 4,
    sillage: 4,
    longevitySpan: "٦ إلى ٨ ساعات",
    sillageSpan: "معتدل إلى قوي",
    sensoryVibe: "ياسمين يفتح بعد العشاء. أبيض، دافئ قليلًا، ويترك أثرًا في الهواء القريب.",
    mood: "زهري، مسائي، رقيق",
    season: "مساء الربيع والصيف",
    occasion: "بعد العشاء",
    attire: "فستان المساء أو قماش خفيف",
  },
};

export const defaultStory: ProductStory = {
  longevity: 3,
  sillage: 3,
  longevitySpan: "٥ إلى ٧ ساعات",
  sillageSpan: "معتدل",
  sensoryVibe: "حضور هادئ على الجلد، قريب من النبض، ويترك أثرًا لطيفًا بعد الرحيل.",
  mood: "هادئ ومتزن",
  season: "طوال العام",
  occasion: "يومي",
  attire: "ملابس يومية ناعمة",
};

export const longevityLabels: Record<WearLevel, string> = {
  1: "خاطف",
  2: "قصير",
  3: "معتدل",
  4: "طويل",
  5: "يمتد مع الليل",
};

export const sillageLabels: Record<WearLevel, string> = {
  1: "همس على الجلد",
  2: "قريب من النبض",
  3: "حضور هادئ",
  4: "يملأ الجوار",
  5: "يسبقك إلى الغرفة",
};

export const bottleSizeStories: Record<BottleSize, { title: string; body: string }> = {
  30: {
    title: "زجاجة السفر والاكتشاف",
    body: "ثلاثون ملًا تكفي لتجربة العطر على الجلد بضعة أسابيع، وتُحمل في الحقيبة دون أن تُثقلها.",
  },
  50: {
    title: "التوقيع اليومي",
    body: "خمسون ملًا تُفتح كل صباح. تكفي موسمًا من الرش المعتدل على النبض والعنق.",
  },
  100: {
    title: "طقس التسريحة",
    body: "مئة مل تجلس في الدار، وتُرش بسخاء حين تريد أن يبقى الأثر في الغرفة ومعطف المساء.",
  },
};

export function listRitualCompanions(product: Product, products: readonly Product[]): Product[] {
  const others = products.filter((item) => item.id !== product.id && item.isPublished);
  const differentFamily = others.filter((item) => item.family !== product.family);
  const pool = differentFamily.length > 0 ? differentFamily : others;
  return pool.slice(0, 3);
}

export function splitNotes(value: string): string[] {
  return value.split(/[،,]/).map((note) => note.trim()).filter((note) => note.length > 0);
}

export function storyForHouse(id: string): ProductStory {
  return houseStories[id] ?? defaultStory;
}
