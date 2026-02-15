import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:5000", // Using defaults from README
  plugins: [adminClient()],
});

export const { useSession, signIn, signOut } = authClient;

