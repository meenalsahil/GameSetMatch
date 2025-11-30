import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Trophy } from "lucide-react";
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
      <div className="container mx-auto px-6">
        {/* Back button */}
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => setLocation("/players")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Browse Players
        </Button>

        {/* Player Header */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              {player.fullName}
            </CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
  <MapPin className="h-4 w-4" /> {player.location} •{" "}
  <Trophy className="h-4 w-4" /> Rank #{player.ranking || "N/A"}
</p>
{player.atpProfileUrl && (
  
    href={player.atpProfileUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
  >
    View ATP Profile →
  </a>
)}
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground mb-4">
              Specialization:{" "}
              <span className="font-medium">{player.specialization}</span>
            </p>

            {/* New fields */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-xl mb-1">Your Story</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {player.story || "No story provided yet."}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-xl mb-1">
                  What are you raising funds for?
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {player.fundraisingReason ||
                    "No fundraising details provided."}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-xl mb-1">About</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {player.bio || "No bio available."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
