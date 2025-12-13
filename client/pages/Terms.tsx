import { useEffect } from "react";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-500 mb-8">Last Updated: December 13, 2025</p>

          <div className="prose prose-slate max-w-none">
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing or using GameSetMatch, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
            </p>

            <h3>2. Platform Role</h3>
            <p>
              GameSetMatch is a venue that connects tennis players with potential sponsors. We are not a broker, financial institution, or creditor. We do not guarantee that any player will receive funding or that any sponsor will receive specific returns.
            </p>

            <h3>3. User Responsibilities</h3>
            <ul>
              <li><strong>Players:</strong> You agree that all information provided in your profile (Ranking, Age, Identity) is accurate and truthful. Misrepresentation may result in immediate account termination.</li>
              <li><strong>Sponsors:</strong> You understand that sponsorships are voluntary contributions to support an athlete's career.</li>
            </ul>

            <h3>4. Payments and Fees</h3>
            <p>
              All financial transactions are processed securely via Stripe. GameSetMatch may deduct a platform fee from sponsorships to cover operational costs. All contributions are final and non-refundable unless otherwise required by law.
            </p>

            <h3>5. User Conduct</h3>
            <p>
              You agree not to use the platform for any unlawful purpose, harassment, or fraud. We reserve the right to ban any user who violates these guidelines.
            </p>

            <h3>6. Limitation of Liability</h3>
            <p>
              GameSetMatch shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the service or any interactions with other users.
            </p>

            <h3>7. Changes to Terms</h3>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the platform constitutes acceptance of the new terms.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}