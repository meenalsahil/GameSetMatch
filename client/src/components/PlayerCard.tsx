import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, User } from "lucide-react";
import { Link } from "wouter";

interface PlayerCardProps {
  id: string;
  name: string;
  location: string;
  ranking: number;
  specialization: string;
}

export default function PlayerCard({
  name,
  location,
  ranking,
  specialization,
  id,
}: PlayerCardProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="overflow-hidden hover-elevate transition-all" data-testid={`card-player-${id}`}>
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-card-foreground mb-1">{name}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Rank #{ranking}
              </Badge>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Specialization: {specialization}
        </div>

        <Link href={`/player/${id}`}>
          <Button className="w-full" data-testid={`button-sponsor-${id}`}>
            View Profile
          </Button>
        </Link>
      </div>
    </Card>
  );
}
