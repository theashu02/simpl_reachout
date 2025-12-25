"use client";

import { type PropsWithChildren } from "react";
import { SessionProvider } from "next-auth/react";

import { ReduxProvider } from "@/lib/store/provider";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        <ReduxProvider>{children}</ReduxProvider>
      </ReactQueryProvider>
    </SessionProvider>
  );
}
