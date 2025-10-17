import { Trophy } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-card-foreground">AceSponsors</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering tennis players through community sponsorship
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-card-foreground mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/players">
                  <a className="hover:text-primary transition-colors">Browse Players</a>
                </Link>
              </li>
              <li>
                <Link href="/how-it-works">
                  <a className="hover:text-primary transition-colors">How It Works</a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="hover:text-primary transition-colors">Pricing</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-card-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-card-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 AceSponsors. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
