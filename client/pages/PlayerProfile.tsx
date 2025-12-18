import { useEffect, useState, FormEvent } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MapPin,
  Trophy,
  Heart,
  ExternalLink,
  Globe,
  Sparkles,  
  X,        
  Loader2,   
  ArrowUp,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// ============================================
// StAItistics Logo Component - Reusable
// ============================================
const StAItisticsLogo = ({ size = "default" }: { size?: "small" | "default" | "large" }) => {
  const sizeClasses = {
    small: "text-sm",
    default: "text-lg",
    large: "text-2xl"
  };
  
  return (
    <span className={`font-bold ${sizeClasses[size]}`}>
      St<span className="bg-white/20 text-yellow-300 px-1 rounded mx-0.5 font-extrabold">AI</span>tistics
    </span>
  );
};

// Dark version for light backgrounds
const StAItisticsLogoDark = ({ size = "default" }: { size?: "small" | "default" | "large" }) => {
  const sizeClasses = {
    small: "text-sm",
    default: "text-lg", 
    large: "text-2xl"
  };
  
  return (
    <span className={`font-bold text-gray-900 ${sizeClasses[size]}`}>
      St<span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-1.5 py-0.5 rounded mx-0.5 font-extrabold">AI</span>tistics
    </span>
  );
};

export default function PlayerProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Force scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const {
    data: player,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/players/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/players/${id}`);
      if (!res.ok) throw new Error("Failed to load player");
      return res.json();
    },
  });

  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // --- AI STATE ---
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{used: boolean, date: string} | null>(null);

  const handleSupportClick = () => {
    if (!player) {
      toast({
        title: "Support Interest",
        description: "Thanks for your interest in supporting this player! We'll contact you shortly.",
      });
      return;
    }
    setIsSponsorModalOpen(true);
  };

  const proceedToStripe = async () => {
    if (!termsAccepted) return;
    setIsSponsorModalOpen(false); 

    try {
      const res = await fetch(`/api/players/${player.id}/sponsor-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 409) {
        toast({
          title: "Support Interest",
          description: "Thanks for your interest! We'll contact you shortly.",
        });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({
          title: "Something went wrong",
          description: data?.message || "We couldn't start the sponsorship right now.",
          variant: "destructive",
        });
        return;
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Support Interest",
          description: "Thanks for your interest!",
        });
      }
    } catch (err) {
      console.error("Sponsor error", err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // --- FIXED ASK FUNCTION ---
  const handleAskAi = async (e?: FormEvent) => {
    if (e) e.preventDefault(); // Prevent page reload if submitted via form

    if (!aiQuestion.trim() || !player) return;
    setIsAiLoading(true);
    
    try {
      const res = await fetch(`/api/players/${player.id}/ask-stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: aiQuestion }),
      });
      
      const data = await res.json();
      setAiAnswer(data.answer);
      if (data.lastUpdated) {
         setCacheInfo({
           used: data.usedCache,
           date: new Date(data.lastUpdated).toLocaleDateString() 
         });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Could not fetch answer. Check server logs.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );

  if (error || !player)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">
          Player not found or unavailable.
        </p>
        <Button variant="outline" onClick={() => setLocation("/players")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Browse Players
        </Button>
      </div>
    );

  const hasVideo = !!player.videoUrl;
  const isLocalVideo = hasVideo && player.videoUrl.startsWith("/uploads");
  const isYouTube =
    hasVideo &&
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(player.videoUrl);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => setLocation("/players")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Browse Players
        </Button>

        {/* Player Header Card */}
        <Card className="mb-6 border-none shadow-md">
          <CardHeader className="bg-white pb-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold mb-2">
                  {player.fullName}
                </CardTitle>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {player.location}
                  </span>
                  {player.country && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" /> {player.country}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" /> Rank #
                    {player.ranking || "N/A"}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Button onClick={handleSupportClick} className="shadow-sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Support this Player
                </Button>
                
                {player.atpProfileUrl && (
                  <a
                    href={player.atpProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    ATP Profile
                  </a>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* StAItistics FEATURE CARD */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div 
          onClick={() => setIsAiChatOpen(true)}
          className="mb-8 cursor-pointer group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-1 shadow-lg transition-all hover:shadow-xl hover:scale-[1.01]"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative flex items-center justify-between rounded-lg bg-white/10 backdrop-blur-sm p-4 px-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 shadow-inner">
                <BarChart3 className="h-6 w-6 text-yellow-300" />
              </div>
              <div className="text-white">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <StAItisticsLogo />
                  <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                </h3>
                <p className="text-sm text-purple-100 opacity-90">
                  AI-powered performance analysis for {player.fullName.split(' ')[0]}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm transition-transform group-hover:translate-x-1">
              Analyze <TrendingUp className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Player Stats Grid */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Age</p>
                <p className="text-lg font-semibold">{player.age || "N/A"}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Gender</p>
                <p className="text-lg font-semibold capitalize">
                  {player.gender || "N/A"}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  Specialization
                </p>
                <p className="text-lg font-semibold">
                  {player.specialization || "N/A"}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  Country
                </p>
                <p className="text-lg font-semibold">
                  {player.country || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
              🎬 Verification / Introduction
            </h3>
            {hasVideo ? (
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-black shadow-md">
                {isLocalVideo ? (
                  <video
                    src={player.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : isYouTube ? (
                  <iframe
                    src={player.videoUrl.replace("watch?v=", "embed/")}
                    title="Player video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <video
                    src={player.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No video uploaded yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Player Information */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                  📖 Your Story
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {player.bio || "No story provided yet."}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                  💰 What are you raising funds for?
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {player.fundingGoals || "No fundraising details provided."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-2">
              Support {player.fullName}&apos;s Journey
            </h3>
            <p className="mb-4 text-green-50">
              Help talented players reach their full potential.
            </p>
            <Button onClick={handleSupportClick} variant="secondary" size="lg">
              <Heart className="h-5 w-5 mr-2" />
              Become a Supporter Today
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* --- MODAL 1: Sponsor Consent --- */}
      {isSponsorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Support {player?.fullName}
            </h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              You are about to be redirected to Stripe to complete your sponsorship. 
              Please confirm you agree to our platform rules.
            </p>

            <div className="flex items-start gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="sponsorTerms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
              />
              <label htmlFor="sponsorTerms" className="text-sm text-gray-700 cursor-pointer select-none">
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold">
                  Privacy Policy
                </a>
                . I understand that sponsorships are non-refundable.
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsSponsorModalOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={proceedToStripe}
                disabled={!termsAccepted}
                className={`text-white transition-all ${
                  termsAccepted 
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-md" 
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MODAL 2: StAItistics Chat */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {isAiChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            
            {/* Header with StAItistics branding */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <BarChart3 className="h-4 w-4 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-bold flex items-center gap-1">
                    <StAItisticsLogo size="default" />
                  </h3>
                  <p className="text-xs text-purple-200">AI-Powered Analysis</p>
                </div>
              </div>
              <button onClick={() => setIsAiChatOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 min-h-[300px]">
              {aiAnswer ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                     <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-2xl rounded-tr-none text-sm max-w-[85%]">
                       {aiQuestion}
                     </div>
                  </div>
                  <div className="flex justify-start">
                     <div className="bg-white border border-gray-200 shadow-sm text-gray-700 px-4 py-3 rounded-2xl rounded-tl-none text-sm leading-relaxed whitespace-pre-line">
                       {aiAnswer}
                     </div>
                  </div>
                  
                  {/* Cache Indicator Footer */}
                  {cacheInfo && (
                    <div className="text-xs text-gray-400 text-center mt-4 border-t pt-2">
                       Data from: {cacheInfo.date} • {cacheInfo.used ? "⚡ Cached" : "🌍 Live Search"}
                    </div>
                  )}

                  <Button 
                    variant="link" 
                    className="text-xs text-purple-600 w-full mt-2"
                    onClick={() => { setAiAnswer(""); setAiQuestion(""); }}
                  >
                    Ask another question
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-400">
                   <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-2 shadow-inner">
                     <BarChart3 className="h-8 w-8 text-purple-600" />
                   </div>
                   <div>
                     <StAItisticsLogoDark size="large" />
                   </div>
                   <p className="text-sm max-w-xs text-gray-500">
                     Get real-time stats, rankings, and match results for {player?.fullName}
                   </p>
                   <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {[
                        "Results in 2025?",
                        "Current ranking?",
                        "Performance on clay?"
                      ].map(q => (
                        <button 
                          key={q}
                          onClick={() => setAiQuestion(q)}
                          className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors text-gray-600 font-medium shadow-sm"
                        >
                          {q}
                        </button>
                      ))}
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            {!aiAnswer && (
              <form 
                onSubmit={handleAskAi}
                className="p-4 bg-white border-t flex gap-2"
              >
                <Input 
                  placeholder="Ask about stats, rankings, results..." 
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  disabled={isAiLoading}
                  className="focus-visible:ring-purple-500"
                />
                <Button 
                  type="submit"
                  disabled={!aiQuestion.trim() || isAiLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}