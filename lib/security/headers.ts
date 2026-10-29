type SecurityHeader = {
  key: string;
  value: string;
};

export function buildSecurityHeaders(nodeEnv: string | undefined): SecurityHeader[] {
  const isProduction = nodeEnv === "production";
  const scriptSrc = isProduction
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  const connectSrc = isProduction ? "connect-src 'self'" : "connect-src 'self' ws: wss:";
  const policy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    connectSrc,
    "worker-src 'self' blob:",
  ];
  if (isProduction) policy.push("upgrade-insecure-requests");
  const headers: SecurityHeader[] = [
    { key: "Content-Security-Policy", value: policy.join("; ") },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ];
  if (isProduction) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    });
  }
  return headers;
}
