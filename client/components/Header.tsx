import { Trophy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { isAuthenticated } = useAuth();

  // Always scroll to top when user clicks Home / logo
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-background/80">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo -> Home + scroll to top */}
        <Link href="/" onClick={handleScrollTop}>
          <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-3 py-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">
              GameSetMatch
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {/* Home -> scroll to top even if already on / */}
          <Link
            href="/"
            onClick={handleScrollTop}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-testid="link-home"
          >
            Home
          </Link>

          <Link
            href="/players"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-testid="link-players"
          >
            Browse Players
          </Link>

          {/* How It Works: still uses hash to jump to section */}
          <a
            href="/#how-it-works"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-testid="link-how-it-works"
          >
            How It Works
          </a>

          {/* Testimonials Link (New) */}
          <Link
            href="/testimonials"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-testid="link-testimonials"
          >
            Testimonials
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button
                asChild
                size="sm"
                variant="outline"
                data-testid="button-dashboard"
              >
                <Link href="/dashboard">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                data-testid="button-login"
              >
                <Link href="/signin">Sign In</Link>
              </Button>
              {/* UPDATED BUTTON TEXT */}
              <Button asChild size="sm" data-testid="button-get-started">
                <Link href="/signup/player">Player Registration</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}