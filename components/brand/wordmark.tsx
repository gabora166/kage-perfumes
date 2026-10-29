import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";

type WordmarkProps = {
  className?: string;
  tone?: "light" | "dark";
};

export function Wordmark({ className, tone = "light" }: WordmarkProps) {
  return (
    <span
      dir="ltr"
      className={cn(
        "font-display text-[1.05em] font-medium uppercase tracking-[0.28em]",
        tone === "light" ? "text-ivory" : "text-ink",
        className,
      )}
    >
      {brand.name}
    </span>
  );
}
