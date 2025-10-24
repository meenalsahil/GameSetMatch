import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Target, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-400/30 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-400/30 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8 border border-white/30">
            <Trophy className="h-4 w-4" />
            Supporting Tennis Players Worldwide
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
            Connect Tennis Players
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              with Sponsors
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
            Support rising tennis stars from ATP to ITF tournaments. Help
            players achieve their dreams with gear, travel, and training funds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/players">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-xl shadow-2xl hover:scale-105 transition-transform group"
              >
                Browse Players
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/signup/player">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 font-bold text-lg px-8 py-6 rounded-xl"
              >
                I'm a Player
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20">
            {[
              { value: "500+", label: "Players" },
              { value: "$2M+", label: "Funding" },
              { value: "50+", label: "Countries" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-black text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Why Choose Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The premier platform connecting tennis talent with global sponsors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Direct Connections",
                description:
                  "Connect directly with sponsors who share your passion for tennis excellence",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: Trophy,
                title: "Verified Athletes",
                description:
                  "All players are verified and vetted to ensure quality matches",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Sparkles,
                title: "Full Transparency",
                description:
                  "Clear funding goals, detailed profiles, and real-time updates",
                color: "from-purple-500 to-pink-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}
                />
                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCA0LTRzNCAxLjggNCA0LTIgNC00IDQtNC0yLTQtNHptMC0xMGMwLTIgMi00IDQtNHM0IDEuOCA0IDQtMiA0LTQgNC00LTItNC00em0tMTAgMGMwLTIgMi00IDQtNHM0IDEuOCA0IDQtMiA0LTQgNC00LTItNC00em0wIDEwYzAtMiAyLTQgNC00czQgMS44IDQgNC0yIDQtNCA0LTQtMi00LTR6bTAtMTBjMC0yIDItNCA0LTRzNCAxLjggNCA0LTIgNC00IDQtNC0yLTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-black text-white mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Join thousands of sponsors and players already making connections
          </p>
          <Link href="/players">
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 font-bold text-lg px-12 py-6 rounded-xl shadow-2xl hover:scale-105 transition-transform"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
