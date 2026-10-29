export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return new URL(configured.endsWith("/") ? configured : `${configured}/`);
}

export function absoluteUrl(path: string): string {
  const site = getSiteUrl();
  return new URL(path.replace(/^\//, ""), site).toString();
}
