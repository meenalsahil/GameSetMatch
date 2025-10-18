import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import { UserPlus, FileText, TrendingUp, Users, DollarSign, Shield } from "lucide-react";
import { Link } from "wouter";

const playerSteps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your player profile in minutes. It's free to get started with a 3-month trial.",
  },
  {
    icon: FileText,
    title: "Build Your Profile",
    description: "Showcase your tournament results, upcoming events, and sponsorship needs.",
  },
  {
    icon: TrendingUp,
    title: "Get Sponsored",
    description: "Connect with sponsors who want to support your tennis journey with travel, gear, and stipends.",
  },
];

const sponsorSteps = [
  {
    icon: Users,
    title: "Browse Players",
    description: "Discover tennis players at all competitive levels who need your support. No signup required to browse.",
  },
  {
    icon: DollarSign,
    title: "Choose a Player",
    description: "Review player profiles, tournament schedules, and sponsorship needs to find the right fit.",
  },
  {
    icon: Shield,
    title: "Make an Impact",
    description: "Contribute with travel support, gear, or stipends. Help players compete and achieve their goals.",
  },
];

const faqs = [
  {
    question: "Who can join as a player?",
    answer: "Any tennis player competing at ATP, Challenger, or ITF levels can create a profile. The platform supports players at all stages of their professional journey.",
  },
  {
    question: "How much does it cost for players?",
    answer: "Players get a 3-month free trial. After that, a subscription fee applies to maintain your active profile and connect with sponsors.",
  },
  {
    question: "What types of sponsorship are available?",
    answer: "Sponsors can contribute travel funds, hotel accommodations (using points), training gear, tournament entry fees, or monthly stipends to support ongoing expenses.",
  },
  {
    question: "Do sponsors need to sign up?",
    answer: "No signup is required to browse player profiles. When you're ready to sponsor a player, you'll be guided through a simple process to make your contribution.",
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes, all payments are processed securely through Stripe, a leading payment processor. We never store your payment details on our servers.",
  },
  {
    question: "Can I sponsor multiple players?",
    answer: "Absolutely! You can support as many players as you'd like and choose different types of support for each one.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              How It Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              GameSetMatch connects tennis players at all levels with sponsors who want to support their journey.
              Here's how our platform works for both players and sponsors.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16">
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-foreground text-center mb-4">
              For Players
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Get the support you need to compete at ATP, Challenger, and ITF tournaments
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {playerSteps.map((step, index) => (
                <Card key={index} className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-3">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button asChild size="lg" data-testid="button-player-signup-how-it-works">
                <Link href="/signup/player">
                  Sign Up as a Player
                </Link>
              </Button>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-4xl font-bold text-foreground text-center mb-4">
              For Sponsors
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Support tennis players with travel, gear, and training expenses
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {sponsorSteps.map((step, index) => (
                <Card key={index} className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                    <step.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-3">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button asChild size="lg" variant="outline" data-testid="button-browse-players-how-it-works">
                <Link href="/players">
                  Browse Players to Sponsor
                </Link>
              </Button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground text-center mb-12">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
