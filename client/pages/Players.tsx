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
import { Sparkles, Search, ExternalLink, Loader2, Flame, User, Users, Info } from "lucide-react";
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
  gender?: string;
  playStyle?: string;
  createdAt?: string;
}

// ... existing helper functions (getGradientColors, getCountryFlag, etc.) ...
// Copied from your previous file to keep it consistent
function getGradientColors(name: string): string {
  const gradients = [
    "from-emerald-400 to-teal-500", "from-blue-400 to-indigo-500", "from-purple-400 to-pink-500",
    "from-orange-400 to-red-500", "from-cyan-400 to-blue-500", "from-rose-400 to-pink-500"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}
function getInitials(name: string) { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2); }
function getCountryFlag(country: string): string {
    // Basic mapping, you can expand this
    const flags: any = { "United States": "🇺🇸", "Canada": "🇨🇦", "United Kingdom": "🇬🇧", "France": "🇫🇷", "Germany": "🇩🇪", "Spain": "🇪🇸", "Italy": "🇮🇹", "Japan": "🇯🇵", "Australia": "🇦🇺" };
    return flags[country] || "🌍";
}
function formatPlayStyle(s: string | undefined) { if(!s) return ""; return s === 'both' ? 'Singles & Doubles' : s.charAt(0).toUpperCase() + s.slice(1); }
function formatGender(g: string | undefined) { if(!g) return ""; return g.charAt(0).toUpperCase() + g.slice(1); }
function isNewPlayer(p: Player) { if(!p.createdAt) return false; const d = new Date(p.createdAt); const now = new Date(); now.setDate(now.getDate()-30); return d >= now; }

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  const [sortBy, setSortBy] = useState("sponsors");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  const { toast } = useToast();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { data: players = [], isLoading } = useQuery<Player[]>({ queryKey: ["/api/players"] });
  const countries = [...new Set(players.map((p) => p.country))].sort();
  const maxSponsorCount = Math.max(...players.map((p) => p.sponsorCount || 0), 0);

  let filteredPlayers = players.filter((player) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!player.fullName.toLowerCase().includes(q) && !player.location.toLowerCase().includes(q) && !player.country.toLowerCase().includes(q)) return false;
    }
    if (countryFilter !== "all" && player.country !== countryFilter) return false;
    if (rankFilter !== "all" && player.ranking) {
      if (rankFilter === "top100" && player.ranking > 100) return false;
      if (rankFilter === "top500" && player.ranking > 500) return false;
      if (rankFilter === "top1000" && player.ranking > 1000) return false;
    }
    return true;
  });

  if (aiMatchedIds && aiMatchedIds.length > 0) {
    filteredPlayers = aiMatchedIds.map((id) => filteredPlayers.find((p) => p.id === id)).filter(Boolean) as Player[];
  } else {
    filteredPlayers.sort((a, b) => {
      if (sortBy === "sponsors") return (b.sponsorCount || 0) - (a.sponsorCount || 0);
      if (sortBy === "ranking") return (a.ranking || 9999) - (b.ranking || 9999);
      return a.fullName.localeCompare(b.fullName);
    });
  }

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim()) return;
    setIsAiSearching(true);
    setAiMatchedIds(null);
    try {
      const res = await fetch("/api/ai/search-players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiSearchQuery }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setAiMatchedIds(data.matchedPlayerIds || []);
      toast({ title: `Found ${data.matchedPlayerIds.length} matches!`, description: "Sorted by relevance." });
    } catch (error) {
      toast({ title: "Search failed", variant: "destructive" });
    } finally {
      setIsAiSearching(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-10">
         <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Find a Player to Support</h1>
            <p className="text-gray-600">
              Browse verified athletes and help fund their journey to success
            </p>
          </div>

          {/* AI Search Bar */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <Input type="text" placeholder="Describe your ideal player... e.g., 'Young clay court player from Europe'" value={aiSearchQuery} onChange={(e) => setAiSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAiSearch()} className="flex-1 border-0 shadow-none focus-visible:ring-0 text-gray-700 placeholder-gray-400" />
              </div>
              {aiMatchedIds ? (
                <Button onClick={() => { setAiSearchQuery(""); setAiMatchedIds(null); }} variant="outline" className="px-6 py-3 rounded-xl">Clear</Button>
              ) : (
                <Button onClick={handleAiSearch} disabled={isAiSearching} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all">
                  {isAiSearching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <><Search className="w-4 h-4 mr-2" /> AI Search</>}
                </Button>
              )}
            </div>
          </div>

          {/* NEW: Rankings Disclaimer */}
          <div className="max-w-3xl mx-auto mb-10 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 text-sm text-blue-800">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
            <div>
              <p className="font-semibold mb-1">About Player Rankings</p>
              <p className="opacity-90 leading-relaxed">
                Rankings on GameSetMatch are self-reported by players or last updated from our database (Dec 2025). 
                For the most up-to-date live rankings, please verify on the official <a href="https://www.atptour.com" target="_blank" rel="noreferrer" className="underline hover:text-blue-950 font-medium">ATP</a> or <a href="https://www.wtatennis.com" target="_blank" rel="noreferrer" className="underline hover:text-blue-950 font-medium">WTA</a> websites via the player's profile link.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            <Input type="text" placeholder="Quick search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-48 rounded-full bg-white border-gray-200" />
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-40 rounded-full bg-white border-gray-200"><SelectValue placeholder="All Countries" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((c) => <SelectItem key={c} value={c}>{getCountryFlag(c)} {c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={rankFilter} onValueChange={setRankFilter}>
              <SelectTrigger className="w-40 rounded-full bg-white border-gray-200"><SelectValue placeholder="All Rankings" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Rankings</SelectItem><SelectItem value="top100">Top 100</SelectItem><SelectItem value="top500">Top 500</SelectItem><SelectItem value="top1000">Top 1000</SelectItem></SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 rounded-full bg-purple-100 border-purple-200 text-purple-700"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent><SelectItem value="sponsors">Most Sponsored</SelectItem><SelectItem value="ranking">Best Ranking</SelectItem><SelectItem value="name">Name A-Z</SelectItem></SelectContent>
            </Select>
          </div>

          {/* Player Cards */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {filteredPlayers.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No players found matching your criteria.</div>
            ) : (
              filteredPlayers.map((player) => {
                const isTop = maxSponsorCount > 0 && (player.sponsorCount || 0) === maxSponsorCount && maxSponsorCount >= 5;
                const isNew = isNewPlayer(player);
                const isMatch = aiMatchedIds?.includes(player.id);
                return (
                  <div key={player.id} className={`flex items-center gap-4 p-5 border-b border-gray-100 last:border-b-0 ${isTop ? "bg-amber-50" : isMatch ? "bg-purple-50" : "hover:bg-gray-50"}`}>
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getGradientColors(player.fullName)} flex items-center justify-center text-xl font-bold text-white flex-shrink-0`}>
                      {player.photoUrl ? <img src={player.photoUrl} alt={player.fullName} className="w-14 h-14 rounded-full object-cover" /> : getInitials(player.fullName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{player.fullName}</h3>
                        {isTop && <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Flame className="w-3 h-3" /> Top Sponsored</span>}
                        {isNew && !isTop && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">✨ New</span>}
                        {isMatch && <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">AI Match</span>}
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{getCountryFlag(player.country)} {player.country}</span>
                      </div>
                      <p className="text-sm text-gray-500">{player.location} • {player.specialization}{player.ranking && ` • Rank #${player.ranking}`}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {player.gender && <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"><User className="w-3 h-3" /> {formatGender(player.gender)}</span>}
                        {player.playStyle && <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full"><Users className="w-3 h-3" /> {formatPlayStyle(player.playStyle)}</span>}
                        {player.atpProfileUrl && (
                          <a href={player.atpProfileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink className="w-3 h-3" /> View Profile
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-center px-4"><p className="text-xl font-bold text-emerald-600">{player.sponsorCount || 0}</p><p className="text-xs text-gray-500">sponsors</p></div>
                    <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium"><Link href={`/players/${player.id}`}>View Profile</Link></Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}