import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Trophy, Heart, ExternalLink, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function PlayerProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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

  const handleSponsor = () => {
    toast({
      title: "Sponsor Interest",
      description: "Thank you for your interest! We'll contact you shortly.",
    });
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

        {/* Player Header with Sponsor Button */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
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
                    <Trophy className="h-4 w-4" /> Rank #{player.ranking || "N/A"}
                  </span>
                </div>
              </div>
              <Button onClick={handleSponsor} className="ml-4">
                <Heart className="h-4 w-4 mr-2" />
                Become a Sponsor
              </Button>
            </div>
            
            {player.atpProfileUrl && (
              <a
                href={player.atpProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm mt-3 inline-flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                View ATP Profile
              </a>
            )}
          </CardHeader>
        </Card>

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
                <p className="text-sm text-muted-foreground mb-1">Specialization</p>
                <p className="text-lg font-semibold">{player.specialization}</p>
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
                  {player.story || "No story provided yet."}
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

              <div>
                <h3 className="font-semibold text-xl mb-2 flex items-center gap-2">
                  ℹ️ About
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {player.bio || "No bio available."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Support {player.fullName}'s Journey</h3>
            <p className="mb-4 text-green-50">Help talented players reach their full potential</p>
            <Button onClick={handleSponsor} variant="secondary" size="lg">
              <Heart className="h-5 w-5 mr-2" />
              Become a Sponsor Today
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}