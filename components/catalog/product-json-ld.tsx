import { brand } from "@/lib/brand";
import { storeCurrency } from "@/lib/catalog/money";
import type { Product } from "@/lib/catalog/types";
import { absoluteUrl } from "@/lib/seo/site";

type ProductJsonLdProps = {
  product: Product;
};

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const images = productImages(product);
  const payload = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameAr,
    alternateName: product.nameEn,
    description: product.descriptionAr,
    url: absoluteUrl(`/catalog/${product.slug}`),
    ...(images.length > 0 ? { image: images } : {}),
    brand: {
      "@type": "Brand",
      name: brand.name,
    },
    offers: product.offers.map((offer) => ({
      "@type": "Offer",
      priceCurrency: storeCurrency,
      price: String(offer.priceSar),
      availability: offer.stockCount > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      name: `${product.nameEn} ${offer.sizeMl}ml`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
    />
  );
}

function productImages(product: Product): string[] {
  return [product.images.bottle, product.images.liquid, product.images.texture].flatMap((path) => {
    return path ? [absoluteUrl(path)] : [];
  });
}
