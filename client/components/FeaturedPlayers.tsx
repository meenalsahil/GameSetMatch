import PlayerCard from "./PlayerCard";

const players = [
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

export default function FeaturedPlayers() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Featured Players
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Support tennis players competing at ATP, Challenger, and ITF levels
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
