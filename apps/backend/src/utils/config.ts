export const NEXTAUTH_SECRET = Bun.env.NEXTAUTH_SECRET;
export const PORT = Number(Bun.env.PORT ?? 5000);

// For NodeMailer Service
export const SMTP_HOST = Bun.env.SMTP_HOST;
export const SMTP_PORT = Bun.env.SMTP_PORT;
export const SMTP_USER = Bun.env.SMTP_USER;
export const SMTP_PASS = Bun.env.SMTP_PASS;
export const RECEIVER_EMAIL = Bun.env.RECEIVER_EMAIL;