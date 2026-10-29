import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";
import { getProductBySlug } from "@/lib/db/products";

export const alt = brand.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type ImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductOpenGraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const title = product?.nameEn ?? brand.name;
  const family = product?.family ?? "oriental";
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111211",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          color: "#EAE2D3",
        }}
      >
        <div style={{ color: "#B39A70", fontSize: 22, letterSpacing: 8 }}>{family.toUpperCase()}</div>
        <div style={{ fontSize: 72, marginTop: 18 }}>{title}</div>
        <div style={{ color: "#8D2028", fontSize: 28, marginTop: 24 }}>
          {brand.name} · 影
        </div>
      </div>
    ),
    size,
  );
}
