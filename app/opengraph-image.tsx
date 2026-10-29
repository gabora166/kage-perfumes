import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

export const alt = brand.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Latin-only — Satori/ImageResponse does not reliably shape Arabic glyphs. */
export default function OpenGraphImage() {
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
        <div style={{ color: "#B39A70", fontSize: 22, letterSpacing: 10 }}>{brand.taglineEn}</div>
        <div style={{ fontSize: 84, marginTop: 18, letterSpacing: 16 }}>{brand.name}</div>
        <div style={{ color: "#8D2028", fontSize: 32, marginTop: 28 }}>Shadow · Seal · Presence</div>
      </div>
    ),
    size,
  );
}
