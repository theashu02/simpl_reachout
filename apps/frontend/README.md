This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Application Layout

- `app/` holds the App Router entry points (`layout.tsx`, route segments, and global styles).
- `components/` is reserved for UI primitives (currently just the shared `Button` component).
- `lib/` contains cross-cutting utilities. `lib/store` now hosts the Redux Toolkit store, typed hooks, and feature slices.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
