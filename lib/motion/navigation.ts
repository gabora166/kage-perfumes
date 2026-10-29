/** Eligibility helpers for KAGE storefront route transitions (App Router). */

export type TransitionIntensity = "ninja" | "soft";

const SOFT_PREFIXES = ["/checkout", "/track"] as const;

export function stripTrailingSlash(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

export function resolveTransitionIntensity(fromPath: string, toPath: string): TransitionIntensity {
  const from = stripTrailingSlash(fromPath);
  const to = stripTrailingSlash(toPath);
  if (SOFT_PREFIXES.some((prefix) => to.startsWith(prefix) || from.startsWith(prefix))) {
    return "soft";
  }
  return "ninja";
}

export type InternalNavTarget = {
  href: string;
  pathname: string;
  search: string;
  hash: string;
};

/**
 * Resolve an anchor click into an internal same-origin navigation target.
 * Returns null when the click must not be intercepted.
 */
export function resolveInternalNavTarget(
  anchor: HTMLAnchorElement,
  event: Pick<MouseEvent, "defaultPrevented" | "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">,
  origin: string,
  currentPathname: string,
  currentSearch: string,
): InternalNavTarget | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  if (anchor.dataset.noTransition === "true") return null;
  const raw = anchor.getAttribute("href");
  if (!raw || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(raw, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return null;
  const pathname = stripTrailingSlash(url.pathname) || "/";
  const current = stripTrailingSlash(currentPathname) || "/";
  if (pathname === current && url.search === currentSearch) {
    // Hash-only or identical URL — leave to the browser / Next.
    return null;
  }
  if (pathname === current && url.search !== currentSearch) {
    // Same page, query only (filters) — no full transition.
    return null;
  }
  return {
    href: `${url.pathname}${url.search}${url.hash}`,
    pathname,
    search: url.search,
    hash: url.hash,
  };
}
