import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Trophy, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

interface PlayerCardProps {
  id: string;
  name: string;
  location: string;
  country?: string;
  ranking?: string;
  specialization: string;
  photoUrl?: string;
  atpProfileUrl?: string;
}

export default function PlayerCard({
  id,
  name,
  location,
  country,
  ranking,
  specialization,
  photoUrl,
  atpProfileUrl,
}: PlayerCardProps) {
  const [, setLocation] = useLocation();

  const initials = name
    ? name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : '??';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                {initials}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Trophy className="h-3 w-3" /> Rank #{ranking || "N/A"}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {location}
          </p>
          {country && (
            <p className="text-sm font-medium">
              🌍 {country}
            </p>
          )}
          <p className="text-sm">
            <span className="font-medium">Specialization:</span> {specialization}
          </p>
        </div>

        {atpProfileUrl && (
          <a
            href={atpProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-3"
          >
            <ExternalLink className="h-3 w-3" />
            View ATP Profile
          </a>
        )}

        <Button 
          className="w-full"
          onClick={() => setLocation(`/player/${id}`)}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
}