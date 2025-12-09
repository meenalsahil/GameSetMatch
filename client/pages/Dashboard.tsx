// client/src/pages/Dashboard.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import {
  User,
  MapPin,
  Trophy,
  CheckCircle2,
  XCircle,
  LogOut,
  Shield,
  CreditCard,
  Loader2,
  Edit,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { player, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please sign in to access your dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/signin");
      }, 500);
    }
  }, [isLoading, isAuthenticated, setLocation, toast]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Signed out successfully" });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/players/toggle-active", { method: "POST" });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: player?.active ? "Profile deactivated" : "Profile activated",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/players/${player?.id}/publish`, {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to publish profile");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile Published",
        description: "Your profile is now visible to sponsors!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ---------- Stripe Connect client logic ----------
  const stripeStatusQuery = useQuery({
    queryKey: ["/api/payments/stripe/status"],
    enabled: !!player && !!player.stripeAccountId, // only check if we have an account id
    queryFn: async () => {
      const res = await fetch("/api/payments/stripe/status");
      if (!res.ok) throw new Error("Failed to fetch Stripe status");
      return res.json() as Promise<{
        ready: boolean;
        hasAccount: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        detailsSubmitted: boolean;
      }>;
    },
  });

  const connectStripeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/payments/stripe/connect-link", {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create Stripe link");
      }
      return res.json() as Promise<{ url: string }>;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({
        title: "Stripe setup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!player) {
    return null;
  }

  const initials = player.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const stripeReady = player.stripeReady || stripeStatusQuery.data?.ready;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  Player Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {player.fullName}!
                </p>
              </div>
              <div className="flex gap-2">
                {player.isAdmin && (
                  <Button
                    asChild
                    variant="destructive"
                    data-testid="button-admin-dashboard"
                  >
                    <Link href="/admin">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => logoutMutation.mutate()}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={player.photoUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    <User className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-2">{player.fullName}</h2>
                <p className="text-muted-foreground mb-4">{player.email}</p>
                <div className="w-full space-y-2">
                  {player.published ? (
                    <Badge className="w-full justify-center" variant="default">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Published
                    </Badge>
                  ) : (
                    <Badge
                      className="w-full justify-center"
                      variant="secondary"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Not Published
                    </Badge>
                  )}
                  {stripeReady && (
                    <Badge className="w-full justify-center bg-emerald-600 text-white">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Stripe payouts ready
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Player Information</CardTitle>
                  <CardDescription>Your tennis profile details</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/edit-profile">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-muted-foreground mb-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">Location</span>
                    </div>
                    <p className="font-medium">{player.location}</p>
                  </div>
                  {player.ranking && (
                    <div>
                      <div className="flex items-center text-muted-foreground mb-1">
                        <Trophy className="h-4 w-4 mr-2" />
                        <span className="text-sm">Ranking</span>
                      </div>
                      <p className="font-medium">{player.ranking}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <div className="text-muted-foreground mb-1">
                      <span className="text-sm">Specialization</span>
                    </div>
                    <p className="font-medium">{player.specialization}</p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-muted-foreground mb-1">
                      <span className="text-sm">Bio</span>
                    </div>
                    <p className="text-muted-foreground">{player.bio}</p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  {player.approvalStatus === "pending" && (
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-md border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                            Application Under Review
                          </h3>
                          <p className="text-sm text-orange-800 dark:text-orange-200">
                            Your application is being reviewed by our team.
                            You'll receive an email once your profile has been
                            approved and you can publish it to sponsors.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {player.approvalStatus === "rejected" && (
                    <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-destructive mb-1">
                            Application Not Approved
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Unfortunately, your application was not approved at
                            this time. If you have questions or would like to
                            reapply, please contact our support team.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {player.approvalStatus === "approved" && !player.published && (
                    <div className="bg-muted/50 p-4 rounded-md space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Your profile has been approved! Publish it now to make
                        it visible to sponsors and start receiving sponsorship
                        opportunities.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => publishMutation.mutate()}
                          disabled={publishMutation.isPending}
                          data-testid="button-publish"
                        >
                          {publishMutation.isPending
                            ? "Publishing..."
                            : "Publish Profile"}
                        </Button>
                        <Button
                          variant={player?.active ? "outline" : "default"}
                          onClick={() => toggleActiveMutation.mutate()}
                        >
                          {player?.active
                            ? "Make Profile Inactive"
                            : "Activate Profile"}
                        </Button>
                      </div>
                    </div>
                  )}
                  {player.published && (
                    <div className="bg-primary/5 p-4 rounded-md border border-primary/20">
                      <p className="text-sm text-foreground">
                        Your profile is live and visible to sponsors!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stripe Connect Card */}
          {player.approvalStatus === "approved" && (
            <div className="mt-8">
              <Card className="border-2 border-dashed border-emerald-300 bg-emerald-50/40">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                      Set up payouts with Stripe (test)
                    </CardTitle>
                    <CardDescription>
                      Connect a Stripe Express account so sponsors can send you
                      funds in the future. Right now this is in{" "}
                      <strong>test mode</strong> for your own experimentation.
                    </CardDescription>
                  </div>
                  {stripeStatusQuery.isFetching && (
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  )}
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="text-sm text-muted-foreground max-w-xl">
                    {!stripeReady ? (
                      <>
                        When you click the button, you&apos;ll be taken to
                        Stripe to complete onboarding. Use{" "}
                        <strong>test details</strong> only. After you return,
                        refresh this page and you should see &quot;Stripe
                        payouts ready&quot; on your profile.
                      </>
                    ) : (
                      <>
                        Your Stripe Express account looks ready in test mode.
                        You can re-run onboarding if you want to test again.
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={stripeReady ? "outline" : "default"}
                      onClick={() => connectStripeMutation.mutate()}
                      disabled={connectStripeMutation.isPending}
                    >
                      {connectStripeMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Contacting Stripe...
                        </>
                      ) : stripeReady ? (
                        "Re-open Stripe onboarding"
                      ) : (
                        "Set up Stripe payouts (test)"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}