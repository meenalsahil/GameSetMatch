import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Footer from "@/components/Footer";
import { MapPin, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Player } from "@shared/schema";

interface PlayerProfileProps {
  params: {
    id: string;
  };
}

export default function PlayerProfile({ params }: PlayerProfileProps) {
  const { data: player, isLoading } = useQuery<Player>({
    queryKey: ["/api/players", params.id],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading player profile...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Player Not Found</h1>
          <p className="text-muted-foreground">The player you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const ranking = player.ranking ? parseInt(player.ranking, 10) : null;

  return (
    <div className="min-h-screen">
      <div className="relative bg-gradient-to-b from-primary/20 to-background py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-32 w-32">
              <AvatarImage src={player.photoUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">{player.fullName}</h1>
                {ranking && (
                  <Badge className="bg-primary text-primary-foreground">Rank #{ranking}</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{player.location}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                <span className="font-medium">Specialization:</span> {player.specialization}
              </div>
              <Button size="lg" data-testid="button-sponsor-player" disabled>
                Sponsor Player (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {player.bio}
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">Sponsorship Opportunities</h2>
            <p className="text-muted-foreground">
              Sponsorship features will be available soon. Stay tuned for updates on how you can support this player's tennis journey.
            </p>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
