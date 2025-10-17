import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-background to-primary/10">
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Empower Tomorrow's Tennis Champions
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Connect with sponsors to fund your tennis journey. Get support for travel, gear, and training.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              variant="default"
              className="text-lg h-12 px-8"
              data-testid="button-player-signup"
            >
              I'm a Player
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg h-12 px-8"
              data-testid="button-sponsor-signup"
            >
              Become a Sponsor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
