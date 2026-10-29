import assert from "node:assert/strict";
import test from "node:test";
import {
  formatReviewAverage,
  isCustomerReviewImage,
  readAuthorName,
  readReviewBody,
  readStars,
  reviewCountLabel,
  summarizeReviews,
} from "./voice.ts";
import type { ProductReview } from "./voice.ts";

test("written review text rejects a phone number and keeps a first name", () => {
  assert.equal(readAuthorName("  ليلى "), "ليلى");
  assert.throws(() => readAuthorName("01099887766"), /الاسم/);
  assert.throws(() => readReviewBody("الثبات جميل 01099887766"), /جوال/);
  assert.equal(readStars("5"), 5);
  assert.throws(() => readStars("6"), /تقييم/);
});

test("a customer image stays inside the review uploads folder", () => {
  assert.equal(isCustomerReviewImage("/uploads/reviews/note.jpg"), true);
  assert.equal(isCustomerReviewImage("/uploads/products/layl-al-anbar-bottle.jpg"), false);
  assert.equal(isCustomerReviewImage("/uploads/reviews/../products/bottle.jpg"), false);
  assert.equal(isCustomerReviewImage(null), false);
});

test("summary counts written stars and ignores screenshots", () => {
  const summary = summarizeReviews([
    review("written", 5),
    review("written", 4),
    review("screenshot", null),
  ]);
  assert.equal(summary?.count, 2);
  assert.equal(summary?.average, 4.5);
  assert.equal(formatReviewAverage(4.5), "4.5");
  assert.equal(reviewCountLabel(1), "رأي واحد");
  assert.equal(summarizeReviews([review("screenshot", null)]), null);
});

function review(kind: ProductReview["kind"], stars: number | null): ProductReview {
  return {
    id: kind,
    productId: "layl",
    productName: "ليل العنبر",
    kind,
    authorName: "ليلى",
    stars,
    body: "ثبات دافئ في المساء.",
    caption: "القاهرة",
    imagePath: null,
    isVisible: true,
    sortOrder: 0,
    createdAt: "2026-10-17T00:00:00.000Z",
  };
}
