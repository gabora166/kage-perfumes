import { Suspense, type ReactNode } from "react";
import { AdminFallback } from "@/components/admin/admin-fallback";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/auth/session";

export const metadata = {
  title: "لوحة الدار",
  robots: { index: false, follow: false },
};

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <ProtectedDashboard>{children}</ProtectedDashboard>
    </Suspense>
  );
}

async function ProtectedDashboard({ children }: DashboardLayoutProps) {
  const session = await requireAdminSession();
  return (
    <AdminShell email={session.email}>
      {children}
    </AdminShell>
  );
}
