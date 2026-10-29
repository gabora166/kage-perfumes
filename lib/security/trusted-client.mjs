import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";

const globalKey = Symbol.for("ateeq.trustedClient");

function state() {
  if (!globalThis[globalKey]) {
    globalThis[globalKey] = { secret: null, installed: false };
  }
  return globalThis[globalKey];
}

export function currentClientSecret() {
  const secret = state().secret;
  return typeof secret === "string" ? secret : null;
}

export function useClientSecret(secret) {
  state().secret = secret;
}

export function readTrustedProxyHops(raw) {
  if (typeof raw !== "string") return 0;
  const parsed = Number(raw.trim());
  if (!Number.isInteger(parsed) || parsed < 1) return 0;
  return parsed;
}

export function normalizeClientAddress(value) {
  if (typeof value !== "string") return null;
  const candidate = value.trim();
  if (!candidate || candidate.includes(",")) return null;
  if (isIP(candidate) === 0) return null;
  return candidate;
}

export function signClientAddress(secret, address) {
  return createHmac("sha256", secret).update(address).digest("base64url");
}

export function resolveRequestAddress(input) {
  const hops = input.trustedProxyHops;
  if (!Number.isInteger(hops) || hops < 1) {
    return readSignedClientAddress(input.clientAddress, input.clientProof, input.secret);
  }
  const chain = String(input.forwardedFor ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const index = chain.length - hops;
  if (index < 0) return null;
  return normalizeClientAddress(chain[index]);
}

export function applyTrustedClientHeaders(headers, socketAddress, trustedProxyHops) {
  delete headers["x-real-ip"];
  delete headers["x-ateeq-client-address"];
  delete headers["x-ateeq-client-proof"];
  if (trustedProxyHops > 0) return;
  const address = normalizeClientAddress(socketAddress);
  const secret = currentClientSecret();
  if (!address || !secret) {
    delete headers["x-forwarded-for"];
    return;
  }
  headers["x-forwarded-for"] = address;
  headers["x-ateeq-client-address"] = address;
  headers["x-ateeq-client-proof"] = signClientAddress(secret, address);
}

export function installTrustedClientHook() {
  const current = state();
  if (current.installed) return;
  current.secret = randomBytes(32).toString("hex");
  current.installed = true;
  patchServer(http.Server);
  patchServer(https.Server);
}

function patchServer(Server) {
  const emit = Server.prototype.emit;
  Server.prototype.emit = function onRequest(event, request, ...args) {
    if (event === "request" && request?.headers) {
      applyTrustedClientHeaders(
        request.headers,
        request.socket?.remoteAddress ?? null,
        readTrustedProxyHops(process.env.TRUSTED_PROXY_HOPS),
      );
    }
    return emit.call(this, event, request, ...args);
  };
}

function readSignedClientAddress(address, proof, secret) {
  const normalized = normalizeClientAddress(address);
  if (!normalized || typeof proof !== "string" || typeof secret !== "string" || secret.length < 16) return null;
  const expected = signClientAddress(secret, normalized);
  const left = Buffer.from(proof);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return null;
  if (!timingSafeEqual(left, right)) return null;
  return normalized;
}
