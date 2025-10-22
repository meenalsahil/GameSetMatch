import { useQuery } from "@tanstack/react-query";
import type { Player } from "@shared/schema";

export function useAuth() {
  const {
    data: player,
    isLoading,
    error,
  } = useQuery<Player | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");

      // If not authenticated, return null instead of throwing error
      if (res.status === 401) {
        return null;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      return res.json();
    },
    retry: false,
    staleTime: 0, // Always check for fresh data
  });

  return {
    player: player || null,
    isLoading,
    isAuthenticated: !!player,
    error,
  };
}
