import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { AdminFallback } from "@/components/admin/admin-fallback";
import { Wordmark } from "@/components/brand/wordmark";
import { getAdminSession } from "@/lib/auth/session";

export const metadata = {
  title: "دخول الإدارة",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<AdminFallback label="KAGE" />}>
      <LoginGate />
    </Suspense>
  );
}

async function LoginGate() {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  return (
    <main className="grid min-h-svh place-items-center px-5 py-16">
      <div className="w-full max-w-md border border-gold/25 bg-ink-soft px-6 py-10 text-cream md:px-10">
        <Wordmark className="text-3xl" />
        <h1 className="mt-8 font-arabic-display text-5xl">باب الدار</h1>
        <p className="mt-3 leading-7 text-mist">مدخل العطّار لإدارة العطور والطلبات على خادمك الخاص.</p>
        <LoginForm />
        <Link href="/" className="mt-8 inline-block text-sm text-gold">
          العودة إلى المتجر
        </Link>
      </div>
    </main>
  );
}
