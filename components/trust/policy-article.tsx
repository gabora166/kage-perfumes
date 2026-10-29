import { PageHero } from "@/components/layout/page-hero";
type PolicyArticleProps = {
  page: {
    eyebrow: string;
    title: string;
    description: string;
    sections: ReadonlyArray<{
      heading: string;
      paragraphs: ReadonlyArray<string>;
    }>;
  };
};

export function PolicyArticle({ page }: PolicyArticleProps) {
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} description={page.description} />
      <div className="mx-auto max-w-3xl px-5 pb-24 md:px-8">
        {page.sections.map((section) => (
          <section key={section.heading} className="border-t border-border py-8">
            <h2 className="font-arabic-display text-3xl text-ivory">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4 leading-8 text-mist">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
