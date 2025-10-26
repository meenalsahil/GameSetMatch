import { Card } from "@/components/ui/card";
import { UserPlus, FileText, DollarSign } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Profile",
    description: "Players sign up and create their professional profile showcasing results and upcoming events.",
  },
  {
    icon: FileText,
    title: "List Needs",
    description: "Specify sponsorship needs - travel, gear, training, or monthly stipend support.",
  },
  {
    icon: DollarSign,
    title: "Get Sponsored",
    description: "Sponsors discover your profile and contribute to help you achieve your tennis goals.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to connect talented players with supportive sponsors
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index} 
                className="p-8 text-center hover-elevate transition-all"
                data-testid={`card-step-${index + 1}`}
              >
                <div className="mb-6 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
