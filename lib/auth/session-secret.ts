const minimumSecretLength = 16;

type SessionSecretEnv = {
  nodeEnv: string | undefined;
  sessionSecret: string | undefined;
  readDevelopmentFallback: () => string;
};

export function resolveSessionSecret(env: SessionSecretEnv): string {
  const secret = env.sessionSecret?.trim() ?? "";
  if (env.nodeEnv === "production") {
    if (secret.length < minimumSecretLength) {
      throw new Error("SESSION_SECRET is required in production and must be at least 16 characters.");
    }
    return secret;
  }
  if (secret.length >= minimumSecretLength) return secret;
  return env.readDevelopmentFallback();
}
