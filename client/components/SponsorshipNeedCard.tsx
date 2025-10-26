import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface SponsorshipNeedCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  amount: number;
  type: "one-time" | "monthly";
}

export default function SponsorshipNeedCard({
  icon: Icon,
  title,
  description,
  amount,
  type,
}: SponsorshipNeedCardProps) {
  return (
    <Card className="p-6 hover-elevate transition-all" data-testid={`card-sponsorship-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-card-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">
                ${amount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {type === "monthly" ? "per month" : "one-time"}
              </p>
            </div>
            <Button size="sm" data-testid={`button-contribute-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              Contribute
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
