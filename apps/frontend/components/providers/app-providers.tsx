"use client";

import { type PropsWithChildren } from "react";
import { SessionProvider } from "next-auth/react";

import { ReduxProvider } from "@/lib/store/provider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <ReduxProvider>{children}</ReduxProvider>
    </SessionProvider>
  );
}
