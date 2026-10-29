import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: "dark" | "light";
  align?: "start" | "center";
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "dark",
  align = "start",
  action,
  className,
}: SectionHeadingProps) {
  const isLight = tone === "light";
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div className={cn(align === "center" && "max-w-2xl")}>
        {eyebrow ? (
          <p
            className={cn(
              "font-sans text-[0.68rem] uppercase tracking-[0.38em]",
              isLight ? "text-bronze" : "text-brass",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "mt-3 font-arabic-display leading-tight",
            align === "center" ? "text-4xl md:text-5xl" : "text-4xl md:text-5xl lg:text-6xl",
            isLight ? "text-ink" : "text-ivory",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-4 max-w-xl leading-8",
              isLight ? "text-ink/75" : "text-mist",
              align === "center" && "mx-auto",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
