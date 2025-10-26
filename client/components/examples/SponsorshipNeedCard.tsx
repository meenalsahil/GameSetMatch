import SponsorshipNeedCard from "../SponsorshipNeedCard";
import { Plane } from "lucide-react";

export default function SponsorshipNeedCardExample() {
  return (
    <div className="p-8 max-w-lg">
      <SponsorshipNeedCard
        icon={Plane}
        title="Tournament Travel"
        description="Support travel costs for upcoming ATP Challenger events in Europe"
        amount={2500}
        type="one-time"
      />
    </div>
  );
}
