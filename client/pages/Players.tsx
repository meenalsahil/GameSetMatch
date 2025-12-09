// client/src/pages/Players.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import PlayerCard from "@/components/PlayerCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface PlayerListItem {
  id: number;
  fullName: string;
  location: string;
  country?: string | null;
  ranking?: number | string | null;
  specialization?: string | null;
  photoUrl?: string | null;
  atpProfileUrl?: string | null;
  atpVerified?: boolean;
  atpVerificationScore?: number | null;
}

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");

  const { data: players = [], isLoading } = useQuery<PlayerListItem[]>({
    queryKey: ["/api/players"],
  });

  // unique countries
  const countries = useMemo(() => {
    const uniqueCountries = [
      ...new Set(
        players.map((p: any) => p.country).filter((c) => !!c) as string[],
      ),
    ];
    return uniqueCountries.sort();
  }, [players]);

  const filteredPlayers = useMemo(() => {
    return (players as PlayerListItem[]).filter((player) => {
      const matchesSearch =
        player.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.specialization
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesCountry =
        countryFilter === "all" || player.country === countryFilter;

      let matchesRank = true;
      if (rankFilter !== "all" && player.ranking) {
        const rank = parseInt(String(player.ranking));
        if (!Number.isNaN(rank)) {
          switch (rankFilter) {
            case "top100":
              matchesRank = rank <= 100;
              break;
            case "101-500":
              matchesRank = rank > 100 && rank <= 500;
              break;
            case "501-1000":
              matchesRank = rank > 500 && rank <= 1000;
              break;
            case "1000plus":
              matchesRank = rank > 1000;
              break;
          }
        }
      }

      return matchesSearch && matchesCountry && matchesRank;
    });
  }, [players, searchQuery, countryFilter, rankFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setCountryFilter("all");
    setRankFilter("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-2">Browse Players</h1>
        <p className="text-muted-foreground mb-8">
          Discover tennis players at all levels seeking sponsorship support
        </p>

        {/* Search + filters */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={rankFilter} onValueChange={setRankFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Ranks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                <SelectItem value="top100">Top 100</SelectItem>
                <SelectItem value="101-500">101-500</SelectItem>
                <SelectItem value="501-1000">501-1000</SelectItem>
                <SelectItem value="1000plus">1000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || countryFilter !== "all" || rankFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredPlayers.length}{" "}
          {filteredPlayers.length === 1 ? "player" : "players"}
        </p>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading players...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No players found matching your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                id={player.id}
                name={player.fullName}
                location={player.location}
                country={player.country || undefined}
                ranking={player.ranking}
                specialization={player.specialization || undefined}
                photoUrl={player.photoUrl || undefined}
                atpProfileUrl={player.atpProfileUrl || undefined}
                atpVerified={player.atpVerified}
                atpVerificationScore={player.atpVerificationScore}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
