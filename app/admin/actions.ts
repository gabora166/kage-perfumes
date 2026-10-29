"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { validatePasswordChange } from "@/lib/auth/password-policy";
import { changeAdminPassword, getAdminSession, hasAdminAccount, signInAdmin, signOutAdmin } from "@/lib/auth/session";
import { UnattributedClientError } from "@/lib/security/client-address";
import { RateLimitError, consumeLoginLimit, consumePasswordLimit } from "@/lib/security/rate-limit";

export type LoginState = {
  error: string;
};

export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  try {
    consumeLoginLimit(await headers());
  } catch (error) {
    if (error instanceof RateLimitError || error instanceof UnattributedClientError) return { error: error.message };
    throw error;
  }
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!hasAdminAccount()) {
    return { error: "عيّن ADMIN_EMAIL و ADMIN_PASSWORD في ملف البيئة، ثم أعد تشغيل الخادم." };
  }
  const signedIn = await signInAdmin(email, password);
  if (!signedIn) return { error: "تعذّر الدخول. تحقق من البريد وكلمة المرور." };
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  await signOutAdmin();
  redirect("/admin/login");
}

export type PasswordState = {
  error: string;
  saved: boolean;
};

export async function changePassword(_previous: PasswordState, formData: FormData): Promise<PasswordState> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const nextPassword = String(formData.get("nextPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const issue = validatePasswordChange({ currentPassword, nextPassword, confirmPassword });
  if (issue) return { error: issue, saved: false };
  try {
    consumePasswordLimit(await headers());
  } catch (error) {
    if (error instanceof RateLimitError || error instanceof UnattributedClientError) {
      return { error: error.message, saved: false };
    }
    throw error;
  }
  const changed = await changeAdminPassword(session.email, currentPassword, nextPassword);
  if (!changed) return { error: "كلمة المرور الحالية غير صحيحة.", saved: false };
  return { error: "", saved: true };
}
