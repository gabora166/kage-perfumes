import { Suspense } from "react";
import { AdminFallback } from "@/components/admin/admin-fallback";
import { PromoManager } from "@/components/admin/promo-manager";
import { listPromos } from "@/lib/db/promos";

export const metadata = {
  title: "رموز خاصة",
  robots: { index: false, follow: false },
};

export default function AdminPromosPage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Promos />
    </Suspense>
  );
}

async function Promos() {
  const promos = await listPromos();
  return <PromoManager promos={promos} />;
}
