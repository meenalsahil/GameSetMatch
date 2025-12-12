// client/App.tsx
import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

// Pages
import Home from "@/pages/Home";
import Signin from "@/pages/Signin";
import PlayerSignup from "@/pages/PlayerSignup";
import SignupSuccess from "@/pages/SignupSuccess";
import VerifyEmail from "@/pages/VerifyEmail";
import ResendVerification from "@/pages/ResendVerification";
import Dashboard from "@/pages/Dashboard";
import BrowsePlayers from "@/pages/BrowsePlayers";
import PlayerProfile from "@/pages/PlayerProfile";
import AdminDashboard from "@/pages/AdminDashboard";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import SponsorSuccess from "@/pages/SponsorSuccess";
import NotFound from "@/pages/not-found";

function MainHeader() {
  const [location] = useLocation();

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      location === href ? "text-emerald-700" : "text-slate-600 hover:text-emerald-700"
    }`;

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo / brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-emerald-700">GameSetMatch</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          <Link href="/browse" className={linkClass("/browse")}>
            Browse Players
          </Link>
          <Link href="/#how-it-works" className={linkClass("/#how-it-works")}>
            How It Works
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Player sign-in */}
          <Link href="/signin" className="text-sm font-medium text-slate-700 hover:text-emerald-700">
            Sign In
          </Link>

          {/* Admin dashboard link (your existing /admin route) */}
          <Link href="/admin" className="text-sm text-slate-500 hover:text-emerald-700">
            Admin
          </Link>

          {/* Get started -> player signup */}
          <Link href="/signup/player">
            <Button size="sm" className="ml-1">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/signin" component={Signin} />
      <Route path="/signup/player" component={PlayerSignup} />
      <Route path="/signup-success" component={SignupSuccess} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/resend-verification" component={ResendVerification} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Browse & Player Profiles */}
      <Route path="/browse" component={BrowsePlayers} />
      <Route path="/players/:id" component={PlayerProfile} />

      {/* Sponsor Success */}
      <Route path="/sponsor/success" component={SponsorSuccess} />

      {/* Authenticated Routes */}
      <Route path="/dashboard" component={Dashboard} />

      {/* Admin Routes */}
<Route path="/admin" component={AdminDashboard} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50">
        <MainHeader />
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
