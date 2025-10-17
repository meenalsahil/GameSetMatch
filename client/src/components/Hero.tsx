import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/Tennis_player_serving_action_e3629af9.png";
import { ArrowRight, Users, Trophy } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Empower Tomorrow's Tennis Champions
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
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
              className="text-lg h-12 px-8 backdrop-blur-md bg-white/10 hover:bg-white/20 border-white/30 text-white"
              data-testid="button-sponsor-signup"
            >
              Become a Sponsor
            </Button>
          </div>

          <div className="flex items-center justify-center gap-12 pt-8 text-white">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">500+ Athletes</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              <span className="text-sm font-medium">$2M+ Raised</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
