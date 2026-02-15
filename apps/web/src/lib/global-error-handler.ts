import { queryClient } from "./trpc";

/**
 * Global Error Handler for tRPC/TanStack Query
 *
 * Handles UNAUTHORIZED errors globally by clearing cache and redirecting to login page.
 * This runs outside React component lifecycle, so we use window.location for navigation.
 */

// biome-ignore lint/suspicious/noExplicitAny: tRPC error types are dynamic
export function handleGlobalError(error: any): void {
  const errorCode = error?.data?.code ?? error?.code;
  const currentPath = window.location.pathname;

  // Check if UNAUTHORIZED and not already on login/signup/onboarding pages
  const isOnAuthPages =
    currentPath.startsWith("/login") ||
    currentPath.startsWith("/onboarding") ||
    currentPath.startsWith("/invite") ||
    currentPath.startsWith("/business-signup");

  if (errorCode === "UNAUTHORIZED" && !isOnAuthPages) {
    // Clear all cache on unauthorized error
    queryClient.clear();
    window.location.href = "/login";
  }
}

/**
 * Check if an error is an UNAUTHORIZED error
 */
// biome-ignore lint/suspicious/noExplicitAny: tRPC error types are dynamic
export function isUnauthorizedError(error: any): boolean {
  const errorCode = error?.data?.code ?? error?.code;
  return errorCode === "UNAUTHORIZED";
}
