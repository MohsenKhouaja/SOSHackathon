import type { QueryClient } from "@tanstack/react-query";

// NOTE: This project doesn't currently ship the per-route prefetch query modules that
// this map was originally wired up for. Prefetching is an optional UX optimization,
// so we keep the hook working but disable prefetching until those modules are added.

export type PrefetchConfig = {
  pattern: RegExp;
  prefetch: (queryClient: QueryClient) => void;
};

/**
 * Route-to-query prefetch mapping
 * Automatically prefetches data when users hover/focus on navigation links
 */
export const routePrefetchMap: PrefetchConfig[] = [];
