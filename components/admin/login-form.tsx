"use client";

import { useActionState } from "react";
import { signIn } from "@/app/admin/actions";
import type { LoginState } from "@/app/admin/actions";

const initialState: LoginState = { error: "" };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);
  return (
    <form action={formAction} className="mt-8 space-y-4">
      <label className="block text-sm">
        البريد
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          dir="ltr"
          className="mt-2 w-full border border-gold/30 bg-transparent px-4 py-3 outline-none"
        />
      </label>
      <label className="block text-sm">
        كلمة المرور
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          className="mt-2 w-full border border-gold/30 bg-transparent px-4 py-3 outline-none"
        />
      </label>
      {state.error ? <p className="text-sm text-gold-bright">{state.error}</p> : null}
      <button type="submit" disabled={isPending} className="h-12 w-full bg-gold text-sm text-ink disabled:opacity-40">
        {isPending ? "جارٍ التحقق" : "ادخل إلى اللوحة"}
      </button>
    </form>
  );
}
