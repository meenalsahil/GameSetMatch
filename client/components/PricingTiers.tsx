import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    period: "3 months",
    description: "Perfect for getting started",
    features: [
      "Basic profile page",
      "List up to 3 sponsorship needs",
      "Basic analytics",
      "Community support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For serious competitors",
    features: [
      "Premium profile with gallery",
      "Unlimited sponsorship listings",
      "Advanced analytics & insights",
      "Priority sponsor matching",
      "Social media integration",
      "Dedicated support",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "$79",
    period: "per month",
    description: "Maximum visibility",
    features: [
      "Everything in Pro",
      "Featured placement on homepage",
      "Personal success manager",
      "Sponsorship proposal templates",
      "Video highlights gallery",
      "Media kit creation",
    ],
    cta: "Go Elite",
    highlighted: false,
  },
];

export default function PricingTiers() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Player Pricing Plans
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with 3 months free, then select the plan that fits your ambitions. Sponsors can browse players for free.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <Card
              key={index}
              className={`p-8 ${
                tier.highlighted
                  ? "border-primary border-2 shadow-lg scale-105"
                  : ""
              }`}
              data-testid={`card-pricing-${tier.name.toLowerCase()}`}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">
                  {tier.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {tier.description}
                </p>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-foreground">
                    {tier.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{tier.period}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-start gap-2 text-sm"
                  >
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={tier.highlighted ? "default" : "outline"}
                data-testid={`button-select-${tier.name.toLowerCase()}`}
              >
                {tier.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
