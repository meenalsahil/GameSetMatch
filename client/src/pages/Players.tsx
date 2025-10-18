import { useState, useMemo } from "react";
import PlayerCard from "@/components/PlayerCard";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Player } from "@shared/schema";

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    
    const query = searchQuery.toLowerCase();
    if (!query) return players;
    
    return players.filter(
      (player) =>
        player.fullName.toLowerCase().includes(query) ||
        player.location.toLowerCase().includes(query) ||
        player.specialization.toLowerCase().includes(query)
    );
  }, [players, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading players...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="bg-muted/30 py-16">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Browse Players
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover tennis players at all levels seeking sponsorship support
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or specialization..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-players"
              />
            </div>
            <Button variant="outline" data-testid="button-filters">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {filteredPlayers.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {searchQuery ? "No players found matching your search." : "No players available yet."}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlayers.map((player) => {
                const ranking = player.ranking ? parseInt(player.ranking, 10) : undefined;
                return (
                  <PlayerCard 
                    key={player.id}
                    id={player.id}
                    name={player.fullName}
                    location={player.location}
                    ranking={!isNaN(ranking || 0) ? ranking : undefined}
                    specialization={player.specialization}
                    photoUrl={player.photoUrl}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
