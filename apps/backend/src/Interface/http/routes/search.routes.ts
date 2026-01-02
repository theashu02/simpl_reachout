import { Elysia, t } from "elysia";
import { handleSearchStream } from "../controller/search.controller";
import { authenticateRequest } from "../../../middleware/VerifyUser";

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
    beforeHandle: async ({ request, set }) => {
      try {
        await authenticateRequest(request);
      } catch (error) {
        set.status = 401;
        return {
          success: false,
          message: "Unauthorized: Please sign in.",
        };
      }
    },
    query: t.Object({
      q: t.String({ minLength: 1 }),
    }),
    detail: {
      summary: "Search, scrape, and stream AI response",
      tags: ["Search"],
    },
  }
);
