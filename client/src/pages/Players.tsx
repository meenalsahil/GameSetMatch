import { useState } from "react";
import PlayerCard from "@/components/PlayerCard";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import femalePlayer1 from "@assets/generated_images/Female_tennis_player_portrait_60ebf680.png";
import malePlayer1 from "@assets/generated_images/Male_tennis_player_portrait_057ee5cf.png";
import femalePlayer2 from "@assets/generated_images/Female_player_forehand_action_1763c141.png";
import malePlayer2 from "@assets/generated_images/Male_player_backhand_action_78dc1f59.png";

const allPlayers = [
  {
    id: "1",
    name: "Sarah Martinez",
    location: "Barcelona, Spain",
    ranking: 234,
    image: femalePlayer1,
    fundsRaised: 8500,
    fundingGoal: 15000,
    recentWins: 12,
    specialization: "Clay Court",
  },
  {
    id: "2",
    name: "James Chen",
    location: "Singapore",
    ranking: 187,
    image: malePlayer1,
    fundsRaised: 12000,
    fundingGoal: 20000,
    recentWins: 8,
    specialization: "Hard Court",
  },
  {
    id: "3",
    name: "Emma Thompson",
    location: "London, UK",
    ranking: 156,
    image: femalePlayer2,
    fundsRaised: 18000,
    fundingGoal: 25000,
    recentWins: 15,
    specialization: "Grass Court",
  },
  {
    id: "4",
    name: "Diego Rodriguez",
    location: "Buenos Aires, Argentina",
    ranking: 298,
    image: malePlayer2,
    fundsRaised: 5400,
    fundingGoal: 12000,
    recentWins: 6,
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
              Discover talented tennis players seeking sponsorship support
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
