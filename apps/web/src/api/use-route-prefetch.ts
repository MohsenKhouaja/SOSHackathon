import { trpc } from "@/lib/trpc";
import { useCallback } from "react";

export const useRoutePrefetch = () => {
  const utils = trpc.useUtils();

  return useCallback((route: string) => {
    // Implement prefetch logic based on route if needed
    // For now, it can be a no-op or basic implementation
    console.log("Prefetching route:", route);
  }, [utils]);
};

