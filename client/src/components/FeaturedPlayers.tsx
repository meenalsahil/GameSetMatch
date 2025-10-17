import PlayerCard from "./PlayerCard";
import femalePlayer1 from "@assets/generated_images/Female_tennis_player_portrait_60ebf680.png";
import malePlayer1 from "@assets/generated_images/Male_tennis_player_portrait_057ee5cf.png";
import femalePlayer2 from "@assets/generated_images/Female_player_forehand_action_1763c141.png";
import malePlayer2 from "@assets/generated_images/Male_player_backhand_action_78dc1f59.png";

const players = [
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

export default function FeaturedPlayers() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Featured Athletes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Support rising stars on their journey to professional tennis
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {players.map((player) => (
            <PlayerCard key={player.id} {...player} />
          ))}
        </div>
      </div>
    </section>
  );
}
