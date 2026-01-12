import fastify from "fastify";

const app = fastify({ logger: true });

app.get("/health", async () => ({ status: "ok" }));

const port = Number(process.env.PORT || 4001);
const host = "0.0.0.0";

app
  .listen({ port, host })
  .then(() => {
    app.log.info(`Fastify test server listening on http://${host}:${port}`);
  })
  .catch((err) => {
    app.log.error(err, "Failed to start servers");
    process.exit(1);
  });

