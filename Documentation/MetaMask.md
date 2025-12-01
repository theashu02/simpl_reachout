# MetaMask Authentication Flow

This document walks through how the MetaMask credential flow works across the frontend button, the NextAuth configuration, and the MongoDB model. The implementation currently spans:

- `apps/frontend/components/auth/MetaMaskButton.tsx`
- `apps/frontend/lib/auth/options.ts`
- `apps/frontend/lib/models/user.ts`

## High-Level Sequence

```
┌──────────────────────────────┐
│ MetaMaskButton (client)      │
│ - BrowserProvider(window)    │
│ - eth_requestAccounts        │
│ - signer.signMessage(message)│
│ - signIn("credentials", ...) │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│ NextAuth Credentials provider│
│ - verifyMessage(message,sig) │
│ - address mismatch → reject  │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│ MongoDB (UserModel)          │
│ - lookup by wallet/email     │
│ - create/update user row     │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│ callbacks.jwt + session      │
│ - persist user id/name/img   │
│ - redirect to dashboard      │
└──────────────────────────────┘
```

## Detailed Flow

### 1. Wallet interaction (`MetaMaskButton.tsx`)
1. The client verifies `window.ethereum` is injected (MetaMask present); otherwise it surfaces a warning toast.
2. `BrowserProvider(window.ethereum)` requests accounts via `eth_requestAccounts` and captures the first address.
3. The user is prompted to sign the literal message `Sign in to Simplx with address: <address>`.
4. The resulting `{ address, signature }` payload is posted to NextAuth using `signIn("credentials", { redirect: false, callbackUrl: "/products/hyper-mail/dashboard" })`.

### 2. Signature verification (`lib/auth/options.ts`)
1. The Credentials provider rebuilds the exact same message string before calling `verifyMessage`.
2. If the recovered signer does not match the supplied address (case-insensitive) the login aborts.
3. The database connection is opened via `connectToDatabase`.

### 3. User persistence (`lib/auth/options.ts` + `lib/models/user.ts`)
1. A deterministic email `<address>@wallet.simplx` is generated so MetaMask users have a unique email.
2. Mongo lookup matches either `walletAddress` or that deterministic email to catch legacy rows that lack the wallet column.
3. Missing users are created with:
   - `walletAddress` set to the lowercase address.
   - `name` defaulting to `Wallet 0x1234...`.
   - `image` seeded with DiceBear identicon.
4. Existing users get `walletAddress` backfilled and `lastLoginAt` refreshed.
5. The underlying `UserModel` schema (`lib/models/user.ts`) enforces `unique + sparse` constraints on both `email` and `walletAddress`, and stores provider metadata plus timestamps.

### 4. Session shaping (`lib/auth/options.ts`)
1. `callbacks.jwt` attaches the Mongo `_id` to the token so subsequent requests know the authenticated user.
2. `callbacks.session` mirrors those token fields onto `session.user`, making the id/name/image available to client hooks.
3. Upon success, the browser redirects to `/products/hyper-mail/dashboard` (or the supplied `callbackUrl`).

## Key Takeaways
- The signed message string must stay identical on both client and server; any edits will invalidate the verification step.
- Deterministic wallet emails keep the NextAuth user model compatible with providers that expect `email` to exist.
- Mongo indexes are sparse, so only stored wallet/email values must be unique—helpful when social logins omit a wallet.
- Session callbacks ensure MetaMask users behave exactly like OAuth users inside both server and client components.

