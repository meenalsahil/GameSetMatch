import PlayerCard from "../PlayerCard";

export default function PlayerCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <PlayerCard
        id="demo"
        name="Player A"
        location="Barcelona, Spain"
        ranking={234}
        specialization="Clay Court"
      />
    </div>
  );
}
