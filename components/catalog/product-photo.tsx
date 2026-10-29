"use client";

import Image from "next/image";
import { useState } from "react";
import { familyBlur } from "@/lib/catalog/images";
import type { FragranceFamily } from "@/lib/catalog/types";

type ProductPhotoProps = {
  src: string;
  alt: string;
  sizes: string;
  family: FragranceFamily;
  priority?: boolean;
  onFailed?: () => void;
};

export function ProductPhoto({ src, alt, sizes, family, priority = false, onFailed }: ProductPhotoProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-ink/40 px-4">
        <p className="text-center text-sm text-mist">تعذّر عرض الصورة</p>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes={sizes}
      placeholder="blur"
      blurDataURL={familyBlur(family)}
      className="object-contain object-center drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
      onError={() => {
        setFailed(true);
        onFailed?.();
      }}
    />
  );
}
