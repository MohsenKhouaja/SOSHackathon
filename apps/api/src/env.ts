import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const DEFAULT_PORT = 3001;

export const env = createEnv({
  server: {
    PORT: z.coerce.number<number>().default(DEFAULT_PORT),
    NODE_ENV: z.enum(["development", "production"]),
    REDIS_URL: z.string().min(1),
    PHOTON_BASE_URL: z.url().default("http://localhost:2322"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
