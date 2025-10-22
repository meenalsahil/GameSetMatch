import { useQuery } from "@tanstack/react-query";
import type { Player } from "@shared/schema";

export function useAuth() {
  const {
    data: player,
    isLoading,
    error,
    refetch,
  } = useQuery<Player | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        credentials: "include", // ADDED: Ensure cookies are sent
      });

      if (res.status === 401) {
        return null;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      return res.json();
    },
    retry: 1, // CHANGED: Retry once if it fails
    retryDelay: 300, // ADDED: Wait 300ms before retry
    staleTime: 0,
  });

  return {
    player: player || null,
    isLoading,
    isAuthenticated: !!player,
    error,
    refetch,
  };
}
