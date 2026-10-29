"use client";

import { FormEvent, useState } from "react";

type SubscribeState = "idle" | "saving" | "saved" | "known";

export function AtelierNote() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubscribeState>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setState("saving");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await response.json()) as { error?: string; alreadySubscribed?: boolean };
      if (!response.ok) {
        setError(body.error ?? "تعذّر حفظ البريد.");
        setState("idle");
        return;
      }
      setState(body.alreadySubscribed ? "known" : "saved");
    } catch {
      setError("تعذّر الاتصال بالخادم.");
      setState("idle");
    }
  }

  if (state === "saved") {
    return <p className="text-sm leading-7 text-brass">سُجّل بريدك في مراسلات الدار.</p>;
  }
  if (state === "known") {
    return <p className="text-sm leading-7 text-brass">هذا البريد محفوظ لدينا من قبل.</p>;
  }
  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <div className="flex border border-border">
        <label className="sr-only" htmlFor="atelier-email">البريد</label>
        <input
          id="atelier-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="بريدك للمراسلات الخاصة"
          className="w-full bg-transparent px-4 py-3 text-sm text-ivory outline-none placeholder:text-mist"
        />
        <button type="submit" disabled={state === "saving"} className="bg-seal px-4 text-sm text-ivory disabled:opacity-40">
          {state === "saving" ? "..." : "أرسل"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-brass">{error}</p> : null}
    </form>
  );
}
