import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Calendar, Users, Bell } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function ThankYou() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center py-20 px-6">
        <Card className="max-w-3xl w-full p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-card-foreground mb-4">
              Welcome to GameSetMatch!
            </h1>
            <p className="text-lg text-muted-foreground">
              Thank you for creating your player profile. You're one step closer to connecting with sponsors.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-card-foreground mb-4">
              What Happens Next?
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">Profile Review</h3>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your application to ensure quality and authenticity. This typically takes 1-2 business days.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">Approval Notification</h3>
                  <p className="text-sm text-muted-foreground">
                    Once approved, we'll send you an email with next steps and how to complete your profile with photos and videos.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">Publish Your Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    After approval, you'll be able to publish your profile from your dashboard to make it visible to sponsors seeking players to support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-card-foreground mb-2">
              In the Meantime
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              You can access your dashboard to view your profile status and information while we review your application.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" data-testid="button-dashboard">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" data-testid="button-home">
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
