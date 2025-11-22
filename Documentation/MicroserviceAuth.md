───────────────────────────────────────────────────────────────
Backend microservice verification (step-by-step)
───────────────────────────────────────────────────────────────
1. Protected client code (e.g., `BackendAuthProbe`) calls the internal API route at `/api/backend/profile`.
2. That Next.js route runs on the server, reads the browser’s `next-auth.session-token` cookie via `getToken({ req, raw: true })`, and returns the raw encrypted NextAuth token. No decoding happens inside the frontend.
3. The route forwards the call to the Bun microservice (`/api/protected/profile`) and replays the session proof by setting `Authorization: Bearer <raw-token>`.
4. Inside the microservice, `authenticateRequest` checks for the `Authorization` header, trims the bearer prefix, and inspects the token shape (`.` segments) to detect legacy signed JWTs vs. modern encrypted JWEs.
5. Using the shared `NEXTAUTH_SECRET`, the backend:
   - Derives the same HMAC key NextAuth used to sign legacy JWT tokens and runs `jwtVerify`.
   - Derives the 256-bit encryption key via HKDF (`deriveNextAuthEncryptionKey`) and runs `jwtDecrypt` when the token is encrypted.
6. If verification/decryption succeeds, the backend returns the sanitized payload (id, email, name, image). Missing headers, mismatched secrets, or tampered tokens immediately produce a 401 response that the frontend surfaces to the user.

# import { getToken } from "next-auth/jwt";
# const rawToken = await getToken({ req, raw: true });
