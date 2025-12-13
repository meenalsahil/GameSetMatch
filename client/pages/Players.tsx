import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Search, ExternalLink, Loader2, Flame } from "lucide-react";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: string;
  fullName: string;
  age: number;
  country: string;
  location: string;
  ranking: number | null;
  specialization: string;
  bio: string;
  fundingGoals: string;
  photoUrl: string | null;
  atpProfileUrl: string | null;
  sponsorCount?: number;
}

// Generate gradient colors based on name
function getGradientColors(name: string): string {
  const gradients = [
    "from-emerald-400 to-teal-500",
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-pink-500",
    "from-orange-400 to-red-500",
    "from-cyan-400 to-blue-500",
    "from-rose-400 to-pink-500",
    "from-violet-400 to-purple-500",
    "from-amber-400 to-orange-500",
    "from-lime-400 to-green-500",
    "from-fuchsia-400 to-purple-500",
  ];
  
  // Simple hash based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return gradients[Math.abs(hash) % gradients.length];
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Get country flag emoji
function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    "United States": "🇺🇸",
    "US": "🇺🇸",
    "USA": "🇺🇸",
    "Canada": "🇨🇦",
    "United Kingdom": "🇬🇧",
    "UK": "🇬🇧",
    "Australia": "🇦🇺",
    "France": "🇫🇷",
    "Germany": "🇩🇪",
    "Spain": "🇪🇸",
    "Italy": "🇮🇹",
    "Japan": "🇯🇵",
    "China": "🇨🇳",
    "India": "🇮🇳",
    "Brazil": "🇧🇷",
    "Argentina": "🇦🇷",
    "Mexico": "🇲🇽",
    "Russia": "🇷🇺",
    "Switzerland": "🇨🇭",
    "Netherlands": "🇳🇱",
    "Sweden": "🇸🇪",
    "Serbia": "🇷🇸",
    "Croatia": "🇭🇷",
    "Greece": "🇬🇷",
    "Poland": "🇵🇱",
    "Czech Republic": "🇨🇿",
    "South Africa": "🇿🇦",
    "South Korea": "🇰🇷",
  };
  
  return flags[country] || "🌍";
}

export default function BrowsePlayers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  const [sortBy, setSortBy] = useState("sponsors");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  const { toast } = useToast();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  // Get unique countries for filter
  const countries = [...new Set(players.map((p) => p.country))].sort();

  // Find max sponsor count for "Top Sponsored" badge
  const maxSponsorCount = Math.max(...players.map((p) => p.sponsorCount || 0), 0);

  // Check if player is new (you could add createdAt field later)
  const isNewPlayer = (player: Player) => {
    // For now, mark players with 0-2 sponsors as "new"
    return (player.sponsorCount || 0) <= 2;
  };

  // Filter and sort players
  let filteredPlayers = players.filter((player) => {
    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        player.fullName.toLowerCase().includes(query) ||
        player.location.toLowerCase().includes(query) ||
        player.country.toLowerCase().includes(query) ||
        player.specialization.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Country filter
    if (countryFilter !== "all" && player.country !== countryFilter) {
      return false;
    }

    // Rank filter
    if (rankFilter !== "all" && player.ranking) {
      if (rankFilter === "top100" && player.ranking > 100) return false;
      if (rankFilter === "top500" && player.ranking > 500) return false;
      if (rankFilter === "top1000" && player.ranking > 1000) return false;
    }

    return true;
  });

 // If AI search was performed, only show matched players
  if (aiMatchedIds && aiMatchedIds.length > 0) {
    const matchedPlayers = aiMatchedIds
      .map((id) => filteredPlayers.find((p) => p.id === id))
      .filter(Boolean) as Player[];
    filteredPlayers = matchedPlayers; // Only show matches, not all players
  } else {
    // Sort players
    filteredPlayers.sort((a, b) => {
      if (sortBy === "sponsors") {
        return (b.sponsorCount || 0) - (a.sponsorCount || 0);
      }
      if (sortBy === "ranking") {
        return (a.ranking || 9999) - (b.ranking || 9999);
      }
      return a.fullName.localeCompare(b.fullName);
    });
  }

  // AI Search handler
  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim()) {
      toast({
        title: "Enter a description",
        description: "Please describe what kind of player you're looking for.",
        variant: "destructive",
      });
      return;
    }

    setIsAiSearching(true);
    setAiMatchedIds(null);

    try {
      const res = await fetch("/api/ai/search-players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiSearchQuery }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Search failed");
      }

      const data = await res.json();
      setAiMatchedIds(data.matchedPlayerIds || []);
      
      if (data.matchedPlayerIds?.length === 0) {
        toast({
          title: "No matches found",
          description: "Try adjusting your search criteria.",
        });
      } else {
        toast({
          title: `Found ${data.matchedPlayerIds.length} matches!`,
          description: "Players are now sorted by relevance.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAiSearching(false);
    }
  };

  const clearAiSearch = () => {
    setAiSearchQuery("");
    setAiMatchedIds(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Player</h1>
            <p className="text-gray-600">
              Support talented tennis athletes on their journey to success
            </p>
          </div>

          {/* AI Search Bar */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Describe your ideal player... e.g., 'Young clay court player from Europe'"
                  value={aiSearchQuery}
                  onChange={(e) => setAiSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
                  className="flex-1 border-0 shadow-none focus-visible:ring-0 text-gray-700 placeholder-gray-400"
                />
              </div>
              {aiMatchedIds ? (
                <Button
                  onClick={clearAiSearch}
                  variant="outline"
                  className="px-6 py-3 rounded-xl"
                >
                  Clear
                </Button>
              ) : (
                <Button
                  onClick={handleAiSearch}
                  disabled={isAiSearching}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  {isAiSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      AI Search
                    </>
                  )}
                </Button>
              )}
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              ✨ Powered by AI • Free to use
            </p>
          </div>

          {/* Filters */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            <Input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 rounded-full bg-white border-gray-200"
            />
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-40 rounded-full bg-white border-gray-200">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {getCountryFlag(country)} {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rankFilter} onValueChange={setRankFilter}>
              <SelectTrigger className="w-40 rounded-full bg-white border-gray-200">
                <SelectValue placeholder="All Rankings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rankings</SelectItem>
                <SelectItem value="top100">Top 100</SelectItem>
                <SelectItem value="top500">Top 500</SelectItem>
                <SelectItem value="top1000">Top 1000</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 rounded-full bg-purple-100 border-purple-200 text-purple-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sponsors">Most Sponsored</SelectItem>
                <SelectItem value="ranking">Best Ranking</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <p className="text-gray-500 text-sm mb-4">
            {aiMatchedIds
              ? `Showing ${aiMatchedIds.length} AI matches out of ${filteredPlayers.length} players`
              : `Showing ${filteredPlayers.length} players`}
          </p>

          {/* Player List */}
          {filteredPlayers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <p className="text-gray-500">No players found matching your criteria.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {filteredPlayers.map((player, index) => {
                const isTopSponsored =
                  maxSponsorCount > 0 &&
                  (player.sponsorCount || 0) === maxSponsorCount &&
                  maxSponsorCount >= 5;
                const isNew = isNewPlayer(player);
                const isAiMatch = aiMatchedIds?.includes(player.id);

                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-4 p-5 transition-all cursor-pointer border-b border-gray-100 last:border-b-0 ${
                      isTopSponsored
                        ? "bg-amber-50 hover:bg-amber-100"
                        : isAiMatch
                        ? "bg-purple-50 hover:bg-purple-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-14 h-14 rounded-full bg-gradient-to-br ${getGradientColors(
                        player.fullName
                      )} flex items-center justify-center text-xl font-bold text-white flex-shrink-0`}
                    >
                      {player.photoUrl ? (
                        <img
                          src={player.photoUrl}
                          alt={player.fullName}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        getInitials(player.fullName)
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {player.fullName}
                        </h3>
                        {isTopSponsored && (
                          <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            Top Sponsored
                          </span>
                        )}
                        {isNew && !isTopSponsored && (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            ✨ New
                          </span>
                        )}
                        {isAiMatch && (
                          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            AI Match
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {getCountryFlag(player.country)} {player.country}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {player.location} • {player.specialization}
                        {player.ranking && ` • Rank #${player.ranking}`}
                      </p>
                      
                      {/* ATP Profile Link */}
                      {player.atpProfileUrl && (
                        <a
                          href={player.atpProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          View ATP Profile
                        </a>
                      )}
                    </div>

                    {/* Sponsor Count */}
                    <div className="text-center px-4">
                      <p className="text-xl font-bold text-emerald-600">
                        {player.sponsorCount || 0}
                      </p>
                      <p className="text-xs text-gray-500">sponsors</p>
                    </div>

                    {/* View Button */}
                    <Button
                      asChild
                      className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
                    >
                      <Link href={`/players/${player.id}`}>View Profile</Link>
                    </Button>
                  </div>
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