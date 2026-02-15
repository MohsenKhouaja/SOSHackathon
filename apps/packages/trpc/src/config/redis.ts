/** biome-ignore-all lint/suspicious/noConsole: yes */
import { redis as redisDefaultClient } from "bun";

export const redis = redisDefaultClient;

// Cleanup Redis connection on process termination
const cleanup = () => {
  try {
    redis.close();
    console.info("Redis connection closed");
  } catch (error) {
    console.error("Error closing Redis connection", error);
  }
};

process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
process.on("beforeExit", cleanup);
