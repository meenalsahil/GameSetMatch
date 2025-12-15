import { useState } from "react";
import { Trophy, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Always scroll to top when user clicks Home / logo
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
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

        {/* DESKTOP NAVIGATION (Hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-6">
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

          <a
            href="/#how-it-works"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-testid="link-how-it-works"
          >
            How It Works
          </a>

          <Link
            href="/testimonials"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-testid="link-testimonials"
          >
            Testimonials
          </Link>
        </nav>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              asChild
              size="sm"
              variant="outline"
              data-testid="button-dashboard"
              className="hidden md:inline-flex"
            >
              <Link href="/dashboard">
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                data-testid="button-login"
              >
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm" data-testid="button-get-started">
                <Link href="/signup/player">Player Registration</Link>
              </Button>
            </div>
          )}

          {/* MOBILE MENU TOGGLE (Visible only on mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-6 py-4 space-y-4 shadow-lg animate-in slide-in-from-top-5">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={handleScrollTop}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/players"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Browse Players
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              How It Works
            </a>
            <Link
              href="/testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          
          <div className="border-t pt-4 flex flex-col gap-3">
             {isAuthenticated ? (
               <Button asChild size="sm" className="w-full justify-start">
                 <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                   <User className="h-4 w-4 mr-2" />
                   Dashboard
                 </Link>
               </Button>
             ) : (
               <>
                 <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                 </Button>
                 <Button asChild size="sm" className="w-full">
                    <Link href="/signup/player" onClick={() => setMobileMenuOpen(false)}>Player Registration</Link>
                 </Button>
               </>
             )}
          </div>
        </div>
      )}
    </header>
  );
}