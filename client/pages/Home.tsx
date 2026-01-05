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
  Eye,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function HomePage() {
  useEffect(() => {
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
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/85 to-emerald-950/80" />

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-6 py-12 min-h-[90vh]">
          
          {/* Headline */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              Verified ATP / ITF / WTA Players Only
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Connect <span className="text-emerald-400">real tennis players</span> with supporters
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The road to the ATP is expensive. <span className="text-emerald-400 font-semibold">We make it possible.</span>
            </p>
          </div>

          {/* Two Column: Supporters vs Players */}
          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            
            {/* ========== FOR SUPPORTERS (Blue) ========== */}
            <div className="bg-blue-950/40 backdrop-blur border border-blue-500/30 rounded-3xl p-8">
              
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">For Supporters</h2>
                  <p className="text-blue-300/70 text-sm">Find & support verified players</p>
                </div>
              </div>

              {/* Search Box */}
              <div className="mb-6">
                <label className="text-blue-200/60 text-xs font-medium mb-2 block">
                  Search for verified players to support
                </label>
                <form 
                  className="bg-white rounded-xl p-1.5 flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const query = formData.get('search') as string;
                    window.location.href = `/players${query ? `?search=${encodeURIComponent(query)}` : ''}`;
                  }}
                >
                  <div className="flex-1 flex items-center gap-2 px-3 py-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input 
                      type="text"
                      name="search"
                      placeholder='Try: "Left-handed players from Spain"'
                      className="flex-1 text-gray-800 placeholder-gray-400 outline-none text-sm"
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm"
                  >
                    Search
                  </Button>
                </form>
              </div>

              {/* AI Feature: StAItistics */}
              <div className="bg-purple-900/30 border border-purple-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium text-sm">
                    St<span className="text-purple-400">AI</span>tistics
                  </span>
                  <span className="bg-purple-500/30 text-purple-300 text-xs px-2 py-0.5 rounded-full">FREE</span>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-sm">
                  <div className="text-gray-400 mb-1">Q: "How did Jacopo perform in 2025?"</div>
                  <div className="text-white">A: 44-25 record • 4 titles • 64% win rate</div>
                </div>
              </div>

              {/* CTA */}
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 rounded-xl"
                asChild
              >
                <Link href="/players">
                  Browse All Players
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* ========== FOR PLAYERS (Green) ========== */}
            <div className="bg-emerald-950/40 backdrop-blur border border-emerald-500/30 rounded-3xl p-8">
              
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-lg">
                  🎾
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">For Players</h2>
                  <p className="text-emerald-300/70 text-sm">Get verified & find supporters</p>
                </div>
              </div>

              {/* Benefits List */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Get Verified</h4>
                    <p className="text-gray-400 text-xs">Link your ATP/ITF/WTA profile for credibility</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Receive Support</h4>
                    <p className="text-gray-400 text-xs">Get funding for travel, gear, coaching & more</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Share Your Journey</h4>
                    <p className="text-gray-400 text-xs">Build your profile and connect with fans</p>
                  </div>
                </div>
              </div>

              {/* AI Feature: Profile Builder */}
              <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <UserCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-medium text-sm">AI Profile Builder</span>
                  <span className="bg-emerald-500/30 text-emerald-300 text-xs px-2 py-0.5 rounded-full">FREE</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Our AI auto-fills your stats, rankings, and achievements from official databases. Create your profile in minutes.
                </p>
              </div>

              {/* CTA */}
              <Button 
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl"
                asChild
              >
                <Link href="/signup/player">
                  Register as Player
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-8 mt-10 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> ATP/ITF/WTA Verified
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Video Authentication
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Manual Admin Review
            </span>
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