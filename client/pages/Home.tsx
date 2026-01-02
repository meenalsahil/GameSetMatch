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
      {/* CSS for tennis animations */}
      <style>{`
        @keyframes bounce-ball {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes serve-line {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        .ball-bounce { animation: bounce-ball 2.5s ease-in-out infinite; }
        .ball-bounce-2 { animation: bounce-ball 2.5s ease-in-out infinite 0.8s; }
        .float-card { animation: float 3s ease-in-out infinite; }
        .float-card-2 { animation: float 3s ease-in-out infinite 0.3s; }
        .float-card-3 { animation: float 3s ease-in-out infinite 0.6s; }
        .serve-line { animation: serve-line 4s ease-in-out infinite; }
      `}</style>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        {/* Background video - PRESERVED */}
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

        {/* Gradient overlay - PRESERVED */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/65 to-emerald-900/50" />
        
        {/* Tennis court line pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(90deg, white 1px, transparent 1px),
              linear-gradient(white 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Animated tennis balls */}
        <div className="absolute top-24 right-24 ball-bounce hidden lg:block">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg shadow-yellow-500/40 flex items-center justify-center">
            <div className="w-5 h-0.5 bg-white/60 rounded-full rotate-45" />
          </div>
        </div>
        <div className="absolute bottom-32 left-16 ball-bounce-2 hidden lg:block">
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg shadow-yellow-500/30" />
        </div>
        
        {/* Speed serve line */}
        <div className="absolute top-1/2 left-0 right-0 overflow-hidden h-0.5 hidden lg:block">
          <div className="serve-line w-40 h-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
        </div>

        {/* Hero content - TWO COLUMN LAYOUT */}
        <div className="relative z-10 container mx-auto px-6 py-16 lg:py-20 min-h-[75vh]">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* ========== LEFT SIDE ========== */}
            <div className="flex flex-col justify-center">
              {/* Badge - Tennis style with yellow */}
              <div className="flex flex-wrap gap-3 mb-5">
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-emerald-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-yellow-400/30 hover:scale-105 transition-transform">
                  <span className="text-base">🎾</span>
                  Verified • ATP / ITF / WTA linked
                </div>
              </div>

              {/* Headline - Yellow accent */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
                Connect{" "}
                <span className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                  real tennis players
                </span>{" "}
                with supporters who care.
              </h1>

              {/* Subheadline */}
              <p className="text-base md:text-lg text-emerald-50/90 max-w-2xl mb-8">
                GameSetMatch helps supporters connect with verified tennis
                players using ATP/ITF/WTA profile links and verification
                videos—so you know you're backing genuine athletes, not fake
                profiles.
              </p>

              {/* CTAs - Tennis themed */}
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
                  className="text-lg px-8 py-6 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm hover:scale-105 transition-all"
                  asChild
                  data-testid="button-cta-sponsor"
                >
                  <Link href="/players">
                    I am a Supporter
                    <PlayCircle className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Trust strip - Match scoreboard style */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="border-r border-white/20">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <div className="text-white text-xs font-medium">ATP/ITF/WTA<br/>Verified</div>
                  </div>
                  <div className="border-r border-white/20">
                    <div className="text-yellow-400 text-lg mb-1">🎥</div>
                    <div className="text-white text-xs font-medium">Video<br/>Authentication</div>
                  </div>
                  <div>
                    <div className="text-yellow-400 text-lg mb-1">👤</div>
                    <div className="text-white text-xs font-medium">Admin<br/>Reviewed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========== RIGHT SIDE - AI FEATURES PANELS ========== */}
            <div className="hidden lg:block">
              {/* AI Header Badge */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="font-bold text-lg">AI-Powered Features</span>
                  <span className="bg-yellow-400 text-purple-900 text-xs font-bold px-2 py-0.5 rounded-full ml-1">FREE</span>
                </div>
              </div>

              {/* Feature Panels with float animation */}
              <div className="space-y-4">
                
                {/* Panel 1: Smart Player Search */}
                <div className="float-card bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 hover:bg-white/20 transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">Smart Player Search</h4>
                        <p className="text-gray-400 text-sm">Find players by ranking, country & play style</p>
                      </div>
                    </div>
                    <span className="bg-blue-500/30 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-400/30">
                      👀 Supporters
                    </span>
                  </div>
                  {/* Mini Preview */}
                  <div className="mt-4 bg-black/40 rounded-lg p-3 flex items-center gap-2 border border-white/10">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-300">Search "clay court specialists from Italy"...</span>
                  </div>
                </div>

                {/* Panel 2: StAItistics (Highlighted) */}
                <div className="float-card-2 bg-gradient-to-br from-purple-600/40 to-pink-600/40 backdrop-blur-md border border-purple-400/40 rounded-2xl p-5 hover:from-purple-600/50 hover:to-pink-600/50 transition-all cursor-pointer group relative overflow-hidden hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/30">
                  {/* Decorative glow */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl group-hover:bg-yellow-400/30 transition-all" />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg flex items-center gap-1">
                          St<span className="bg-yellow-400 text-purple-900 px-1.5 py-0.5 rounded font-extrabold text-sm">AI</span>tistics
                        </h4>
                        <p className="text-purple-200 text-sm">Real-time rankings & performance analysis</p>
                      </div>
                    </div>
                    <span className="bg-purple-500/40 text-purple-200 text-xs font-semibold px-3 py-1 rounded-full border border-purple-400/40">
                      👀 Supporters
                    </span>
                  </div>
                  {/* Mini Preview */}
                  <div className="relative mt-4 bg-black/40 rounded-lg p-3 border border-white/10">
                    <div className="text-sm text-gray-300">
                      <span className="text-purple-400 font-medium">Q:</span> "How did Jacopo perform in 2025?"
                    </div>
                    <div className="text-sm mt-1 font-medium">
                      <span className="text-emerald-400">A:</span>{" "}
                      <span className="text-white">44-25</span>{" "}
                      <span className="text-yellow-400">• 4 titles</span>{" "}
                      <span className="text-cyan-400">• 64% win</span>
                    </div>
                  </div>
                </div>

                {/* Panel 3: Profile Builder */}
                <div className="float-card-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 hover:bg-white/20 transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all">
                        <UserCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">Profile Builder</h4>
                        <p className="text-gray-400 text-sm">AI auto-fills your stats & achievements</p>
                      </div>
                    </div>
                    <span className="bg-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30">
                      🎾 Players
                    </span>
                  </div>
                  {/* Mini Preview */}
                  <div className="mt-4 bg-black/40 rounded-lg p-3 flex items-center gap-3 border border-white/10">
                    <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-emerald-900 text-xs font-bold shadow-lg">JB</div>
                    <div>
                      <div className="text-white text-sm font-medium">Auto-imported</div>
                      <div className="text-gray-400 text-xs">Ranking, Titles, Win Rate...</div>
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