"use client";

import Image from "next/image";
import { useState } from "react";
import { PerfumeBottle } from "@/components/catalog/perfume-bottle";
import { ProductPhoto } from "@/components/catalog/product-photo";
import {
  familyLiquid,
  familyStageArt,
  imageAlt,
  productVisualState,
  visualCaption,
} from "@/lib/catalog/images";
import type { Product, ProductImageKind } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";

type ProductVisualProps = {
  product: Product;
  kind?: ProductImageKind;
  sizes: string;
  priority?: boolean;
  /** square thumbs, catalog card plate, or editorial 3:4 stage */
  ratio?: "stage" | "thumb" | "card";
  /** padded product photo vs edge-to-edge catalog presentation */
  inset?: "padded" | "flush";
  /**
   * bottle = stage plate + SVG bottle (legacy editorial).
   * stage = atmospheric family plate only — preferred for catalog cards.
   */
  fallback?: "bottle" | "stage";
  /** show «رسم تحريري» badge on illustration stages */
  showBadge?: boolean;
  className?: string;
};

export function ProductVisual({
  product,
  kind = "bottle",
  sizes,
  priority = false,
  ratio = "stage",
  inset = "padded",
  fallback = "bottle",
  showBadge = false,
  className,
}: ProductVisualProps) {
  const src = product.images[kind];
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = Boolean(src) && !photoFailed;
  const visualState = showPhoto ? "photograph" : productVisualState(product, kind);
  const aspect =
    ratio === "thumb" ? "aspect-square" : ratio === "card" ? "aspect-[4/5]" : "aspect-[3/4]";
  return (
    <div className={cn("relative overflow-hidden", aspect, stageSurface(visualState, showPhoto), className)}>
      {showPhoto ? <StageAtmosphere kind="photo" /> : <StageAtmosphere kind="illustration" />}
      {showPhoto && src ? (
        <div className={cn("absolute inset-0 z-[1]", inset === "padded" ? "p-[8%]" : "p-0")}>
          <div className="relative h-full w-full">
            <ProductPhoto
              src={src}
              alt={imageAlt(product, kind)}
              sizes={sizes}
              family={product.family}
              priority={priority}
              onFailed={() => setPhotoFailed(true)}
            />
          </div>
        </div>
      ) : (
        <VisualFallback product={product} kind={kind} ratio={ratio} mode={fallback} />
      )}
      {showBadge && visualState === "illustration" && fallback === "bottle" ? (
        <span className="absolute bottom-3 start-3 z-[2] rounded-sm bg-ink/60 px-2 py-1 text-[0.7rem] text-ivory/90 backdrop-blur-[1px]">
          {visualCaption("illustration", "bottle")}
        </span>
      ) : null}
    </div>
  );
}

function stageSurface(state: "photograph" | "illustration" | "placeholder", showPhoto: boolean): string {
  if (showPhoto) return "bg-ink";
  if (state === "illustration") return "bg-ink";
  return "bg-[#161412]";
}

function StageAtmosphere({ kind }: { kind: "photo" | "illustration" }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className={
          kind === "photo"
            ? "absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(234,226,211,0.08),transparent_55%),radial-gradient(ellipse_at_100%_0%,rgba(141,32,40,0.18),transparent_45%)]"
            : "absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(234,226,211,0.04),transparent_50%),radial-gradient(ellipse_at_0%_100%,rgba(141,32,40,0.1),transparent_40%)]"
        }
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent" />
    </div>
  );
}

type VisualFallbackProps = {
  product: Product;
  kind: ProductImageKind;
  ratio: "stage" | "thumb" | "card";
  mode: "bottle" | "stage";
};

function VisualFallback({ product, kind, ratio, mode }: VisualFallbackProps) {
  const liquid = familyLiquid(product.family);
  const alt = imageAlt(product, kind);
  const stageSrc = familyStageArt(product.family);
  return (
    <div role="img" aria-label={alt} className="absolute inset-0 z-[1]">
      {kind === "bottle" ? (
        <>
          <Image
            src={stageSrc}
            alt=""
            fill
            sizes={ratio === "stage" ? "(min-width: 768px) 22rem, 46vw" : "8rem"}
            className="object-cover object-center opacity-95"
          />
          <span
            aria-hidden="true"
            className={
              mode === "stage"
                ? "absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-ink/35"
                : "absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/45"
            }
          />
          {mode === "bottle" ? (
            <span
              className={cn(
                "absolute inset-0 flex items-end justify-center",
                ratio === "stage" ? "px-7 pb-9" : "px-3 pb-4",
              )}
            >
              <PerfumeBottle
                family={product.family}
                className={cn(
                  "drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)]",
                  ratio === "stage" ? "h-[72%] w-auto" : "h-[78%] w-auto",
                )}
              />
            </span>
          ) : null}
        </>
      ) : null}
      {kind === "liquid" ? (
        <span className="absolute inset-x-[30%] bottom-[18%] top-[22%]" style={{ backgroundColor: liquid }} />
      ) : null}
      {kind === "texture" ? (
        <span
          className="absolute inset-0"
          style={{
            backgroundColor: "#161412",
            backgroundImage: `radial-gradient(${liquid} 0.6px, transparent 0.6px)`,
            backgroundSize: "6px 6px",
          }}
        />
      ) : null}
    </div>
  );
}
