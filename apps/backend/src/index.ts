import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { profileRoutes } from "./Interface/http/routes/UserController/profile.route";
import { fileTransferWs } from "./Interface/ws/FileTransfer";
import { PORT } from "./utils/config";

const app = new Elysia()

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    credentials: true,
  })
);

app.get("/", () => ({ status: "ok", service: "neural-hash-backend" }));
app.group("/api/protected", (app) => app.use(profileRoutes));

app.use(fileTransferWs);

app.listen(PORT);

if (app.server) {
  console.log(`🦊 HTTP server running at http://${app.server.hostname}:${app.server.port}`);
  console.log(`📡 File-transfer signaling ready at ws://${app.server.hostname}:${app.server.port}/ws`);
}
