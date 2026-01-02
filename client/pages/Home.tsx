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
  Zap,
  Video,
  UserCheck,
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
      {/* CSS for animations */}
      <style>{`
        @keyframes bounce-ball {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes serve {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
        @keyframes rise {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .ball-bounce { animation: bounce-ball 2s ease-in-out infinite; }
        .ball-bounce-delayed { animation: bounce-ball 2s ease-in-out infinite 0.5s; }
        .serve-line { animation: serve 3s ease-in-out infinite; }
        .rise-1 { animation: rise 0.6s ease-out; }
        .rise-2 { animation: rise 0.6s ease-out 0.15s both; }
        .rise-3 { animation: rise 0.6s ease-out 0.3s both; }
        .court-pattern {
          background-image: 
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .net-pattern {
          background-image: 
            repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 9px),
            repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 9px);
        }
      `}</style>

      {/* HERO SECTION - Tennis Court Theme */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 court-pattern">
        
        {/* Court center line */}
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/10 -translate-x-1/2" />
        
        {/* Service boxes (subtle) */}
        <div className="absolute top-20 left-10 w-40 h-60 border border-white/10 rounded-sm hidden lg:block" />
        <div className="absolute top-20 right-10 w-40 h-60 border border-white/10 rounded-sm hidden lg:block" />
        
        {/* Animated tennis balls */}
        <div className="absolute top-32 right-32 ball-bounce hidden lg:block">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg shadow-yellow-500/30 flex items-center justify-center">
            <div className="w-6 h-1 bg-white/50 rounded-full rotate-45" />
          </div>
        </div>
        <div className="absolute bottom-40 left-20 ball-bounce-delayed hidden lg:block">
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg shadow-yellow-500/20" />
        </div>
        
        {/* Speed line */}
        <div className="absolute top-1/2 left-0 right-0 overflow-hidden h-1">
          <div className="serve-line w-32 h-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
        </div>

        {/* Hero content - TWO COLUMN LAYOUT */}
        <div className="relative z-10 container mx-auto px-6 py-16 lg:py-20 min-h-[75vh]">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* ========== LEFT SIDE ========== */}
            <div className="flex flex-col justify-center">
              {/* Badge with tennis ball icon */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-emerald-900 px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform cursor-default">
                  <span className="text-lg">🎾</span>
                  Verified • ATP / ITF / WTA linked
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                Connect{" "}
                <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                  real tennis players
                </span>{" "}
                with supporters who care.
              </h1>

              {/* Subheadline */}
              <p className="text-base md:text-lg text-emerald-100/80 max-w-2xl mb-8 leading-relaxed">
                GameSetMatch helps supporters connect with verified tennis
                players using ATP/ITF/WTA profile links and verification
                videos—so you know you're backing genuine athletes, not fake
                profiles.
              </p>

              {/* CTAs - Tennis style */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-yellow-400 hover:bg-yellow-300 text-emerald-900 font-bold shadow-lg shadow-yellow-400/30 hover:scale-105 transition-all"
                  asChild
                  data-testid="button-cta-player"
                >
                  <Link href="/signup/player">
                    <span className="text-xl mr-2">🎾</span>
                    I'm a Player
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:border-white/50 text-white font-semibold hover:scale-105 transition-all"
                  asChild
                  data-testid="button-cta-sponsor"
                >
                  <Link href="/players">
                    I am a Supporter
                    <PlayCircle className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Trust points - Match stats style */}
              <div className="bg-emerald-950/50 backdrop-blur-sm rounded-xl p-4 border border-emerald-700/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="border-r border-emerald-700/50">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <div className="text-white text-xs font-medium">ATP/ITF/WTA<br/>Verified</div>
                  </div>
                  <div className="border-r border-emerald-700/50">
                    <Video className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <div className="text-white text-xs font-medium">Video<br/>Authentication</div>
                  </div>
                  <div>
                    <UserCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <div className="text-white text-xs font-medium">Admin<br/>Reviewed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========== RIGHT SIDE - AI FEATURES PANELS ========== */}
            <div className="hidden lg:block">
              {/* AI Header Badge */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold text-lg">AI-Powered Features</span>
                  <span className="bg-yellow-400 text-emerald-900 text-xs font-bold px-2 py-0.5 rounded-full">FREE</span>
                </div>
              </div>

              {/* Feature Panels */}
              <div className="space-y-4">
                
                {/* Panel 1: Smart Player Search */}
                <div className="rise-1 group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 net-pattern opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">Smart Player Search</h4>
                        <p className="text-emerald-200/60 text-sm">Find players by ranking, country & play style</p>
                      </div>
                    </div>
                    <span className="bg-blue-500/20 text-blue-300 text-xs font-medium px-3 py-1 rounded-full">
                      👀 Supporters
                    </span>
                  </div>
                  {/* Mini Preview */}
                  <div className="relative mt-4 bg-emerald-950/50 rounded-lg p-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <span className="text-sm text-emerald-200/60">Search "clay court specialists from Italy"...</span>
                  </div>
                </div>

                {/* Panel 2: StAItistics (Highlighted) */}
                <div className="rise-2 group bg-gradient-to-br from-purple-600/40 to-pink-600/40 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-5 hover:from-purple-600/50 hover:to-pink-600/50 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xl relative overflow-hidden">
                  {/* Decorative glow */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl group-hover:bg-yellow-400/20 transition-all" />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg flex items-center gap-1">
                          St<span className="bg-yellow-400 text-emerald-900 px-1.5 py-0.5 rounded font-extrabold text-sm">AI</span>tistics
                        </h4>
                        <p className="text-purple-200 text-sm">Real-time rankings & performance analysis</p>
                      </div>
                    </div>
                    <span className="bg-purple-500/30 text-purple-200 text-xs font-medium px-3 py-1 rounded-full">
                      👀 Supporters
                    </span>
                  </div>
                  {/* Mini Preview */}
                  <div className="relative mt-4 bg-emerald-950/50 rounded-lg p-3">
                    <div className="text-sm text-purple-200/80">
                      <span className="text-purple-400">Q:</span> "How did Jacopo perform in 2025?"
                    </div>
                    <div className="text-sm font-medium mt-1">
                      <span className="text-emerald-400">A:</span>{" "}
                      <span className="text-white">44-25</span>{" "}
                      <span className="text-yellow-400">• 4 titles</span>{" "}
                      <span className="text-cyan-400">• 64% win</span>
                    </div>
                  </div>
                </div>

                {/* Panel 3: Profile Builder */}
                <div className="rise-3 group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 net-pattern opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                        <UserCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">Profile Builder</h4>
                        <p className="text-emerald-200/60 text-sm">AI auto-fills your stats & achievements</p>
                      </div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full">
                      🎾 Players
                    </span>
                  </div>
                  {/* Mini Preview */}
                  <div className="relative mt-4 bg-emerald-950/50 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-emerald-900 font-bold text-sm shadow-lg">JB</div>
                    <div>
                      <div className="text-white text-sm font-medium">Auto-imported</div>
                      <div className="text-emerald-200/60 text-xs">Ranking, Titles, Win Rate...</div>
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
            <h3 className="text-3xl font-bold text-center mb-3">
              For Players
            </h3>
            {/* AI Badge for Players - Profile Builder */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-powered Profile Builder • FREE
              </div>
            </div>
            
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
              {/* UPDATED: Now includes both Smart Search AND StAItistics */}
              <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-powered Smart Search & St<span className="bg-purple-600 text-white px-1 rounded text-xs font-bold mx-0.5">AI</span>tistics • FREE
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

              {/* Supporter Card 4 (Help) */}
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