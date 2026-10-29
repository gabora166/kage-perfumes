export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { installTrustedClientHook } = await import("./lib/security/trusted-client.mjs");
  installTrustedClientHook();
  if (process.env.NODE_ENV !== "production") return;
  const { resolveSessionSecret } = await import("@/lib/auth/session-secret");
  resolveSessionSecret({
    nodeEnv: process.env.NODE_ENV,
    sessionSecret: process.env.SESSION_SECRET,
    readDevelopmentFallback: () => {
      throw new Error("SESSION_SECRET is required in production.");
    },
  });
}
