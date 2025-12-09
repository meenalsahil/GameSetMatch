import { useQuery } from "@tanstack/react-query";
import type { Player } from "@shared/schema";

export function useAuth() {
  const {
    data: player,
    isLoading,
    error,
  } = useQuery<Player>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    player,
    isLoading,
    isAuthenticated: !!player,
    error,
  };
}
