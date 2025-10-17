import PlayerCard from "../PlayerCard";
import playerImage from "@assets/generated_images/Female_tennis_player_portrait_60ebf680.png";

export default function PlayerCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <PlayerCard
        id="demo"
        name="Sarah Martinez"
        location="Barcelona, Spain"
        ranking={234}
        image={playerImage}
        fundsRaised={8500}
        fundingGoal={15000}
        recentWins={12}
        specialization="Clay Court"
      />
    </div>
  );
}
