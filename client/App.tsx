import FAQ from "./pages/FAQ";
import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Home from "@/pages/Home";
import Players from "@/pages/Players";
import PlayerProfile from "@/pages/PlayerProfile";
import HowItWorks from "@/pages/HowItWorks";
import PlayerSignup from "@/pages/PlayerSignup";
import Signin from "@/pages/Signin";
import Dashboard from "@/pages/Dashboard";
import ThankYou from "@/pages/ThankYou";
import Contact from "@/pages/Contact";
import AdminDashboard from "@/pages/AdminDashboard";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AutoSignin from "@/pages/AutoSignin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/players" component={Players} />
      <Route path="/player/:id" component={PlayerProfile} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/signup/player" component={PlayerSignup} />
      <Route path="/signin" component={Signin} />
      <Route path="/faq" component={FAQ} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/contact" component={Contact} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/auto-signin" component={AutoSignin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <Router />
          </div>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
