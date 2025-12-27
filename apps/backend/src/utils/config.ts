const runtimeEnv = ((globalThis as typeof globalThis & { Bun?: { env: Record<string, string | undefined> } }).Bun?.env ?? process.env ?? {}) as Record<string, string | undefined>;

const parseOrigins = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const NEXTAUTH_SECRET = runtimeEnv.NEXTAUTH_SECRET;
export const PORT = Number(runtimeEnv.PORT ?? 5000);
export const ALLOWED_ORIGINS = parseOrigins(runtimeEnv.ALLOWED_ORIGINS ?? runtimeEnv.FRONTEND_ORIGIN ?? runtimeEnv.NEXTAUTH_URL ?? "http://localhost:3000");

// For NodeMailer Service
export const SMTP_HOST = runtimeEnv.SMTP_HOST;
export const SMTP_PORT = runtimeEnv.SMTP_PORT;
export const SMTP_USER = runtimeEnv.SMTP_USER;
export const SMTP_PASS = runtimeEnv.SMTP_PASS;
export const RECEIVER_EMAIL = runtimeEnv.RECEIVER_EMAIL;
