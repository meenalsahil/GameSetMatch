import { Check, Globe, Target, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: Check,
    title: "Create Your Profile for Free",
    description: "No upfront cost to join. Build your profile and showcase your tennis journey.",
  },
  {
    icon: Globe,
    title: "Reach a Global Audience",
    description: "Connect with supporters and sponsors from all over the world.",
  },
  {
    icon: Target,
    title: "Set Your Own Funding Goals",
    description: "Raise money for travel, coaching, equipment, tournaments, and more.",
  },
  {
    icon: Users,
    title: "Be a Launch Player",
    description: "Sign up now to be one of our first featured players at launch!",
  },
];

export default function PlayerBenefits() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Join GameSetMatch?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to connect with sponsors and fuel your tennis career
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-6 text-center hover-elevate">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <benefit.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground">
                {benefit.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
