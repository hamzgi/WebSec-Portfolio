import "server-only";
import mongoose from "mongoose";

type ConnectionCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongo = globalThis as typeof globalThis & {
  portfolioMongo?: ConnectionCache;
};
const cache = globalForMongo.portfolioMongo ??= { connection: null, promise: null };

/** Call only from the Node.js server, immediately before a database operation. */
export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  if (cache.connection && mongoose.connection.readyState === 1) return cache.connection;
  cache.connection = null;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
  }
  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } finally {
    // A failed or subsequently dropped connection must be able to reconnect.
    cache.promise = null;
  }
}
