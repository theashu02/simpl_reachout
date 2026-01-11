import { Elysia, t } from "elysia";
import { verifySmtpCredentials } from "../controller/MailVerify.controller";

const app = new Elysia();

const verifyMailHandler = async ({ body, set }: any) => {
  const { email, appPassword, password, host, port } = body as {
    email: string;
    appPassword?: string;
    password?: string;
    host: string;
    port: number;
  };

  const secret = password ?? appPassword;

  if (!secret) {
    set.status = 400;
    return {
      success: false,
      message: "Password is required",
    };
  }

  const result = await verifySmtpCredentials({
    user: email,
    pass: secret,
    host,
    port,
  });

  if (!result.isValid) {
    set.status = 400;
  }

  return {
    success: result.isValid,
    message: result.message,
  };
};

const verifyMailOptions = {
  body: t.Object({
    email: t.String({ format: "email" }),
    password: t.Optional(t.String({ minLength: 6 })),
    appPassword: t.Optional(t.String({ minLength: 6 })),
    host: t.String({ minLength: 3 }),
    port: t.Number(),
  }),
  detail: {
    summary: "Verify SMTP credentials",
    tags: ["Email"],
  },
};

export const MailVerifyRoutes = app.post("/verify-mail", verifyMailHandler, verifyMailOptions);
