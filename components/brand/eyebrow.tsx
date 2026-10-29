import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  tone?: "gold" | "ink";
};

export function Eyebrow({ children, tone = "gold" }: EyebrowProps) {
  return (
    <p
      className={
        tone === "gold"
          ? "font-sans text-[0.68rem] uppercase tracking-[0.42em] text-gold"
          : "font-sans text-[0.68rem] uppercase tracking-[0.42em] text-amber"
      }
    >
      {children}
    </p>
  );
}
