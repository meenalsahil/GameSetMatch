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
  ShieldCheck,
  Target,
  Wallet,
  Globe,
  Video
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
      {/* --- 1. HERO SECTION --- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background pt-20 pb-16 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Invest in the Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Professional Tennis
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The first platform connecting aspiring ATP & WTA players directly with supporters. 
            Fund their travel, coaching, and tournaments.
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

      {/* --- 2. HOW IT WORKS --- */}
      <section className="py-16 bg-white dark:bg-background border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We bridge the financial gap between talented athletes and the tennis community.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Discover Talent</h3>
              <p className="text-muted-foreground">
                Browse verified profiles of rising stars from around the world.
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Direct Support</h3>
              <p className="text-muted-foreground">
                Contribute to specific career needs like flights, hotels, and coaching fees.
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Track Progress</h3>
              <p className="text-muted-foreground">
                Watch them climb the rankings and receive exclusive updates from the tour.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. FOR PLAYERS SECTION --- */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">For Players</h2>
              <p className="text-muted-foreground">Launch your professional career</p>
            </div>
            <Button variant="outline" className="mt-4 md:mt-0" onClick={() => setLocation("/auth")}>
              Create Player Profile
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Create Profile</CardTitle>
                <CardDescription>
                  Share your story, ranking history, and funding goals with the world.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Video className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Verification</CardTitle>
                <CardDescription>
                  Upload a verification video to prove your identity and skill level.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Wallet className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Get Funded</CardTitle>
                <CardDescription>
                  Receive funds directly to your Stripe account for career expenses.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* --- 4. FOR SUPPORTERS SECTION --- */}
      <section className="py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2">For Supporters</h2>
            <p className="text-muted-foreground">Be part of the journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Global Talent</CardTitle>
                <CardDescription>
                  Access a worldwide pool of tennis talent, from juniors to pros.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <ShieldCheck className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Secure & Verified</CardTitle>
                <CardDescription>
                  All payments are processed securely via Stripe. Profiles are vetted.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Trophy className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Impact</CardTitle>
                <CardDescription>
                  Your support can be the difference between a player retiring or breaking top 100.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* --- 5. FEATURED PLAYERS --- */}
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
                            <span className="text-xs font-normal text-muted-foreground border px-1.5 py-0.5 rounded