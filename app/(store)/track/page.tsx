import { TrackForm } from "@/components/track/track-form";
import { PageHero } from "@/components/layout/page-hero";
import { brand } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "تتبع الطلب",
  description: `اعرض طلبات ${brand.name} برقم الجوال المستخدم عند الشراء.`,
  path: "/track",
});

export default function TrackPage() {
  return (
    <>
      <PageHero
        eyebrow="الطلب"
        title="تتبع الطلب"
        description="اكتب الجوال نفسه الذي استخدمته عند إتمام الطلب."
      />
      <div className="mx-auto max-w-6xl px-5 pb-24 md:px-8">
        <TrackForm />
      </div>
    </>
  );
}
