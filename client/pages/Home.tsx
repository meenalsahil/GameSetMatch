import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Search,
  Trophy,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

// Helper to calculate funding progress
const getProgress = (current: number, goal: number) => {
  if (!goal) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
};

export default function Home() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const { data: players, isLoading } = useQuery({
    queryKey: ["/api/players"],
    queryFn: async () => {
      const res = await fetch("/api/players");
      if (!res.ok) throw new Error("Failed to load players");
      return res.json();
    },
  });

  // Filter logic
  const filteredPlayers = players?.filter((p: any) =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background pt-20 pb-16 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Invest in the Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Professional Tennis
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Directly support talented players rising through the ATP & WTA ranks. 
            Track their journey, analyze their stats, and be part of their team.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative mb-12">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-10 h-12 text-lg shadow-sm border-gray-200"
              placeholder="Search by name or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="py-16 bg-white dark:bg-background border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Find Rising Stars</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Discover players before they break into the top 100. Browse by country, playing style, or age.
              </p>
            </div>

            {/* Feature 2: Subtle text mention of AI */}
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Vet with Data</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Use our AI Analyst on any profile to pull official match records and win rates instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Track Impact</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                See exactly how your support helps with travel, coaching, and tournament fees.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- PLAYER GRID --- */}
      <section className="py-20 bg-gray-50/50 dark:bg-black/5">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Players</h2>
              <p className="text-muted-foreground">Talent waiting for an opportunity</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers?.map((player: any) => (
                <Link key={player.id} href={`/players/${player.id}`}>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group border-gray-200 h-full flex flex-col overflow-hidden">
                    {/* Image Area */}
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {player.photoUrl ? (
                        <img
                          src={player.photoUrl}
                          alt={player.fullName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <Users className="h-12 w-12 opacity-20" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                        Rank #{player.ranking || "N/A"}
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-start">
                        <span>{player.fullName}</span>
                        {player.country && (
                          <span className="text-lg" title={player.country}>
                            <span className="text-xs font-normal text-muted-foreground border px-1.5 py-0.5 rounded bg-gray-50">
                              {player.country}
                            </span>
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        {player.age ? `${player.age} yrs • ` : ""}
                        {player.playStyle || "Tennis Player"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="mt-auto pt-0">
                      <div className="space-y-3">
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-600 h-full rounded-full"
                            style={{
                              width: `${getProgress(
                                player.sponsorCount * 50, 
                                5000
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {player.sponsorCount || 0} Supporters
                          </span>
                          <span className="flex items-center gap-1 text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            View Profile <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && filteredPlayers?.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                No players found matching "{search}"
              </p>
              <Button
                variant="link"
                onClick={() => setSearch("")}
                className="mt-2 text-green-600"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}