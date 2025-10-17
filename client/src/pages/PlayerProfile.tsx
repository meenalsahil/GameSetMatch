import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SponsorshipNeedCard from "@/components/SponsorshipNeedCard";
import Footer from "@/components/Footer";
import { MapPin, Trophy, Calendar, Plane, Shirt, DollarSign, Hotel } from "lucide-react";
import playerImage from "@assets/generated_images/Female_tennis_player_portrait_60ebf680.png";

const tournaments = [
  { date: "Mar 2025", event: "ATP Challenger Barcelona", result: "Semifinal" },
  { date: "Feb 2025", event: "ITF Women's Circuit Madrid", result: "Winner" },
  { date: "Jan 2025", event: "ATP Challenger Valencia", result: "Quarterfinal" },
];

const upcomingEvents = [
  { date: "Apr 15-21, 2025", event: "French Open Qualifiers", location: "Paris, France" },
  { date: "May 5-12, 2025", event: "ATP Challenger Rome", location: "Rome, Italy" },
];

const sponsorshipNeeds = [
  {
    icon: Plane,
    title: "Tournament Travel",
    description: "Support travel costs for ATP Challenger events across Europe",
    amount: 2500,
    type: "one-time" as const,
  },
  {
    icon: Hotel,
    title: "Accommodation",
    description: "Hotel stays during tournament weeks",
    amount: 1200,
    type: "one-time" as const,
  },
  {
    icon: Shirt,
    title: "Training Gear",
    description: "Professional equipment and apparel for training and competition",
    amount: 800,
    type: "one-time" as const,
  },
  {
    icon: DollarSign,
    title: "Monthly Stipend",
    description: "Ongoing support for training, nutrition, and recovery",
    amount: 1500,
    type: "monthly" as const,
  },
];

export default function PlayerProfile() {
  return (
    <div className="min-h-screen">
      <div className="relative h-96 bg-gradient-to-b from-primary/20 to-background">
        <div className="container mx-auto px-6 h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <img
              src={playerImage}
              alt="Sarah Martinez"
              className="w-48 h-48 rounded-md object-cover border-4 border-background shadow-lg"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">Sarah Martinez</h1>
                <Badge className="bg-primary text-primary-foreground">Rank #234</Badge>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Barcelona, Spain</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>12 Recent Wins</span>
                </div>
              </div>
              <Button size="lg" data-testid="button-sponsor-player">
                Sponsor Sarah
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">
                Professional tennis player specializing in clay court competitions. Currently competing
                in ATP Challenger and ITF circuits across Europe. My goal is to break into the top 150
                rankings and qualify for Grand Slam events. With your support, I can focus on training
                and competing at the highest level.
              </p>
            </Card>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Sponsorship Needs</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {sponsorshipNeeds.map((need, index) => (
                  <SponsorshipNeedCard key={index} {...need} />
                ))}
              </div>
            </div>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">Recent Results</h2>
              <div className="space-y-3">
                {tournaments.map((tournament, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-card-foreground">{tournament.event}</p>
                      <p className="text-sm text-muted-foreground">{tournament.date}</p>
                    </div>
                    <Badge variant="secondary">{tournament.result}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-card-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Events
              </h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="pb-4 border-b last:border-b-0">
                    <p className="font-semibold text-card-foreground mb-1">{event.event}</p>
                    <p className="text-sm text-muted-foreground mb-1">{event.date}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
