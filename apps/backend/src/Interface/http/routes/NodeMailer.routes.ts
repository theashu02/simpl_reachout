import { Elysia, t } from "elysia";
import { EmailController } from "../controller/nodeMailer.controller";
import { authenticateRequest } from "../../../middleware/VerifyUser";

const app = new Elysia();

export const NodeEmailRoutes = app.post(
  "/send-info",
  EmailController.sendToolSubmission,
  {
    beforeHandle: async ({ request, set }) => {
      try {
        await authenticateRequest(request);
      } catch {
        set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
        };
      }
    },
    body: t.Object({
      email: t.String({ format: "email" }),
      toolName: t.String({ minLength: 2 }),
      useCase: t.String({ minLength: 5 }),
    }),
    detail: {
      summary: "Send Tool Info",
      tags: ["Email"],
    },
  }
);
