import { useState } from "react";
import PlayerCard from "@/components/PlayerCard";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

const allPlayers = [
  {
    id: "1",
    name: "Player A",
    location: "Barcelona, Spain",
    ranking: 234,
    specialization: "Clay Court",
  },
  {
    id: "2",
    name: "Player B",
    location: "Singapore",
    ranking: 187,
    specialization: "Hard Court",
  },
  {
    id: "3",
    name: "Player C",
    location: "London, UK",
    ranking: 156,
    specialization: "Grass Court",
  },
  {
    id: "4",
    name: "Player D",
    location: "Buenos Aires, Argentina",
    ranking: 298,
    specialization: "All Surface",
  },
];

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="bg-muted/30 py-16">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Browse Players
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover tennis players at all levels seeking sponsorship support
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or specialization..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-players"
              />
            </div>
            <Button variant="outline" data-testid="button-filters">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allPlayers.map((player) => (
              <PlayerCard key={player.id} {...player} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
