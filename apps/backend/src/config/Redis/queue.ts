import { Queue } from "bullmq";
import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "../../utils/config";

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
