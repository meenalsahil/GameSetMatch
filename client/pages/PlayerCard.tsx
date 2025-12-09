// client/src/components/PlayerCard.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trophy, CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface PlayerCardProps {
  id: number;
  name: string;
  location?: string;
  country?: string;
  ranking?: number | string | null;
  specialization?: string;
  photoUrl?: string | null;
  atpProfileUrl?: string | null;
  atpVerified?: boolean;
  atpVerificationScore?: number | null;
}

function countryToFlag(country?: string): string {
  if (!country) return "🌍";
  const c = country.trim().toLowerCase();

  const map: Record<string, string> = {
    canada: "🇨🇦",
    "united states": "🇺🇸",
    usa: "🇺🇸",
    spain: "🇪🇸",
    france: "🇫🇷",
    italy: "🇮🇹",
    germany: "🇩🇪",
    australia: "🇦🇺",
    "united kingdom": "🇬🇧",
    uk: "🇬🇧",
    india: "🇮🇳",
    argentina: "🇦🇷",
    brazil: "🇧🇷",
    chile: "🇨🇱",
    serbia: "🇷🇸",
    croatia: "🇭🇷",
    greece: "🇬🇷",
    china: "🇨🇳",
    japan: "🇯🇵",
  };

  for (const [name, flag] of Object.entries(map)) {
    if (c.includes(name)) return flag;
  }

  return "🎾";
}

function VerifiedBadge({
  atpProfileUrl,
  atpVerified,
  atpVerificationScore,
}: {
  atpProfileUrl?: string | null;
  atpVerified?: boolean;
  atpVerificationScore?: number | null;
}) {
  if (!atpProfileUrl) {
    return (
      <Badge variant="outline" className="text-xs">
        Unverified profile
      </Badge>
    );
  }

  const score = atpVerificationScore ?? 0;
  const strong = atpVerified || score >= 75;

  return (
    <Badge
      className={`text-xs gap-1 ${
        strong
          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
          : "bg-amber-100 text-amber-800 border-amber-300"
      }`}
    >
      <CheckCircle2 className="h-3 w-3" />
      {strong ? "Verified profile" : "Profile needs review"}
    </Badge>
  );
}

export default function PlayerCard(props: PlayerCardProps) {
  const flag = countryToFlag(props.country);
  const displayRank =
    props.ranking !== null && props.ranking !== undefined
      ? `#${props.ranking}`
      : "N/A";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-border/70">
      <div className="flex flex-col h-full">
        {/* Photo / header */}
        <div className="relative h-40 bg-gradient-to-br from-emerald-600 to-green-700">
          {props.photoUrl ? (
            <img
              src={props.photoUrl}
              alt={props.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-emerald-100">
              {props.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="absolute top-3 left-3 flex items-center gap-2 text-xs bg-black/50 text-white px-2 py-1 rounded-full">
            <span>{flag}</span>
            <span className="truncate max-w-[120px]">
              {props.country || "Global"}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <VerifiedBadge
              atpProfileUrl={props.atpProfileUrl}
              atpVerified={props.atpVerified}
              atpVerificationScore={props.atpVerificationScore}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col gap-3">
          <div>
            <h3 className="font-semibold text-lg leading-snug mb-1">
              {props.name}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {props.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {props.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Rank {displayRank}
              </span>
            </div>
          </div>

          {props.specialization && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Specialization: </span>
              {props.specialization}
            </div>
          )}

          {props.atpProfileUrl && (
            <a
              href={props.atpProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View official tour profile
            </a>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 pt-0 flex justify-between items-center">
          <Button
            asChild
            variant="outline"
            size="sm"
            data-testid="button-view-profile"
          >
            <Link href={`/players/${props.id}`}>View Profile</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
