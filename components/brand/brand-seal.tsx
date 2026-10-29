import { brand, brandAssets } from "@/lib/brand";
import { cn } from "@/lib/cn";

type BrandSealProps = {
  className?: string;
  size?: number;
  tone?: "red" | "light" | "photo";
};

export function BrandSeal({ className, size = 40, tone = "red" }: BrandSealProps) {
  const src =
    tone === "light" ? brandAssets.emblemLight : tone === "photo" ? brandAssets.emblemPhoto : brandAssets.emblem;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${brand.name} 影 seal`}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      decoding="async"
    />
  );
}
