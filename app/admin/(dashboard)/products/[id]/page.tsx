import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminFallback } from "@/components/admin/admin-fallback";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById } from "@/lib/db/products";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "تعديل العطر",
};

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  return (
    <div>
      <h1 className="font-arabic-display text-5xl">تعديل العطر</h1>
      <div className="mt-8">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
