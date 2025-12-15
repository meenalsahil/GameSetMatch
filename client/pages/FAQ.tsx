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
        "It's completely FREE for players to create a profile and connect with supporters. We don't charge any membership fees or take a percentage of support contributions.",
    },
    {
      question: "How does GameSetMatch sustain itself?",
      answer:
        "Our primary mission is to support the tennis community and help players succeed by removing financial barriers. To keep the platform running, cover operational costs (such as server maintenance, payment processing security, and development), and continue improving the service for everyone, we deduct a small 7% platform fee from funds received from sponsors. This allows us to maintain a high-quality, secure environment without charging upfront membership fees to players.",
    },
    {
      question: "What types of support are available?",
      answer:
        "Supporters can provide travel expenses, equipment (rackets, strings, shoes), monthly training stipends, tournament entry fees, or one-time contributions for specific needs.",
    },
    {
      question: "How much should I contribute as a supporter?",
      answer:
        "There's no minimum contribution amount—every bit of support makes a real difference. Whether it's $50 for strings, $200 for tournament entry fees, or $1,000 for travel expenses, you can contribute whatever feels right for you. The beauty of our platform is that it allows supporters of all backgrounds to make an impact at a level that's comfortable and meaningful to them. Even smaller contributions add up and help players pursue their dreams.",
    },
    {
      question: "What do I get in return for supporting a player?",
      answer:
        "As a supporter, you become part of a player's journey in one of the world's most demanding and expensive sports. Tennis players often need $50,000-$150,000 annually to compete at the professional level, and your support directly helps them access training, tournaments, and coaching that can make or break their career. You'll have the satisfaction of knowing you're investing in someone's future and potentially helping launch the next tennis star. Players will share their progress, tournament results, and success stories with you—and soon, these testimonials will be featured on our platform to inspire others and showcase the real impact of your support. It's more than a transaction; it's about being part of their story.",
    },
    {
      question: "Do supporters need to sign up?",
      answer:
        "No, supporters can browse player profiles without creating an account. However, signing up allows supporters to manage multiple players they support and receive updates from players.",
    },
    {
      question: "How do you make sure player profiles are genuine?",
      answer:
        "Every player must provide a verification video link and an official ATP/ITF/WTA (or equivalent) profile URL when they apply. Profiles are reviewed before being published, and only approved players appear to supporters. We also monitor reports and can remove profiles that don't meet our standards, but we still encourage supporters to use their own judgment when deciding who to support.",
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Yes, all payments are processed through Stripe, a secure payment platform used by millions of businesses worldwide. We never store your payment details on our servers.",
    },
    {
      question: "Can I support multiple players?",
      answer:
        "Absolutely! You can support as many players as you'd like. Many supporters back multiple athletes at different competitive levels.",
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
              We&apos;re here to help! Contact our support team.
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
