"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

type PromoFieldProps = {
  inputId?: string;
};

export function PromoField({ inputId = "promo-code" }: PromoFieldProps) {
  const { appliedPromo, applyPromo, clearPromo } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function handleApply(): Promise<void> {
    setError("");
    setIsChecking(true);
    const message = await applyPromo(code);
    setIsChecking(false);
    setError(message);
  }

  return (
    <div>
      <label className="block text-sm" htmlFor={inputId}>رمز خاص</label>
      <div className="mt-2 flex gap-2">
        <input
          id={inputId}
          value={code}
          dir="ltr"
          autoComplete="off"
          maxLength={24}
          onChange={(event) => setCode(event.target.value)}
          className="h-12 w-full border border-border bg-ivory px-4 text-start text-ink outline-none focus:border-ink"
        />
        <button
          type="button"
          disabled={isChecking || code.trim().length < 4}
          onClick={() => void handleApply()}
          className="h-12 shrink-0 border border-ink px-4 text-sm text-ink disabled:opacity-40"
        >
          {isChecking ? "..." : "تطبيق"}
        </button>
      </div>
      {appliedPromo ? (
        <p className="mt-2 flex items-center justify-between text-sm text-ink">
          <span dir="ltr">{appliedPromo.code}</span>
          <button type="button" onClick={clearPromo} className="text-mist">إزالة</button>
        </p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
