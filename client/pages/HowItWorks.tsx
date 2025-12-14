import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import {
  UserPlus,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  HelpCircle, // Added Icon
} from "lucide-react";
import { Link } from "wouter";

const playerSteps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description:
      "Create your player profile in minutes. It's free to get started with a 3-month trial.",
  },
  {
    icon: FileText,
    title: "Build Your Profile",
    description:
      "Share your story, funding goals, and upload a short verification video plus your ATP/ITF/WTA profile link so supporters know you're genuine.",
  },
  {
    icon: TrendingUp,
    title: "Get Support",
    description:
      "Once approved, your profile appears to supporters who are looking for verified players to help with travel, gear, and monthly stipends.",
  },
];

const sponsorSteps = [
  {
    icon: Users,
    title: "Browse Players",
    description:
      "Discover tennis players at all competitive levels. Each profile includes a verification video and an official ATP/ITF/WTA (or equivalent) profile link.",
  },
  {
    icon: DollarSign,
    title: "Choose a Player",
    description:
      "Review verified profiles, watch their video, check tournament history, and see exactly what support they need to find the right fit.",
  },
  {
    icon: Shield,
    title: "Make an Impact",
    description:
      "Contribute travel support, gear, or stipends. Every player profile is reviewed before being published to help ensure genuine athletes.",
  },
];

const faqs = [
  {
    question: "Who can join as a player?",
    answer:
      "Any tennis player competing at ATP, WTA, Challenger, or ITF levels can create a profile. The platform supports players at all stages of their professional journey.",
  },
  {
    question: "How much does it cost for players?",
    answer:
      "Players get a 3-month free trial. After that, a subscription fee applies to maintain your active profile and connect with supporters.",
  },
  {
    question: "What types of support are available?",
    answer:
      "Supporters can contribute travel funds, hotel accommodations (using points), training gear, tournament entry fees, or monthly stipends to support ongoing expenses.",
  },
  {
    question: "Do supporters need to sign up?",
    answer:
      "No signup is required to browse player profiles. When you're ready to support a player, you'll be guided through a simple process to make your contribution.",
  },
  {
    question: "How do you make sure player profiles are genuine?",
    answer:
      "Every player must provide a verification video link and an official ATP/ITF/WTA (or equivalent) profile URL when they apply. Profiles are reviewed before being published, and only approved players appear to supporters. We also monitor reports and can remove profiles that don’t meet our standards.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes, all payments are processed securely through Stripe, a leading payment processor. We never store your payment details on our servers.",
  },
  {
    question: "Can I support multiple players?",
    answer:
      "Absolutely! You can support as many players as you'd like and choose different types of support for each one.",
  },
];

// Reusable Help Card Component
function HelpCard() {
  return (
    <Card className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary/50 transition-all">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-6">
        <HelpCircle className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="text-2xl font-bold text-card-foreground mb-3">
        Have Questions?
      </h3>
      <p className="text-muted-foreground mb-6 text-sm">
        Not sure where to start? Check our FAQ or get in touch with our team.
      </p>
      <div className="flex flex-col gap-3">
        <Button asChild variant="outline" className="w-full bg-white">
          <Link href="/faq">Read FAQ</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full text-primary hover:text-primary/80">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </Card>
  );
}

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
              GameSetMatch connects tennis players at all levels with supporters
              who want to back their journey. Here&apos;s how our platform works
              for both players and supporters.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16">
          {/* For Players */}
          <div id="for-players" className="mb-20">
            <h2 className="text-4xl font-bold text-foreground text-center mb-4">
              For Players
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Get the support you need to compete at ATP, Challenger, and ITF
              tournaments.
            </p>
            
            {/* UPDATED GRID LAYOUT: 1 col mobile, 2 col tablet, 4 col desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {playerSteps.map((step, index) => (
                <Card key={index} className="p-8 text-center h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-3">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
              ))}
              
              {/* 4th Card: Help */}
              <HelpCard />
            </div>

            <div className="text-center">
              <Button
                asChild
                size="lg"
                data-testid="button-player-signup-how-it-works"
              >
                <Link href="/signup/player">Sign Up as a Player</Link>
              </Button>
            </div>
          </div>

          {/* For Supporters */}
          <div id="for-sponsors" className="mb-20">
            <h2 className="text-4xl font-bold text-foreground text-center mb-4">
              For Supporters
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Support tennis players with travel, gear, and training expenses,
              with additional safeguards to help you feel confident in who
              you&apos;re supporting.
            </p>
            
            {/* UPDATED GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {sponsorSteps.map((step, index) => (
                <Card key={index} className="p-8 text-center h-full">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                    <step.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-3">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
              ))}

              {/* 4th Card: Help */}
              <HelpCard />
            </div>

            <div className="text-center">
              <Button
                asChild
                size="lg"
                variant="outline"
                data-testid="button-browse-players-how-it-works"
              >
                <Link href="/players">Browse Players to Support</Link>
              </Button>
            </div>
          </div>

          {/* FAQ */}
          <div id="faq" className="max-w-3xl mx-auto">
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