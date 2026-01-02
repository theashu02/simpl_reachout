import { Elysia, t } from "elysia";
import { SearchController } from "../controller/duckSearch.controller";
import { authenticateRequest } from "../../../middleware/VerifyUser";

const app = new Elysia();

export const duckSearchRoutes = app.post("/search", SearchController.searchWeb, {
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
  // JSON body validation (mobile clients can also send x-www-form-urlencoded)
  body: t.Object({
    q: t.Optional(t.String({ minLength: 1 })),
    message: t.Optional(t.String({ minLength: 1 })),
  }),
  detail: {
    summary: "Search DuckDuckGo and return the top 5 results",
    tags: ["Duck Duck Search"],
  },
});
