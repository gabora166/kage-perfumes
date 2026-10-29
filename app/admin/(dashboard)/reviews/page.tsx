import { Suspense } from "react";
import { AdminFallback } from "@/components/admin/admin-fallback";
import { ReviewManager } from "@/components/admin/review-manager";
import { listAllReviews } from "@/lib/db/reviews";
import { listAllProducts } from "@/lib/db/products";

export const metadata = {
  title: "الآراء",
  robots: { index: false, follow: false },
};

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Reviews />
    </Suspense>
  );
}

async function Reviews() {
  const products = await listAllProducts();
  const reviews = await listAllReviews();
  return (
    <ReviewManager
      products={products.map((product) => ({ id: product.id, nameAr: product.nameAr }))}
      reviews={reviews}
    />
  );
}
