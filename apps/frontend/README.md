This is a [Next.js](https://nextjs.org) application that now ships with a full authentication flow powered by [NextAuth.js](https://next-auth.js.org/), MongoDB persistence, and shadcn/ui primitives.

## Features

- NextAuth.js with JWT sessions and Google + GitHub OAuth providers.
- MongoDB (via Mongoose) stores user profile data (name, email, avatar, provider metadata, last login).
- Middleware-enforced `/dashboard` route that only renders for authenticated users.
- shadcn/ui components (`Button`, `Card`, etc.) for a cohesive interface.
- Redux Toolkit store is still available for future client-state needs (wrapped via `AppProviders`).

## Environment variables

Copy `.env.example` into `.env.local` (or `.env`) inside `apps/frontend` and fill in your provider credentials:

```bash
cp .env.example .env.local
```

You need values for:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- `NEXTAUTH_SECRET` (generate via `openssl rand -base64 32` or `bunx next auth secret`)
- `MONGODB_URI` (connection string with credentials)
- `MONGODB_DB` (database name, e.g. `neural-hash`)
- `NEXTAUTH_URL` (e.g. `http://localhost:3000` for dev)

All of these variables are required at runtime so the server can boot.

## Getting Started

Install dependencies (workspace root) and start the dev server from `apps/frontend`:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

After authenticating, you can access `/dashboard`. The middleware will redirect unauthenticated visitors back to `/`.

## Application Layout

- `app/` holds the App Router entry points (`layout.tsx`, route segments, global styles, and API routes).
- `components/` is reserved for UI primitives (currently just the shared `Button` component).
- `components/auth` exposes small helpers for OAuth buttons.
- `components/providers` contains `AppProviders` (NextAuth SessionProvider + Redux provider wrapper).
- `lib/auth` centralizes the NextAuth options plus helpers (so both route handlers and server components share the config).
- `lib/db` includes the MongoDB connection helper (with connection caching).
- `lib/models` holds the Mongoose `UserModel` definition.
- `lib/store` hosts the Redux Toolkit store, typed hooks, and feature slices.

## State Management (Redux Toolkit)

- `lib/store/index.ts` exposes `makeStore`, `RootState`, and `AppDispatch`. Each request gets a new store instance to keep server rendering isolated.
- `lib/store/provider.tsx` is a client component that initializes the store and wraps the React tree (connected in `app/layout.tsx`).
- `lib/store/hooks.ts` ships typed `useAppDispatch`/`useAppSelector`.
- `lib/store/slices/ui-slice.ts` holds the first slice for theme + sidebar UI state; add additional feature slices in this folder and register them inside `makeStore`.

To use the store inside any client component:

```tsx
"use client";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { toggleTheme } from "@/lib/store/slices/ui-slice";

export function Example() {
  const theme = useAppSelector((state) => state.ui.theme);
  const dispatch = useAppDispatch();

  return <button onClick={() => dispatch(toggleTheme())}>Theme: {theme}</button>;
}
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Authentication flow

1. `app/api/auth/[...nextauth]/route.ts` exposes the NextAuth handler with Google + GitHub providers.
2. During `signIn`, the server connects to MongoDB (via `lib/db/mongoose.ts`) and upserts the user profile in `lib/models/user.ts`.
3. Sessions are JWT-based (no database session table) and enriched with the Mongo `_id` for downstream usage.
4. `middleware.ts` uses `withAuth` to guard `/dashboard`. Unauthorized requests are redirected to `/`.
5. Server components (`app/page.tsx`, `app/dashboard/page.tsx`) call `getServerAuthSession` to fetch the session and render the correct UI.

## Learn More

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [MongoDB Atlas](https://www.mongodb.com/atlas/database) for managed Mongo instances
