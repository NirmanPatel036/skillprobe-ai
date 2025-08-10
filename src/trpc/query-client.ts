// query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Disable automatic retries to prevent infinite loops
        retry: false,
        // Reduce stale time
        staleTime: 30 * 1000, // 30 seconds
        // Don't throw errors in render
        throwOnError: false,
        // Disable refetching on window focus during development
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
      },
      mutations: {
        // Disable automatic retries for mutations
        retry: false,
        throwOnError: false,
      },
    },
  });