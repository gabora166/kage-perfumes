export function currentClientSecret(): string | null;

export function useClientSecret(secret: string | null): void;

export function readTrustedProxyHops(raw: string | undefined): number;

export function normalizeClientAddress(value: string | null | undefined): string | null;

export function signClientAddress(secret: string, address: string): string;

export function resolveRequestAddress(input: {
  forwardedFor: string | null;
  clientAddress: string | null;
  clientProof: string | null;
  trustedProxyHops: number;
  secret: string | null;
}): string | null;

export function applyTrustedClientHeaders(
  headers: Record<string, string | string[] | undefined>,
  socketAddress: string | null,
  trustedProxyHops: number,
): void;

export function installTrustedClientHook(): void;
