import { notFound } from "next/navigation";
import { QuoteResponse } from "@/components/blend/quote-response";
import { PageHero } from "@/components/layout/page-hero";
import { getPublicQuoteByToken } from "@/lib/db/bespoke-requests";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ token: string }>;
};

export const metadata = buildPageMetadata({
  title: "عرض سعر طلب خاص",
  description: "راجع عرض السعر لطلب العطر الخاص ووافق أو ارفض قبل تأكيد الشراء.",
  path: "/blend",
  index: false,
});

export default async function BespokeQuotePage({ params }: PageProps) {
  const { token } = await params;
  const quote = await getPublicQuoteByToken(token);
  if (!quote) notFound();
  return (
    <>
      <PageHero
        eyebrow="Customer approval"
        title="عرض السعر"
        description="راجع السعر والشروط، ثم وافق أو ارفض. مفيش التزام بالشراء قبل موافقتك."
        compact
      />
      <div className="mx-auto max-w-3xl px-5 pb-24 md:px-8">
        <QuoteResponse token={token} quote={quote} />
      </div>
    </>
  );
}
