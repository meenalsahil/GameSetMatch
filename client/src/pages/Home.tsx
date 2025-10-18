import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import PlayerBenefits from "@/components/PlayerBenefits";
import PricingTiers from "@/components/PricingTiers";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <PlayerBenefits />
      <HowItWorks />
      <PricingTiers />
      <Footer />
    </div>
  );
}
