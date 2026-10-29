import {
  currentClientSecret,
  readTrustedProxyHops,
  resolveRequestAddress,
} from "./trusted-client.mjs";

type HeaderStore = {
  get(name: string): string | null;
};

export class UnattributedClientError extends Error {
  constructor() {
    super("تعذّر تحديد مصدر الطلب.");
    this.name = "UnattributedClientError";
  }
}

export function readClientAddress(headerStore: HeaderStore): string | null {
  return resolveRequestAddress({
    forwardedFor: headerStore.get("x-forwarded-for"),
    clientAddress: headerStore.get("x-ateeq-client-address"),
    clientProof: headerStore.get("x-ateeq-client-proof"),
    trustedProxyHops: readTrustedProxyHops(process.env.TRUSTED_PROXY_HOPS),
    secret: currentClientSecret(),
  });
}

export function requireClientAddress(address: string | null): string {
  if (!address) throw new UnattributedClientError();
  return address;
}

export function phoneLimitKey(phone: string | null): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return `phone:${digits}`;
}

export function emailLimitKey(email: string | null): string | null {
  const normalized = (email ?? "").trim().toLowerCase();
  if (normalized.length < 6 || normalized.length > 120 || !normalized.includes("@")) return null;
  return `email:${normalized}`;
}

export function codeLimitKey(code: string | null): string | null {
  const normalized = (code ?? "").trim().toLowerCase();
  if (normalized.length < 4 || normalized.length > 80) return null;
  return `code:${normalized}`;
}
