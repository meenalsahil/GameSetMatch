import { useEffect } from "react";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 mb-8">Last Updated: December 13, 2025</p>

          <div className="prose prose-slate max-w-none">
            <h3>1. Introduction</h3>
            <p>
              Welcome to GameSetMatch ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our services. This policy explains how we handle your personal information.
            </p>

            <h3>2. Information We Collect</h3>
            <p>We collect information directly from you when you register as a player or sponsor:</p>
            <ul>
              <li><strong>Account Data:</strong> Name, email address, password.</li>
              <li><strong>Profile Data (Players):</strong> Age, ranking, country, specialization, photos, videos, bio, and funding goals.</li>
              <li><strong>Verification Data:</strong> Links to ATP/ITF/WTA profiles and identity verification documents.</li>
              <li><strong>Payment Data:</strong> We use Stripe to process payments. We do not store your credit card information on our servers.</li>
            </ul>

            <h3>3. How We Use Your Information</h3>
            <p>We use your data to:</p>
            <ul>
              <li>Facilitate sponsorships between supporters and players.</li>
              <li>Verify player identities to ensure platform integrity.</li>
              <li>Process transactions via Stripe Connect.</li>
              <li>Send transaction receipts and platform updates.</li>
            </ul>

            <h3>4. Sharing of Information</h3>
            <p>
              <strong>Public Profiles:</strong> If you are a player, the information you add to your public profile (Bio, Ranking, Photos) is visible to all site visitors.
            </p>
            <p>
              <strong>Service Providers:</strong> We share payment data with Stripe to facilitate financial transactions. We do not sell your personal data to third-party advertisers.
            </p>

            <h3>5. Data Security</h3>
            <p>
              We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h3>6. Contact Us</h3>
            <p>
              If you have questions about this policy, please contact us via our <Link href="/contact" className="text-emerald-600 hover:underline">Contact Page</Link>.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}