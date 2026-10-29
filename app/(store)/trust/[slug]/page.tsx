import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PolicyArticle } from "@/components/trust/policy-article";
import { policyPages } from "@/lib/trust/policies";
import type { PolicySlug } from "@/lib/trust/policies";
import { buildPageMetadata } from "@/lib/seo/metadata";

type TrustPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams(): Array<{ slug: PolicySlug }> {
  return policyPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: TrustPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = policyPages.find((entry) => entry.slug === slug);
  if (!page) return { title: "الدار" };
  return buildPageMetadata({
    title: page.title,
    description: page.description,
    path: `/trust/${page.slug}`,
  });
}

export default async function TrustPage({ params }: TrustPageProps) {
  const { slug } = await params;
  const page = policyPages.find((entry) => entry.slug === slug);
  if (!page) notFound();
  return <PolicyArticle page={page} />;
}
