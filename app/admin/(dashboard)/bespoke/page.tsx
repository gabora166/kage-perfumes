import { Suspense } from "react";
import { AdminFallback } from "@/components/admin/admin-fallback";
import { BespokeManager } from "@/components/admin/bespoke-manager";
import { listBespokeRequests } from "@/lib/db/bespoke-requests";

export const metadata = {
  title: "طلبات خاصة",
  robots: { index: false, follow: false },
};

export default function AdminBespokePage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <BespokeBoard />
    </Suspense>
  );
}

async function BespokeBoard() {
  const requests = await listBespokeRequests();
  return <BespokeManager requests={requests} />;
}
