import { QueryClient } from "@tanstack/react-query";

// One shared client. Sensible defaults; on-chain reads tune staleTime.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
