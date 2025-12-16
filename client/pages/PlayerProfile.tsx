import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Ensure you have this component
import {
  ArrowLeft,
  MapPin,
  Trophy,
  Heart,
  ExternalLink,
  Globe,
  Sparkles,  // New
  X,         // New
  Loader2,   // New
  ArrowUp    // New
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function PlayerProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Force scroll to top when the page loads or ID changes
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

  // --- STATE: Sponsor Modal ---
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // --- STATE: AI Analyst (NEW) ---
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{used: boolean, date: string} | null>(null);

  // --- FUNCTION: Open Sponsor Modal ---
  const handleSupportClick = () => {
    if (!player) {
      toast({
        title: "Support Interest",
        description: "Thanks for your interest in supporting this player! We'll contact you shortly.",
      });
      return;
    }
    // Open the modal instead of going directly to Stripe
    setIsSponsorModalOpen(true);
  };

  // --- FUNCTION: Stripe Redirect ---
  const proceedToStripe = async () => {
    if (!termsAccepted) return;
    setIsSponsorModalOpen(false); // Close modal

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

  // --- FUNCTION: Ask AI (NEW) ---
  const handleAskAi = async () => {
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
      toast({ title: "Error", description: "Could not fetch answer", variant: "destructive" });
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

        {/* Player Header with Support Button */}
        <Card className="mb-8">
          <CardHeader>
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
              
              <div className="flex items-center gap-2">
                <Button onClick={handleSupportClick}>
                  <Heart className="h-4 w-4 mr-2" />
                  Support this Player
                </Button>

                {/* AI BUTTON (NEW) */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="border-purple-200 hover:bg-purple-50 text-purple-600 relative group"
                  onClick={() => setIsAiChatOpen(true)}
                  title="Ask AI Analyst"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                  </span>
                </Button>
              </div>
            </div>

            {player.atpProfileUrl && (
              <a
                href={player.atpProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm mt-3 inline-flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                View ATP / ITF / WTA Profile
              </a>
            )}
          </CardHeader>
        </Card>

        {/* Video Section */}
        {hasVideo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Verification / Intro Video</CardTitle>
            </CardHeader>
            <CardContent>
              {isLocalVideo ? (
                <video
                  controls
                  className="w-full max-w-xl rounded-lg border bg-black"
                >
                  <source src={player.videoUrl} />
                  Your browser does not support the video tag.
                </video>
              ) : isYouTube ? (
                <div className="aspect-video w-full max-w-xl rounded-lg overflow-hidden border">
                  <iframe
                    src={player.videoUrl.replace("watch?v=", "embed/")}
                    title="Player Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={player.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Watch video <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Player Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Player Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Ranking</p>
                <p className="text-2xl font-bold">#{player.ranking || "N/A"}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Age</p>
                <p className="text-2xl font-bold">{player.age || "N/A"}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  Specialization
                </p>
                <p className="text-lg font-semibold">
                  {player.specialization || "N/A"}
                </p>
              </div>
            </div>
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

      {/* --- MODAL 2: AI Analyst Chat --- */}
      {isAiChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-200" />
                <h3 className="font-bold">AI Performance Analyst</h3>
              </div>
              <button onClick={() => setIsAiChatOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
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
                       Data from: {cacheInfo.date} • {cacheInfo.used ? "⚡ Cached (0 API Calls)" : "🌍 Fresh from ATP API"}
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
                   <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                     <Sparkles className="h-7 w-7 text-purple-500" />
                   </div>
                   <p className="text-sm">
                     I have access to {player?.fullName}'s official match records. <br/>
                     Ask me about their recent performance!
                   </p>
                   <div className="flex flex-wrap gap-2 justify-center">
                      {["Win rate this year?", "Last 5 tournaments?", "Performance on Clay?"].map(q => (
                        <button 
                          key={q}
                          onClick={() => setAiQuestion(q)}
                          className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full hover:border-purple-300 hover:bg-purple-50 transition-colors text-gray-600"
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
              <div className="p-4 bg-white border-t flex gap-2">
                <Input 
                  placeholder="Ask a question..." 
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isAiLoading && handleAskAi()}
                  disabled={isAiLoading}
                  className="focus-visible:ring-purple-500"
                />
                <Button 
                  onClick={handleAskAi} 
                  disabled={!aiQuestion.trim() || isAiLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}