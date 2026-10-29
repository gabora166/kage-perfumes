import { brandAssets } from "@/lib/brand";
import { galleryImageKinds } from "@/lib/catalog/types";
import type { FragranceFamily, Product, ProductImageKind } from "@/lib/catalog/types";

const washClassName: Record<FragranceFamily, string> = {
  oriental: "bg-[#f3e2cf]",
  woody: "bg-[#e4ebe0]",
  floral: "bg-[#f8e4ea]",
};

const liquidColor: Record<FragranceFamily, string> = {
  oriental: "#c4783a",
  woody: "#8d9a6b",
  floral: "#c4899e",
};

/** Family → atmospheric stage plate (editorial backdrop, not a product photo). */
const familyStage: Record<FragranceFamily, string> = {
  woody: brandAssets.stages.shadow,
  oriental: brandAssets.stages.ember,
  floral: brandAssets.stages.silk,
};

const blurDataUrl: Record<FragranceFamily, string> = {
  oriental: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGM4UmEFAAN6AXfiaBrAAAAAAElFTkSuQmCC",
  woody: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGPIqwkCAAKYAT21NS8kAAAAAElFTkSuQmCC",
  floral: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNYEVsBAAMuAX6c8tioAAAAAElFTkSuQmCC",
};

export function familyWash(family: FragranceFamily): string {
  return washClassName[family];
}

export function familyLiquid(family: FragranceFamily): string {
  return liquidColor[family];
}

export function familyStageArt(family: FragranceFamily): string {
  return familyStage[family];
}

export function familyBlur(family: FragranceFamily): string {
  return blurDataUrl[family];
}

export type ProductVisualState = "photograph" | "illustration" | "placeholder";

export function galleryKinds(product: Pick<Product, "images">): ProductImageKind[] {
  return galleryImageKinds.filter((kind) => kind === "bottle" || Boolean(product.images[kind]));
}

export function productVisualState(
  product: Pick<Product, "images">,
  kind: ProductImageKind,
): ProductVisualState {
  if (product.images[kind]) return "photograph";
  if (kind === "bottle") return "illustration";
  return "placeholder";
}

export function visualCaption(state: ProductVisualState, kind: ProductImageKind): string {
  if (state === "photograph") {
    if (kind === "liquid") return "السائل";
    if (kind === "texture") return "الملمس";
    if (kind === "pyramid") return "الهرم العطري";
    return "الزجاجة";
  }
  if (state === "illustration") return "رسم تحريري";
  if (kind === "liquid") return "لون العائلة";
  if (kind === "pyramid") return "هرم عطري";
  return "نسيج لوني";
}

export function imageAlt(product: Pick<Product, "nameAr" | "nameEn" | "images">, kind: ProductImageKind): string {
  const state = productVisualState(product, kind);
  if (state === "photograph") {
    if (kind === "liquid") return `${product.nameAr} — صورة السائل`;
    if (kind === "texture") return `${product.nameAr} — صورة الملمس`;
    if (kind === "pyramid") return `${product.nameAr} — صورة الهرم العطري`;
    return `${product.nameAr} — صورة الزجاجة`;
  }
  if (state === "illustration") return `${product.nameAr} — رسم تحريري للزجاجة`;
  if (kind === "liquid") return `${product.nameAr} — لون العائلة، وليس صورة للسائل`;
  if (kind === "pyramid") return `${product.nameAr} — الهرم العطري`;
  return `${product.nameAr} — نسيج لوني، وليس صورة للمكونات`;
}

export const cardImageSizes = "(min-width: 1280px) 22rem, (min-width: 768px) 46vw, 92vw";

export const heroImageSizes = "(min-width: 1024px) 34rem, 92vw";

export const thumbImageSizes = "(min-width: 1024px) 12rem, 30vw";
