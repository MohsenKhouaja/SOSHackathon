import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { routePrefetchMap } from "./route-prefetch-map";

/**
 * Hook to dynamically prefetch data based on route patterns
 * @returns A function that takes a URL and prefetches matching queries
 *
 * @example
 * const prefetch = useRoutePrefetch();
 * <Link to="/orders" onMouseEnter={() => prefetch("/orders")} />
 */
export const useRoutePrefetch = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (url: string) => {
      // Find all matching prefetch configurations
      const matchingConfigs = routePrefetchMap.filter((config) =>
        config.pattern.test(url)
      );

      // Execute all matching prefetch functions
      for (const config of matchingConfigs) {
        try {
          config.prefetch(queryClient);
        } catch {
          // Silently fail prefetch errors to avoid disrupting UX
        }
      }
    },
    [queryClient]
  );
};
