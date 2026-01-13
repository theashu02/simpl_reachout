import { Queue } from "bullmq";
import Redis from "ioredis";

const runtimeEnv = ((globalThis as typeof globalThis & { Bun?: { env: Record<string, string | undefined> } }).Bun?.env ?? process.env ?? {}) as Record<string, string | undefined>;

export const REDIS_HOST = runtimeEnv.REDIS_HOST ?? "localhost";
export const REDIS_PORT = Number(runtimeEnv.REDIS_PORT ?? 6379);

// Redis connection for BullMQ
export const redisConnection = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("--- ✅ Redis connected ---");
});

redisConnection.on("error", (err) => {
  console.error("--- ❌ Redis connection error ---", err.message);
});

// Queue for persisting company details
export const companyPersistQueue = new Queue("company-persist", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

console.log("--- ✅ BullMQ queue initialized ---");
