import { loadEnvConfig } from "@next/env";
import { connectToDatabase } from "../lib/db";

loadEnvConfig(process.cwd());

async function main() {
  try {
    const mongoose = await connectToDatabase();
    await mongoose.connection.db!.admin().ping();
    console.log("MongoDB connection and ping succeeded.");
    await mongoose.disconnect();
  } catch {
    // Do not print the driver error: it may contain connection credentials.
    console.error("MongoDB connection failed. Check MONGODB_URI and server/network access.");
    process.exitCode = 1;
  }
}

void main();
