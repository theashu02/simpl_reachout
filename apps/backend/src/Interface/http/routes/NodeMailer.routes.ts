import { Elysia, t } from "elysia";
import { EmailController } from "../controller/nodeMailer.controller";

const app = new Elysia();

export const NodeEmailRoutes = app.post("/send-info", EmailController.sendToolSubmission, {
  body: t.Object({
    email: t.String({ format: "email" }),
    toolName: t.String({ minLength: 2 }),
    useCase: t.String({ minLength: 5 }),
  }),
  detail: {
    summary: "Send Request Tool Info",
    tags: ["Email"],
  },
});
