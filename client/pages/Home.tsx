import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Trophy,
  Target,
  Users,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function HomePage() {
  useEffect(() => {
    // Smooth scroll to section if hash exists
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* HERO SECTION WITH BACKGROUND VIDEO */}
      <section className="relative overflow-hidden">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          {/* You can replace this with your own hosted tennis video later */}
          <source
            src="https://videos.pexels.com/video-files/4761793/4761793-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/65 to-emerald-900/50" />

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-6 py-24 flex items-center min-h-[70vh]">
          <div className="max-w-4xl">
            {/* Trust pills */}
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/40 text-emerald-200 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified tennis players • ATP / ITF / WTA linked
              </div>
              
              <div className="inline-flex items-center gap-2 bg-purple-900/60 border border-purple-400/50 text-purple-100 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                AI-Powered Platform • Smart Search & Bio Builder
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-tight">
              Connect{" "}
              <span className="text-emerald-300">real tennis players</span>{" "}
              with supporters who care.
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-lg text-emerald-50/90 max-w-2xl mb-8">
              GameSetMatch helps supporters connect with verified tennis
              players using ATP/ITF/WTA profile links and verification
              videos—so you know you're backing genuine athletes, not fake
              profiles.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                size="lg"
                className="text-lg px-8 py-6 shadow-lg shadow-emerald-500/30"
                asChild
                data-testid="button-cta-player"
              >
                <Link href="/signup/player">
                  I'm a Player
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              {/* UPDATED BUTTON: "I am a Supporter" */}
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-emerald-300/70 text-emerald-50 hover:bg-emerald-900/40"
                asChild
                data-testid="button-cta-sponsor"
              >
                <Link href="/players">
                  I am a Supporter
                  <PlayCircle className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Trust strip bullets */}
            <div className="flex flex-wrap gap-4 text-xs md:text-sm text-emerald-100/85">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ATP / ITF / WTA profile link required for players
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Video verification for player identity
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Manual review before profiles go live
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <div
        id="how-it-works"
        className="py-24 bg-white dark:bg-gray-900 flex-1"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Get the support you need to compete at ATP, Challenger, and ITF
              tournaments
            </p>
          </div>

          <div className="mb-20">
            <h3 className="text-3xl font-bold text-center mb-12">
              For Players
            </h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-green-600">1</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Sign Up</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your player profile in minutes. It&apos;s free to
                    join!
                  </p>
                  <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Share your tennis journey</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Upload match videos</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-500 transition-all hover:shadow-lg relative">
                {/* AI Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    AI-Powered
                  </span>
                </div>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-purple-600">2</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    Build Your Profile
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Showcase your achievements, ranking, and funding goals
                  </p>
                  <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Tournament results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Training needs</span>
                    </li>
                    <li className="flex items-start gap-2 text-purple-600 font-medium">
                      <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>AI writes your bio - Free!</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-blue-600">
                      3
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Get Support</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Connect with supporters who want to back your tennis
                    journey
                  </p>
                  <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Travel & gear funding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Monthly stipends</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="text-lg" asChild>
                <Link href="/signup/player">Get Started as Player</Link>
              </Button>
            </div>
          </div>

          {/* For Supporters */}
          <div>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-3">For Supporters</h3>
              <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-powered player matching • FREE
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Browse Players</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Discover talented tennis players at all competitive levels
                    and find the right fit
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Choose a Player</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Review profiles, equipment needs, and support goals to find
                    your match
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Make an Impact</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Contribute toward travel, coaching, gear, or stipends and
                    help athletes achieve their goals
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}