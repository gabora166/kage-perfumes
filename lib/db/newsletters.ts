import "server-only";

import { io } from "next/cache";
import { getDb } from "@/lib/db/client";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maximumEmailLength = 120;

export async function saveNewsletterEmail(rawEmail: string): Promise<"created" | "exists"> {
  const email = rawEmail.trim().toLowerCase();
  if (email.length < 6 || email.length > maximumEmailLength || !emailPattern.test(email)) {
    throw new Error("البريد غير واضح.");
  }
  await io();
  const db = getDb();
  const existing = db.prepare("SELECT id FROM newsletters WHERE email = ?").get(email);
  if (existing) return "exists";
  try {
    db.prepare("INSERT INTO newsletters (id, email, created_at) VALUES (?, ?, ?)").run(
      crypto.randomUUID(),
      email,
      new Date().toISOString(),
    );
  } catch (error) {
    if (isUniqueConstraint(error)) return "exists";
    throw new Error("تعذّر حفظ البريد.");
  }
  return "created";
}

function isUniqueConstraint(error: unknown): boolean {
  return error instanceof Error && error.message.includes("UNIQUE");
}
