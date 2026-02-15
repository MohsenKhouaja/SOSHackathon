import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]),
    REDIS_URL: z.string().min(1),
    PHOTON_BASE_URL: z.url().default("http://localhost:2322"),
    OSRM_BASE_URL: z.url().default("http://localhost:5001"),
    VROOM_BASE_URL: z.url().default("http://localhost:3001")
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
