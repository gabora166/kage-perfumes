import type { MetadataRoute } from "next";
import { listPublishedProducts } from "@/lib/db/products";
import { absoluteUrl } from "@/lib/seo/site";
import { policyPages } from "@/lib/trust/policies";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listPublishedProducts();
  const staticPaths = ["/", "/catalog", "/bundles", "/discovery", "/blend", "/search", "/track", ...policyPages.map((page) => `/trust/${page.slug}`)];
  const productPaths = products.map((product) => `/catalog/${product.slug}`);
  return [...staticPaths, ...productPaths].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path.startsWith("/catalog/") ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
