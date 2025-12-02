import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      question: "Who can join as a player?",
      answer:
        "Any tennis player competing at ATP, Challenger, ITF, or college level can join. Players must be at least 13 years old and actively competing in tournaments.",
    },
    {
      question: "How much does it cost for players?",
      answer:
        "It's completely FREE for players to create a profile and connect with sponsors. We don't charge any membership fees or take a percentage of sponsorships.",
    },
    {
      question: "What types of sponsorship are available?",
      answer:
        "Sponsors can provide travel expenses, equipment (rackets, strings, shoes), monthly training stipends, tournament entry fees, or one-time contributions for specific needs.",
    },
    {
      question: "Do sponsors need to sign up?",
      answer:
        "No, sponsors can browse player profiles without creating an account. However, signing up allows sponsors to manage multiple sponsorships and receive updates from players.",
    },
    {
      question: "How do you make sure player profiles are genuine?",
      answer:
        "Every player must provide a verification video link and an official ATP/ITF/WTA (or equivalent) profile URL when they apply. Profiles are reviewed before being published, and only approved players appear to sponsors. We also monitor reports and can remove profiles that don’t meet our standards, but we still encourage sponsors to use their own judgment when deciding who to support.",
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Yes, all payments are processed through Stripe, a secure payment platform used by millions of businesses worldwide. We never store your payment details on our servers.",
    },
    {
      question: "Can I sponsor multiple players?",
      answer:
        "Absolutely! You can sponsor as many players as you'd like. Many sponsors support multiple athletes at different competitive levels.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container mx-auto px-6">
            <Button asChild variant="ghost" size="sm" className="mb-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about GameSetMatch.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openIndex === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-muted/20 border-t">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center p-8 bg-primary/5 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              We're here to help! Contact our support team.
            </p>
            <Button asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
