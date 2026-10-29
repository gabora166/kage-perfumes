import { Suspense } from "react";
import { AdminFallback } from "@/components/admin/admin-fallback";
import { DiscoveryEditor } from "@/components/admin/discovery-editor";
import { ProductTable } from "@/components/admin/product-table";
import { getDiscoverySet } from "@/lib/db/discovery";
import { listAllProducts, listPublishedProducts } from "@/lib/db/products";

export const metadata = {
  title: "العطور",
};

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Products />
    </Suspense>
  );
}

async function Products() {
  const products = await listAllProducts();
  const discoverySet = await getDiscoverySet(await listPublishedProducts());
  return (
    <>
      <DiscoveryEditor discoverySet={discoverySet} />
      <ProductTable products={products} />
    </>
  );
}
