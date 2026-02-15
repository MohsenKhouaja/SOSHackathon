import type { MemberRole } from "@repo/auth";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

/**
 * Query options for getting the current authenticated user
 * This replaces useSession from the auth client
 */
export const getCurrentUserQueryOptions = () =>
  trpc.delivery.auth.getCurrentUser.queryOptions(
    //   {
    //   retry: false, // Never retry auth requests
    //   staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    //   refetchOnWindowFocus: false, // Don't refetch on window focus
    // }
  );

/**
 * Hook to get the current authenticated user
 * This replaces useSession from the auth client
 */
export const useCurrentUser = () => useQuery(getCurrentUserQueryOptions());

export const useIsProgramDirector = () => {
  const { data: session } = useCurrentUser();
  return session?.user?.role === "PROGRAM_DIRECTOR";
};

export const useIsDeliveryCompany = () => {
  const { data: session } = useCurrentUser();
  return !!session?.user?.programId;
};

export const useIsBusiness = () => {
  const { data: session } = useCurrentUser();
  return !!session?.user?.programId;
};

export const useMemberRole = () => {
  const { data: session } = useCurrentUser();
  return session?.user.memberRole as MemberRole;
};
