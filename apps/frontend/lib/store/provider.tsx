"use client";

import { PropsWithChildren, useMemo } from "react";
import { Provider } from "react-redux";

import { AppStore, makeStore } from "./store";

export function ReduxProvider({ children }: PropsWithChildren) {
  const store = useMemo<AppStore>(() => makeStore(), []);

  return <Provider store={store}>{children}</Provider>;
}
