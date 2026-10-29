import type { Metadata } from "next";
import { brand, brandSeo } from "@/lib/brand";

type PageMetadataInput = {
  title?: string;
  description: string;
  path: string;
  index?: boolean;
};

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const title = input.title ?? brandSeo.titleDefault;
  return {
    ...(input.title ? { title: input.title } : {}),
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title,
      description: input.description,
      url: input.path,
      locale: "ar_EG",
      type: "website",
      siteName: brand.name,
    },
    robots: input.index === false ? { index: false, follow: false } : undefined,
  };
}
