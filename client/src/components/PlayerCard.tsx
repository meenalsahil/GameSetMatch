import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, TrendingUp } from "lucide-react";

interface PlayerCardProps {
  id: string;
  name: string;
  location: string;
  ranking: number;
  image: string;
  fundsRaised: number;
  fundingGoal: number;
  recentWins: number;
  specialization: string;
}

export default function PlayerCard({
  name,
  location,
  ranking,
  image,
  fundsRaised,
  fundingGoal,
  recentWins,
  specialization,
  id,
}: PlayerCardProps) {
  const progressPercent = (fundsRaised / fundingGoal) * 100;

  return (
    <Card className="overflow-hidden hover-elevate transition-all" data-testid={`card-player-${id}`}>
      <div className="relative h-64">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <Badge className="mb-2 bg-primary/90 text-primary-foreground">
            Rank #{ranking}
          </Badge>
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <div className="flex items-center gap-1 text-white/90 text-sm mt-1">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            {recentWins} recent wins • {specialization}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Funding Progress</span>
            <span className="font-semibold text-foreground">
              ${fundsRaised.toLocaleString()} / ${fundingGoal.toLocaleString()}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" data-testid={`progress-player-${id}`} />
        </div>

        <Button className="w-full" data-testid={`button-sponsor-${id}`}>
          Sponsor {name.split(' ')[0]}
        </Button>
      </div>
    </Card>
  );
}
