import mongoose from "mongoose";
import { MONGODB_DB, MONGODB_URI } from "../utils/config";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

if (!MONGODB_DB || !MONGODB_URI) {
  throw console.error("--- ❌ Mongodb Keys not Present ---");
} else {
  console.log("--- ✅ Mongodb Keys present ---");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseConnection?: MongooseCache;
};

const cached = globalForMongoose.mongooseConnection ?? { conn: null, promise: null };

globalForMongoose.mongooseConnection = cached;

export async function connectToDatabase() {
  if (cached.conn) {
    console.log("--- ✅ MongoDB: using existing connection ---");
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error(" ❌ MONGODB_URI is not set. Set it in your environment to connect to MongoDB.");
  }

  if (!cached.promise) {
    console.log("--- ✅ MongoDB: connecting... ---");
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
      serverSelectionTimeoutMS: 10000,
    });
  }

  cached.conn = await cached.promise;
  console.log("--- ✅ MongoDB: connection established ---");
  return cached.conn;
}
