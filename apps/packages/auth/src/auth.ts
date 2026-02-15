/** biome-ignore-all lint/suspicious/noExplicitAny: yes */
/** biome-ignore-all lint/performance/noNamespaceImport: yes */
/** biome-ignore-all lint/nursery/noShadow: yes */
/** biome-ignore-all lint/suspicious/noNonNullAssertedOptionalChain: yes */

import { expo } from "@better-auth/expo";
import { db } from "@repo/db";
import * as schema from "@repo/db/tables";
import { corsOptions } from "@repo/shared";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  customSession,
  lastLoginMethod,
  openAPI,
  twoFactor,
} from "better-auth/plugins";
import { v7 as uuidv7 } from "uuid";
import { adminAc, adminRoles } from "./roles";

const options = {
  appName: "Lanci",
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    updateAge: 24 * 60 * 60, // 24 hours in seconds
  },
  plugins: [
    admin({
      ac: adminAc,
      roles: adminRoles,
    }),
    lastLoginMethod(),
    twoFactor(),
    expo(),
    openAPI(),
    customSession(
      async ({ user, session }) => {
        return {
          user: {
            ...user,
            role: user.role,
            programId: user.programId,
            homeId: user.homeId,
          },
          session,
        };
      },
      // pass options here if needed, or empty object if not
      {}
    ),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: corsOptions.origin,
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    database: {
      generateId: () => uuidv7(),
    },
  },
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "EXTERNAL",
      },
      programId: {
        type: "string",
        required: false,
      },
      homeId: {
        type: "string",
        required: false,
      },
    },
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth(options);
