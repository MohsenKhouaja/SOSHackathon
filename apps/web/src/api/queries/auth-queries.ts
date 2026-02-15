import { useSession } from "@/lib/auth-client";

export const useCurrentUser = () => {
  return useSession();
};

