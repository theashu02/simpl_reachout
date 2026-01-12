import { treaty, type Treaty } from "@elysiajs/eden";
import type { App } from "../../../backend/src";

const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000").replace(/\/$/, "");

const createEdenClient = (): Treaty.Create<App> =>
  treaty<App>(backendUrl, {
    fetch: {
      credentials: "include",
      keepalive: true
    },
  });

type EdenClient = Treaty.Create<App>;
export type { EdenClient };

let client: EdenClient | null = null;

export const getEdenClient = (): EdenClient => {
  if (!client) {
    client = createEdenClient();
  }

  return client;
};
