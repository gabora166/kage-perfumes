import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { resolveSessionSecret } from "@/lib/auth/session-secret";

const sessionDays = 7;

export type SessionPayload = {
  email: string;
  exp: number;
};

export function createSessionToken(email: string): string {
  const payload: SessionPayload = {
    email,
    exp: Date.now() + sessionDays * 24 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function readSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || !signaturesMatch(signature, sign(body))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.email || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieName = "ateeq_session";

export const sessionMaxAgeSeconds = sessionDays * 24 * 60 * 60;

function sign(body: string): string {
  return createHmac("sha256", getSessionSecret()).update(body).digest("base64url");
}

function signaturesMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getSessionSecret(): string {
  return resolveSessionSecret({
    nodeEnv: process.env.NODE_ENV,
    sessionSecret: process.env.SESSION_SECRET,
    readDevelopmentFallback: readDevelopmentSecret,
  });
}

function readDevelopmentSecret(): string {
  const filePath = path.join(process.cwd(), "data", ".session-secret");
  if (fs.existsSync(filePath)) return fs.readFileSync(filePath, "utf8").trim();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const secret = randomBytes(32).toString("hex");
  fs.writeFileSync(filePath, secret, { mode: 0o600 });
  return secret;
}
