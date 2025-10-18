import { Switch, Route } from "wouter";
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
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/thank-you" component={ThankYou} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
