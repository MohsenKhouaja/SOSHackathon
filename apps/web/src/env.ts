import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_PUBLIC_APP_URL: z.url(),
    VITE_NODE_ENV: z.enum(["development", "production"]),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
