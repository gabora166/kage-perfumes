"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Package,
  Sparkles,
  Ticket,
} from "lucide-react";
import type { ReactNode } from "react";
import { signOut } from "@/app/admin/actions";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/cn";

type AdminShellProps = {
  email: string;
  children: ReactNode;
};

const links = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/products", label: "العطور", icon: Package },
  { href: "/admin/bundles", label: "الباندل", icon: Layers },
  { href: "/admin/orders", label: "الطلبات", icon: ClipboardList },
  { href: "/admin/bespoke", label: "طلبات خاصة", icon: Sparkles },
  { href: "/admin/reviews", label: "الآراء", icon: MessageSquareQuote },
  { href: "/admin/promos", label: "الرموز", icon: Ticket },
  { href: "/admin/password", label: "كلمة المرور", icon: KeyRound },
] as const;

export function AdminShell({ email, children }: AdminShellProps) {
  const pathname = usePathname();
  return (
    <div className="min-h-svh bg-ink text-cream md:ps-64">
      <aside className="border-b border-gold/20 bg-ink-soft md:fixed md:inset-y-0 md:start-0 md:w-64 md:border-b-0 md:border-e">
        <div className="px-5 py-6">
          <Link href="/">
            <Wordmark className="text-2xl" />
          </Link>
          <p className="mt-2 text-xs text-mist">لوحة الدار</p>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-4 md:flex-col md:px-3" aria-label="إدارة الدار">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm",
                  isActive ? "bg-gold/15 text-gold" : "text-cream/75 hover:text-cream",
                )}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="px-5 py-6 md:px-10 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs text-mist">الدخول</p>
            <p dir="ltr" className="text-start text-sm text-gold-bright">{email}</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="inline-flex items-center gap-2 text-sm text-cream/80">
              <LogOut className="size-4" />
              خروج
            </button>
          </form>
        </div>
        <div className="pt-8">{children}</div>
      </div>
    </div>
  );
}
