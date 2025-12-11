// client/App.tsx
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Home from "@/pages/Home";
import Signin from "@/pages/Signin";
import PlayerSignup from "@/pages/PlayerSignup";
import SignupSuccess from "@/pages/SignupSuccess";
import VerifyEmail from "@/pages/VerifyEmail";
import ResendVerification from "@/pages/ResendVerification";
import Dashboard from "@/pages/Dashboard";
import Players from "@/pages/Players";
import PlayerProfile from "@/pages/PlayerProfile";
import AdminDashboard from "@/pages/AdminDashboard";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ThankYou from "@/pages/ThankYou";
import NotFound from "@/pages/not-found";
import HowItWorks from "@/pages/HowItWorks";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import SponsorSignup from "@/pages/SponsorSignup";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/signin" component={Signin} />
      <Route path="/signup/player" component={PlayerSignup} />
      <Route path="/signup/sponsor" component={SponsorSignup} />
      <Route path="/signup-success" component={SignupSuccess} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/resend-verification" component={ResendVerification} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/faq" component={FAQ} />
      <Route path="/contact" component={Contact} />
      
      {/* Browse & Player Profiles */}
      <Route path="/browse" component={Players} />
      <Route path="/players" component={Players} />
      <Route path="/players/:id" component={PlayerProfile} />
      
      {/* Thank You / Success */}
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/sponsor/success" component={ThankYou} />
      
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;