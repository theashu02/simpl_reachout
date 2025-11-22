import { Elysia } from "elysia";
import { createHmac } from "node:crypto";
import type { JWTPayload } from "jose";
import { jwtDecrypt, jwtVerify } from "jose";

const NEXTAUTH_SECRET = Bun.env.NEXTAUTH_SECRET;

if (!NEXTAUTH_SECRET) {
  throw new Error(
    "Missing NEXTAUTH_SECRET. Make sure the backend shares the same value as NextAuth."
  );
}

const textEncoder = new TextEncoder();
const hmacSecret = textEncoder.encode(NEXTAUTH_SECRET);
const encryptionSecret = deriveNextAuthEncryptionKey(NEXTAUTH_SECRET);

type AuthenticatedUser = JWTPayload & {
  email?: string;
  name?: string;
  picture?: string;
  id?: string;
};

const authenticateRequest = async (request: Request): Promise<AuthenticatedUser> => {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Missing Authorization header");
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw new Error("Empty Authorization token");
  }

  const segments = token.split(".");

  if (segments.length === 3) {
    const { payload } = await jwtVerify(token, hmacSecret);
    return payload as AuthenticatedUser;
  }

  if (segments.length === 5) {
    const { payload } = await jwtDecrypt(token, encryptionSecret);
    return payload as AuthenticatedUser;
  }

  throw new Error("Unsupported session token format.");
};

const app = new Elysia()
  .get("/", () => ({
    status: "ok",
    service: "neural-hash-backend",
  }))
  .get("/api/protected/profile", async ({ request, set }) => {
    try {
      const user = await authenticateRequest(request);

      return {
        status: "ok",
        message: "Backend verified your NextAuth session.",
        user: {
          id: user.id ?? user.sub,
          email: user.email,
          name: user.name,
          image: user.picture,
        },
      };
    } catch (error) {
      set.status = 401;
      console.error("[backend] Unauthorized request rejected:", error);

      return {
        status: "error",
        message: "Unauthorized request. Include a valid NextAuth session token.",
      };
    }
  })
  .listen(5000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

function deriveNextAuthEncryptionKey(secret: string, salt = ""): Uint8Array {
  const hash = "sha256";
  const hashLength = 32;
  const infoLabel = `NextAuth.js Generated Encryption Key${salt ? ` (${salt})` : ""}`;

  const ikm = Buffer.from(secret, "utf-8");
  const saltBuffer = salt
    ? Buffer.from(salt, "utf-8")
    : Buffer.alloc(hashLength, 0);
  const info = Buffer.from(infoLabel, "utf-8");

  const prk = createHmac(hash, saltBuffer).update(ikm).digest();

  let previous = Buffer.alloc(0);
  const output = Buffer.alloc(hashLength);
  let offset = 0;
  let counter = 0;

  while (offset < hashLength) {
    counter += 1;
    const hmac = createHmac(hash, prk);
    hmac.update(previous);
    hmac.update(info);
    hmac.update(Buffer.from([counter]));
    previous = hmac.digest();

    const bytesToCopy = Math.min(previous.length, hashLength - offset);
    previous.copy(output, offset, 0, bytesToCopy);
    offset += bytesToCopy;
  }

  return output;
}
