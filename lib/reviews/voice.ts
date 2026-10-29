export const reviewKinds = ["screenshot", "written"] as const;

export type ReviewKind = (typeof reviewKinds)[number];

export type ProductReview = {
  id: string;
  productId: string;
  productName: string;
  kind: ReviewKind;
  authorName: string;
  stars: number | null;
  body: string;
  caption: string;
  imagePath: string | null;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
};

export type ReviewSummary = {
  average: number;
  count: number;
};

const longDigitRun = /\d{8,}/;

export function isReviewKind(value: string): value is ReviewKind {
  return reviewKinds.some((kind) => kind === value);
}

export function isCustomerReviewImage(path: string | null): path is string {
  if (!path || path.includes("..")) return false;
  return path.startsWith("/uploads/reviews/");
}

export function readSortOrder(value: unknown): number {
  if (value === undefined || value === null || value === "") return 0;
  const order = Number(value);
  if (!Number.isInteger(order) || order < 0 || order > 999) return 0;
  return order;
}

export function readAuthorName(value: unknown): string {
  const name = readText(value, 2, 40, "اكتب الاسم الأول فقط.");
  if (longDigitRun.test(name)) throw new Error("اكتب الاسم الأول فقط.");
  return name;
}

export function readReviewBody(value: unknown): string {
  const body = readText(value, 8, 280, "الرأي يحتاج جملة واضحة.");
  if (longDigitRun.test(body)) throw new Error("لا تضع رقم جوال في الرأي.");
  return body;
}

export function readReviewCaption(value: unknown): string {
  const caption = readText(value, 2, 80, "اكتب سطرًا قصيرًا تحت الصورة.");
  if (longDigitRun.test(caption)) throw new Error("لا تضع رقم جوال تحت الصورة.");
  return caption;
}

export function readStars(value: unknown): number {
  const stars = Number(value);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new Error("اختر تقييمًا من نجمة إلى خمس.");
  return stars;
}

export function summarizeReviews(reviews: ProductReview[]): ReviewSummary | null {
  const written = reviews.filter((review) => review.kind === "written" && review.stars !== null);
  if (written.length === 0) return null;
  const total = written.reduce((sum, review) => sum + (review.stars ?? 0), 0);
  return { average: total / written.length, count: written.length };
}

export function formatReviewAverage(value: number): string {
  return new Intl.NumberFormat("ar-EG-u-nu-latn", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function reviewCountLabel(count: number): string {
  if (count === 1) return "رأي واحد";
  if (count === 2) return "رأيان";
  return `${count} آراء`;
}

function readText(value: unknown, minimum: number, maximum: number, message: string): string {
  if (typeof value !== "string") throw new Error(message);
  const text = value.trim();
  if (text.length < minimum || text.length > maximum) throw new Error(message);
  return text;
}
