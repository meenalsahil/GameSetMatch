// client/pages/SponsorSuccess.tsx
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function SponsorSuccess() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-10 flex-1 flex items-center">
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-50 p-3 dark:bg-emerald-900/30">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl">
              Thank you for supporting a player! 🎾
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Your payment was successful. The player will see this
              contribution in their dashboard, and funds will be paid out
              to their connected Stripe account.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Link href="/browse">
                <Button variant="outline" className="min-w-[170px]">
                  Browse more players
                </Button>
              </Link>
              <Link href="/">
                <Button className="min-w-[170px]">
                  Back to home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
