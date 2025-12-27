import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { profileRoutes } from "./Interface/http/routes/UserController/profile.route";
import { fileTransferWs, getRoomSnapshot } from "./Interface/ws/FileTransfer";
import { authenticateRequest } from "./middleware/VerifyUser";
import { PORT } from "./utils/config";
import { NodeEmailRoutes } from "./Interface/http/routes/NodeMailer.routes";
import { MailVerifyRoutes } from "./Interface/http/routes/MailVerify.routes";

const app = new Elysia();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    credentials: true,
  })
);

app.get("/", () => ({ status: "ok", service: "neural-hash-backend" })); // public api
app.group("/api/protected", (group) => group
  .use(profileRoutes)
  .use(NodeEmailRoutes)
  .use(MailVerifyRoutes));

app.get("/file-transfer/rooms/:roomId/status", async ({ request, params, set }) => {
  try {
    await authenticateRequest(request);
  } catch (error) {
    set.status = 401;
    return {
      status: "unauthorized",
      message: "Please sign in to verify room status",
    };
  }

  const roomIdParam = params.roomId?.trim();

  if (!roomIdParam) {
    set.status = 400;
    return {
      status: "invalid",
      message: "Room ID is required",
      roomId: roomIdParam,
      peersCount: 0,
      senderPresent: false,
    };
  }

  const snapshot = getRoomSnapshot(roomIdParam);

  if (snapshot.peersCount === 0) {
    set.status = 404;
    return {
      status: "not-found",
      message: "Room is not active. Ask the sender to share a valid ID.",
      roomId: snapshot.roomId,
      peersCount: 0,
      senderPresent: false,
    };
  }

  const ready = snapshot.senderPresent;
  set.status = ready ? 200 : 202;

  return {
    status: ready ? "ready" : "waiting",
    message: ready ? "Sender is online" : "Waiting for sender to connect",
    roomId: snapshot.roomId,
    peersCount: snapshot.peersCount,
    senderPresent: snapshot.senderPresent,
  };
});

app.use(fileTransferWs);

app.listen(PORT);

if (app.server) {
  console.log(`HTTP server running at http://${app.server.hostname}:${app.server.port}`);
  console.log(`File-transfer signaling at ready ws://${app.server.hostname}:${app.server.port}/ws`);
}
