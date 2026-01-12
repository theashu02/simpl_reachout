import { Elysia, t } from "elysia";
import { LLMController } from "../controller/LLM.controller";

const app = new Elysia();

export const llmRoutes = app.post("/llm", LLMController.sendMessage, {
  body: t.Object({
    message: t.String(),
  }),
  detail: {
    summary: "LLM Initilization",
    tags: ["AI"],
  },
});
