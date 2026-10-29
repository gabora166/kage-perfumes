import { ProductForm } from "@/components/admin/product-form";

export const metadata = {
  title: "عطر جديد",
};

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-arabic-display text-5xl">عطر جديد</h1>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
