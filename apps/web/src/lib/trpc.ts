/** biome-ignore-all lint/suspicious/noExplicitAny: yes */
import type { AppRouter } from "@repo/trpc";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import {
  createTRPCClient,
  createWSClient,
  httpBatchLink,
  loggerLink,
  splitLink,
  wsLink,
} from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";
import { handleGlobalError } from "./global-error-handler";

const MAX_FAILURES = 5;

const WS_ENDPOINT_URL =
  import.meta.env.VITE_WS_SERVER_URL || "ws://localhost:3000";
// import.meta.env.VITE_WS_SERVER_URL || 'ws://localhost:5000';

// Create WebSocket client that uses cookie authentication
const wsClient = createWSClient({
  url: `${WS_ENDPOINT_URL}/api/trpc`,
});

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      handleGlobalError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handleGlobalError(error);
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Number.POSITIVE_INFINITY,
      retry: (failureCount, error: any) => {
        if (
          error &&
          ["BAD_REQUEST", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND"].includes(
            error.data.code
          )
        ) {
          return false;
        }
        if (failureCount < MAX_FAILURES) {
          return true;
        }
        return false;
      },
    },
    // mutations: {
    //   onError(error) {
    //     handleGlobalError(error);
    //   },
    // },
  },
});

const TRPC_SERVER_URL =
  import.meta.env.VITE_PUBLIC_APP_URL || "http://localhost:5000";

const TRPC_ENDPOINT_URL = `${TRPC_SERVER_URL}/api/trpc`;

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: () => import.meta.env.DEV,
    }),
    splitLink({
      condition(op) {
        // Use WebSocket link for subscriptions
        return op.type === "subscription";
      },
      true: wsLink({
        client: wsClient,
        transformer: superjson,
      }),
      false: httpBatchLink({
        url: TRPC_ENDPOINT_URL,
        fetch(_url, options: any) {
          return fetch(_url, {
            ...options,
            credentials: "include",
          });
        },
        transformer: superjson,
      }),
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
