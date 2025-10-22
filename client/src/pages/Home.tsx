import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Trophy, Target, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-950 dark:via-gray-900 dark:to-blue-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Trophy className="h-4 w-4" />
              Supporting Tennis Players Worldwide
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Connect Tennis Players
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                with Sponsors
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              Support rising tennis stars from ATP to ITF tournaments. Help
              players achieve their dreams with gear, travel, and training
              funds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/browse-players">
                  Browse Players
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                asChild
              >
                <Link href="/signup/player">I'm a Player</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">250+</div>
              <div className="text-green-100">Active Players</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">$500K+</div>
              <div className="text-green-100">Total Funded</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">150+</div>
              <div className="text-green-100">Sponsors</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">45</div>
              <div className="text-green-100">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - For Players */}
      <div className="py-24 bg-white dark:bg-gray-900">
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
                    Create your player profile in minutes. It's free to join!
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

              <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-blue-600">2</span>
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
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-purple-600">
                      3
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Get Sponsored</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Connect with sponsors who want to support your tennis
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

          {/* For Sponsors */}
          <div>
            <h3 className="text-3xl font-bold text-center mb-12">
              For Sponsors
            </h3>
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
                    Review profiles, equipment needs, and sponsorship goals to
                    find your match
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Make an Impact</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Contribute with travel support, gear, or stipends and help
                    athletes achieve goals
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Button size="lg" variant="outline" className="text-lg" asChild>
                <Link href="/browse-players">Browse Players</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
