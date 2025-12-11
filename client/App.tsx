// client/src/App.tsx
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
import BrowsePlayers from "@/pages/BrowsePlayers";
import PlayerProfile from "@/pages/PlayerProfile";
import Admin from "@/pages/Admin";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import SponsorSuccess from "@/pages/SponsorSuccess";
import NotFound from "@/pages/NotFound";

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
      <Route path="/admin" component={Admin} />
      
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