import { Elysia, t } from "elysia";
import { handleSearchStream } from "../controller/search.controller";

const app = new Elysia();

export const searchRoutes = app.get(
  "/search/stream",
  ({ query, set }) => {
    const q = query.q?.trim();

    if (!q) {
      set.status = 400;
      return {
        success: false,
        error: "Query parameter 'q' is required",
      };
    }

    return handleSearchStream(q);
  },
  {
    query: t.Object({
      q: t.String({ minLength: 1 }),
    }),
    detail: {
      summary: "Search, scrape, and stream AI response",
      tags: ["Search"],
    },
  }
);
