"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { focusableElements, nextTrapTarget } from "@/lib/a11y/focus-trap";
import { BrandSeal } from "@/components/brand/brand-seal";
import { Wordmark } from "@/components/brand/wordmark";
import { useCart } from "@/components/cart/cart-provider";
import { brand, storeLinks } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { kageDuration, kageEase } from "@/lib/motion/tokens";

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const prefersReducedMotion = useReducedMotion();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isMenuOpen = openPath === pathname;
  const reduce = Boolean(prefersReducedMotion);

  useEffect(() => {
    const onScroll = (): void => {
      setIsScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const header = headerRef.current;
    const drawer = header?.querySelector<HTMLElement>("[data-mobile-nav]");
    const firstLink = drawer?.querySelector<HTMLElement>("a[href]");
    firstLink?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpenPath(null);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !header) return;
      const next = nextTrapTarget(focusableElements(header), document.activeElement, event.shiftKey);
      if (!next) return;
      event.preventDefault();
      next.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-[60] text-ivory transition-[background-color,border-color,backdrop-filter] duration-300",
        isScrolled || isMenuOpen
          ? "border-b border-border/90 bg-ink/95 backdrop-blur-md"
          : "border-b border-transparent bg-ink/55 backdrop-blur-sm",
      )}
    >
      {brand.announcement ? (
        <p className="border-b border-border/60 bg-panel/80 px-5 py-2 text-center text-xs tracking-wide text-mist md:px-8">
          {brand.announcement}
        </p>
      ) : null}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          aria-label={brand.name}
          className="group relative z-[70] flex items-center gap-3"
        >
          <span className="seal-hover inline-flex transition-transform duration-300 ease-out group-hover:scale-[1.06] group-hover:rotate-[-3deg] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
            <BrandSeal size={34} />
          </span>
          <Wordmark className="text-xl tracking-[0.32em] md:text-2xl" />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="التنقل">
          {storeLinks.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
              className={cn(
                "nav-ink text-sm text-mist transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-seal",
                isCurrent(pathname, link.href) && "text-ivory",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="relative z-[70] flex items-center gap-1">
          <Link
            href="/track"
            className="hidden h-11 items-center px-3 text-sm text-mist transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal lg:inline-flex"
          >
            تتبع الطلب
          </Link>
          <Link
            href="/search"
            aria-label="بحث"
            className="grid size-11 place-items-center text-ivory transition-colors hover:text-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal"
          >
            <Search className="size-5" />
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={itemCount === 0 ? "الحقيبة فارغة" : `الحقيبة، ${itemCount}`}
            className="relative grid size-11 place-items-center text-ivory transition-colors hover:text-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal"
          >
            <ShoppingBag className="size-5" />
            <AnimatePresence>
              {itemCount > 0 ? (
                <motion.span
                  key={itemCount}
                  initial={reduce ? false : { scale: 0.55, opacity: 0, y: 2 }}
                  animate={{ scale: [0.55, 1.12, 1], opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { scale: 0.6, opacity: 0 }}
                  transition={{ duration: kageDuration.press, ease: kageEase }}
                  className="absolute top-1 end-1 grid size-4 place-items-center bg-seal text-[0.65rem] text-ivory"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </button>
          <button
            type="button"
            ref={menuButtonRef}
            className="grid size-11 place-items-center text-ivory transition-colors hover:text-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal lg:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="kage-mobile-nav"
            aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setOpenPath(isMenuOpen ? null : pathname)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isMenuOpen ? "close" : "menu"}
                initial={reduce ? false : { opacity: 0, rotate: -8, scale: 0.9 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, rotate: 8, scale: 0.9 }}
                transition={{ duration: kageDuration.micro, ease: kageEase }}
                className="grid place-items-center"
              >
                {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isMenuOpen ? (
          <motion.nav
            id="kage-mobile-nav"
            data-mobile-nav
            key="mobile-nav"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : kageDuration.quick, ease: kageEase }}
            className="overflow-hidden border-t border-border bg-panel lg:hidden"
            aria-label="القائمة"
          >
            <ul className="max-h-[min(70svh,28rem)] space-y-1 overflow-y-auto px-5 py-6">
              {storeLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center border-b border-border/50 text-ivory transition-colors hover:text-brass",
                      isCurrent(pathname, link.href) && "text-brass",
                    )}
                    onClick={() => setOpenPath(null)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/track"
                  className="flex min-h-12 items-center text-mist transition-colors hover:text-ivory"
                  onClick={() => setOpenPath(null)}
                >
                  تتبع الطلب
                </Link>
              </li>
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
