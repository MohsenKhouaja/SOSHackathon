/** biome-ignore-all lint/style/useNamingConvention: all good */
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_PUBLIC_APP_URL,
  plugins: [
    adminClient(),
    organizationClient({
      schema: {
        organization: {
          additionalFields: {
            type: {
              type: "string",
              required: true,
              input: true,
            },
            locationId: {
              type: "string",
              input: true,
            },
          },
        },
        team: {
          additionalFields: {
            type: {
              type: "string",
              required: true,
              input: true,
            },
            teamManagerId: {
              type: "string",
              required: true,
              input: true,
            },
          },
        },
      },
    }),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
