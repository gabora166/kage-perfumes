"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/admin/actions";
import type { PasswordState } from "@/app/admin/actions";

const initialState: PasswordState = { error: "", saved: false };

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, initialState);
  return (
    <form action={formAction} className="mt-8 space-y-4">
      <PasswordField label="كلمة المرور الحالية" name="currentPassword" autoComplete="current-password" />
      <PasswordField label="كلمة المرور الجديدة" name="nextPassword" autoComplete="new-password" />
      <PasswordField label="تأكيد كلمة المرور" name="confirmPassword" autoComplete="new-password" />
      {state.error ? <p className="text-sm text-gold-bright">{state.error}</p> : null}
      {state.saved ? <p className="text-sm text-gold">تم تحديث كلمة المرور.</p> : null}
      <button type="submit" disabled={isPending} className="h-12 bg-gold px-6 text-sm text-ink disabled:opacity-40">
        {isPending ? "جارٍ الحفظ" : "حفظ كلمة المرور"}
      </button>
    </form>
  );
}

type PasswordFieldProps = {
  label: string;
  name: string;
  autoComplete: "current-password" | "new-password";
};

function PasswordField({ label, name, autoComplete }: PasswordFieldProps) {
  return (
    <label className="block text-sm">
      {label}
      <input
        name={name}
        type="password"
        autoComplete={autoComplete}
        required
        dir="ltr"
        className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3 outline-none focus:border-gold"
      />
    </label>
  );
}
