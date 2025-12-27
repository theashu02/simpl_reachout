import nodemailer from "nodemailer";

interface VerifyResult {
  isValid: boolean;
  message: string;
}

interface SmtpConfig {
  user: string;
  pass: string;
  host?: string;
  port?: number;
}

const DEFAULT_GMAIL_HOST = "smtp.gmail.com";
const DEFAULT_GMAIL_PORT = 465;

export async function verifySmtpCredentials(config: SmtpConfig): Promise<VerifyResult> {
  const host = (config.host ?? DEFAULT_GMAIL_HOST).trim();
  const port = Number(config.port ?? DEFAULT_GMAIL_PORT);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // Gmail supports SSL on 465; STARTTLS on 587 is left out intentionally
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 7000,
    greetingTimeout: 7000,
    socketTimeout: 12000,
  });

  try {
    await transporter.verify();
    return { isValid: true, message: "Credentials are valid." };
  } catch (error: any) {
    let userMessage = "Connection failed.";

    if (error?.code === "EAUTH" || error?.responseCode === 535) {
      userMessage = "Invalid SMTP username or password.";
    } else if (error?.code === "ESOCKET") {
      userMessage = "Could not connect to SMTP server. Check host/port.";
    } else if (error?.code === "ETIMEDOUT") {
      userMessage = "Connection timed out. SMTP server is unreachable.";
    }

    return { isValid: false, message: userMessage };
  } finally {
    if (typeof (transporter as any).close === "function") {
      transporter.close();
    }
  }
}
