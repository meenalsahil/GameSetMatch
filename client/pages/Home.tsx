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
  Sparkles,
  HelpCircle,
  Search,
  BarChart3,
  UserCircle,
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
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://videos.pexels.com/video-files/4761793/4761793-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/65 to-emerald-900/50" />

        {/* Hero content - TWO COLUMN LAYOUT */}
        <div className="relative z-10 container mx-auto px-6 py-16 lg:py-20 min-h-[75vh]">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* ========== LEFT SIDE - EXISTING CONTENT ========== */}
            <div className="flex flex-col justify-center">
              {/* Trust pills */}
              <div className="flex flex-wrap gap-3 mb-5">
                <div className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/40 text-emerald-200 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Verified tennis players • ATP / ITF / WTA linked
                </div>
                
                <div className="inline-flex items-center gap-2 bg-purple-900/60 border border-purple-400/50 text-purple-100 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  AI-Powered Platform • Smart Player Browse, AI Stats Analyst & Player Profile Builder
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
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
              <div className="flex flex-wrap gap-4 text-xs md:text-sm text-emerald-100/90 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ATP / ITF / WTA profile link required
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Video upload by Players for authenticity
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Manual account review of each Player by Admin
                </div>
              </div>
            </div>

            {/* ========== RIGHT SIDE - AI FEATURES PANELS ========== */}
            <div className="hidden lg:block">
              {/* AI Header Badge */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold text-lg">AI-Powered Features</span>
                </div>
              </div>

              {/* Feature Panels */}
              <div className="space-y-4">
                
                {/* Panel 1: Smart Player Search */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/15 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">Smart Player Search</h4>
                        <p className="text-gray-400 text-sm">Find players by ranking, country & play style</p>
                      </div>
                    </div>
                    <span className="bg-blue-500/20 text-blue-300 text-xs font-medium px-3 py-1 rounded-full">
                      👀 Supporters
                    </span>
                  </div>
                  {/* Mini Preview */}
                  <div className="mt-4 bg-black/20 rounded-lg p-3 flex items-center gap-2">
                    <div className="flex-1 bg-white/10 rounded px-3 py-2 text-sm text-gray-400">
                      🔍 Search "clay court specialists from Italy"...
                    </div>
                  </div>
                </div>

                {/* Panel 2: StAItistics (Highlighted) */}
                <div className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 backdrop-blur-sm border border-purple-400/30 rounded-xl p-5 hover:from-purple-600/40 hover:to-indigo-600/40 transition-all cursor-pointer group relative overflow-hidden">
                  {/* Decorative glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg flex items-center gap-2">
                          St<span className="bg-white/25 text-yellow-300 px-1.5 py-0.5 rounded font-extrabold text-sm">AI</span>tistics
                        </h4>
                        <p className="text-purple-200 text-sm">Real-time rankings & performance analysis</p>
                      </div>
                    </div>
                    <span className="bg-purple-500/30 text-purple-200 text-xs font-medium px-3 py-1 rounded-full">
                      👀 Supporters
                    </span>
                  </div>
                  {/* Mini Preview */}
                  <div className="relative mt-4 bg-black/20 rounded-lg p-3">
                    <div className="text-sm text-gray-300">
                      <span className="text-purple-300">Q:</span> "How did Jacopo perform in 2025?"
                    </div>
                    <div className="text-sm text-white mt-1">
                      <span className="text-emerald-400">A:</span> 44-25 record • 4 titles • 64% win rate
                    </div>
                  </div>
                </div>

                {/* Panel 3: Profile Builder */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/15 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <UserCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">Profile Builder</h4>
                        <p className="text-gray-400 text-sm">AI auto-fills your stats & achievements</p>
                      </div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full">
                      🎾 Players
                    </span>
                  </div>
                  {/* Mini Preview */}
                  <div className="mt-4 bg-black/20 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/30 rounded-full flex items-center justify-center text-emerald-300 text-xs font-bold">JB</div>
                    <div className="text-sm text-gray-300">
                      Auto-imported: Ranking, Titles, Win Rate...
                    </div>
                  </div>
                </div>

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
              Get the support you need to compete at ATP, WTA, Challenger, and ITF
              tournaments
            </p>
          </div>

          {/* PLAYERS SECTION */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-center mb-12">
              For Players
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              
              {/* Player Card 1 */}
              <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg h-full">
                <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl font-bold text-green-600">1</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Sign Up</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                      Create your player profile in minutes. It&apos;s free to join!
                    </p>
                    <ul className="text-left text-xs text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Share your tennis journey</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Upload match videos</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Player Card 2 */}
              <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg h-full">
                <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl font-bold text-green-600">2</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Get Verified</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                      Link your official ATP/WTA/ITF profile for credibility.
                    </p>
                    <ul className="text-left text-xs text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Link official profile</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Build trust with supporters</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Player Card 3 */}
              <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg h-full">
                <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl font-bold text-green-600">3</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Get Support</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                      Connect with supporters who want to back your journey.
                    </p>
                    <ul className="text-left text-xs text-gray-600 dark:text-gray-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Travel & gear funding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Monthly stipends</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Player Card 4 (Help) */}
              <Card className="border-2 hover:border-gray-400 transition-all hover:shadow-lg h-full bg-gray-50/50">
                <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <HelpCircle className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">Have Questions?</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                      Not sure where to start? Check our FAQ or contact us directly.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button asChild variant="outline" className="w-full bg-white">
                      <Link href="/faq">Read FAQ</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full">
                      <Link href="/contact">Contact Us</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="text-lg" asChild>
                <Link href="/signup/player">Get Started as Player</Link>
              </Button>
            </div>
          </div>

          {/* SUPPORTERS SECTION */}
          <div>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-3">For Supporters</h3>
              <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-powered player search • FREE
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              
              {/* Supporter Card 1 */}
              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg h-full">
                <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Browse Players</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Discover talented tennis players at all competitive levels.
                    </p>
                    <ul className="text-left text-xs text-gray-600 dark:text-gray-400 space-y-2">
                       <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Filter by rank & region</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>View verified videos</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Supporter Card 2 */}
              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg h-full">
                <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Choose a Player</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Review profiles and support goals to find your match.
                    </p>
                    <ul className="text-left text-xs text-gray-600 dark:text-gray-400 space-y-2">
                       <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>See equipment needs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Support specific goals</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Supporter Card 3 */}
              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg h-full">
                <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trophy className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Make an Impact</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Contribute toward travel, coaching, or gear.
                    </p>
                     <ul className="text-left text-xs text-gray-600 dark:text-gray-400 space-y-2">
                       <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>100% Secure payments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Help athletes win</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Supporter Card 4 (Help) - IDENTICAL TO PLAYER SECTION */}
              <Card className="border-2 hover:border-gray-400 transition-all hover:shadow-lg h-full bg-gray-50/50">
                <CardContent className="p-8 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <HelpCircle className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">Have Questions?</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                      Not sure where to start? Check our FAQ or contact us directly.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button asChild variant="outline" className="w-full bg-white">
                      <Link href="/faq">Read FAQ</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full">
                      <Link href="/contact">Contact Us</Link>
                    </Button>
                  </div>
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