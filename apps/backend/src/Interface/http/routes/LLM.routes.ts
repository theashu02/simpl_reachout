import { Elysia, t } from "elysia";
import { LLMController } from "../controller/LLM.controller";
import { authenticateRequest } from "../../../middleware/VerifyUser";

const app = new Elysia();

export const llmRoutes = app.post("/llm", LLMController.sendMessage, {
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
  // Define the expected body structure so Elysia can validate and infer types
  body: t.Object({
    message: t.String(),
  }),
  detail: {
    summary: "LLM Initilization",
    tags: ["AI"],
  },
});
