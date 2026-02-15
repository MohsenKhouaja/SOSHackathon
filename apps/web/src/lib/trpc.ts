import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@repo/trpc";
import { QueryClient } from "@tanstack/react-query";

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,
      retry: false,
    },
  },
});

