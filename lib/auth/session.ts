import "server-only";

import { io } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  readSessionToken,
  sessionCookieName,
  sessionMaxAgeSeconds,
} from "@/lib/auth/session-token";
import { getDb } from "@/lib/db/client";

export type AdminSession = {
  email: string;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  await io();
  const cookieStore = await cookies();
  const payload = readSessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!payload) return null;
  const user = findAdmin(payload.email);
  if (!user) return null;
  return { email: user.email };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function signInAdmin(email: string, password: string): Promise<boolean> {
  const user = findAdmin(email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.password_hash)) return false;
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, createSessionToken(user.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });
  return true;
}

export async function changeAdminPassword(
  email: string,
  currentPassword: string,
  nextPassword: string,
): Promise<boolean> {
  const user = findAdmin(email);
  if (!user || !verifyPassword(currentPassword, user.password_hash)) return false;
  const result = getDb().prepare("UPDATE admin_users SET password_hash = ? WHERE email = ?").run(
    hashPassword(nextPassword),
    user.email,
  );
  return result.changes === 1;
}

export async function signOutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export function hasAdminAccount(): boolean {
  const row = getDb().prepare("SELECT COUNT(*) AS count FROM admin_users").get() as { count: number };
  return row.count > 0;
}

function findAdmin(email: string): { email: string; password_hash: string } | undefined {
  return getDb().prepare("SELECT email, password_hash FROM admin_users WHERE email = ?").get(email) as
    | { email: string; password_hash: string }
    | undefined;
}
