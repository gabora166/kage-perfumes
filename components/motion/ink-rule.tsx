import { SealStamp } from "@/components/brand/seal-stamp";
import { cn } from "@/lib/cn";

type InkRuleProps = {
  className?: string;
  tone?: "dark" | "light";
  /** Optional mid-rule 影 stamp — use sparingly */
  withSeal?: boolean;
};

/** Horizontal sumi-inspired divider — decorative only. */
export function InkRule({ className, tone = "dark", withSeal = false }: InkRuleProps) {
  if (!withSeal) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "mx-auto h-px w-full max-w-7xl",
          tone === "dark"
            ? "bg-gradient-to-l from-transparent via-border to-transparent"
            : "bg-gradient-to-l from-transparent via-ink/20 to-transparent",
          className,
        )}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn("relative mx-auto flex w-full max-w-7xl items-center gap-5", className)}
    >
      <span
        className={cn(
          "h-px flex-1",
          tone === "dark"
            ? "bg-gradient-to-l from-border to-transparent"
            : "bg-gradient-to-l from-ink/20 to-transparent",
        )}
      />
      <SealStamp size={22} tone={tone === "light" ? "photo" : "photo"} decorative whileInView />
      <span
        className={cn(
          "h-px flex-1",
          tone === "dark"
            ? "bg-gradient-to-r from-border to-transparent"
            : "bg-gradient-to-r from-ink/20 to-transparent",
        )}
      />
    </div>
  );
}
