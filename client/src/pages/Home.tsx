import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import FeaturedPlayers from "@/components/FeaturedPlayers";
import PricingTiers from "@/components/PricingTiers";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <FeaturedPlayers />
      <PricingTiers />
      <Footer />
    </div>
  );
}
