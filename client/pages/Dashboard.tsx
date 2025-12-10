// client/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
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
  Edit3,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormState = {
  email: string;
  fullName: string;
  age: string;
  country: string;
  location: string;
  ranking: string;
  specialization: string;
  bio: string;
  fundingGoals: string;
  videoUrl: string;
  atpProfileUrl: string;
  photoUrl: string;
};

type StripeStatusResponse = {
  hasAccount: boolean;
  stripeReady: boolean;
  restricted?: boolean;
  requirementsDue?: string[];
};

export default function Dashboard() {
  const { player, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormState | null>(null);

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

  // initialize form when player loads
  useEffect(() => {
    if (player) {
      setForm({
        email: player.email || "",
        fullName: player.fullName || "",
        age: player.age != null ? String(player.age) : "",
        country: player.country || "",
        location: player.location || "",
        ranking: player.ranking != null ? String(player.ranking) : "",
        specialization: player.specialization || "",
        bio: player.bio || "",
        fundingGoals: player.fundingGoals || "",
        videoUrl: player.videoUrl || "",
        atpProfileUrl: (player as any).atpProfileUrl || "",
        photoUrl: player.photoUrl || "",
      });
    }
  }, [player]);

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
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to publish profile");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile Published",
        description: "Your profile is now visible to supporters!",
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
  const {
    data: stripeStatus,
    isLoading: stripeStatusLoading,
    isError: stripeStatusError,
    isFetching: stripeStatusFetching,
  } = useQuery<StripeStatusResponse>({
    queryKey: ["/api/payments/stripe/status"],
    enabled: !!player,          // only when logged-in player loaded
    retry: false,
    queryFn: async () => {
      const res = await fetch("/api/payments/stripe/status");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch Stripe status");
      }
      return res.json();
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

  const resetStripeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/players/me/reset-stripe", {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to reset Stripe connection");
      }
      return res.json();
    },
    onSuccess: () => {
      // force refetch of auth & Stripe status
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/stripe/status"] });

      toast({
        title: "Stripe Connection Reset",
        description: "Your Stripe account has been disconnected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: ProfileFormState) => {
      const res = await fetch("/api/players/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || !form || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const initials = player.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  // IMPORTANT: Stripe readiness ONLY comes from stripeStatus,
  // not from stale `player` data.
  const stripeHasAccount = stripeStatus?.hasAccount ?? false;
  const stripeReady = stripeStatus?.stripeReady ?? false;

  const handleFormChange = (field: keyof ProfileFormState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    updateProfileMutation.mutate(form);
  };

  const handleCancelEdit = () => {
    setForm({
      email: player.email || "",
      fullName: player.fullName || "",
      age: player.age != null ? String(player.age) : "",
      country: player.country || "",
      location: player.location || "",
      ranking: player.ranking != null ? String(player.ranking) : "",
      specialization: player.specialization || "",
      bio: player.bio || "",
      fundingGoals: player.fundingGoals || "",
      videoUrl: player.videoUrl || "",
      atpProfileUrl: (player as any).atpProfileUrl || "",
      photoUrl: player.photoUrl || "",
    });
    setIsEditing(false);
  };

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
                    {initials || <User className="h-16 w-16" />}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-2">{player.fullName}</h2>
                <p className="text-muted-foreground mb-1">{player.email}</p>
                {player.country && (
                  <p className="text-muted-foreground mb-4">
                    {player.location ? `${player.location}, ` : ""}
                    {player.country}
                  </p>
                )}
                <div className="w-full space-y-2 mb-4">
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
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => setIsEditing((v) => !v)}
                  className="w-full"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" /> Cancel Edit
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" /> Edit Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Player Information</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Update your tennis profile details"
                    : "Your tennis profile details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Full name</label>
                        <Input
                          value={form.fullName}
                          onChange={(e) =>
                            handleFormChange("fullName", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            handleFormChange("email", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Age</label>
                        <Input
                          type="number"
                          value={form.age}
                          onChange={(e) =>
                            handleFormChange("age", e.target.value)
                          }
                          min={13}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Country</label>
                        <Input
                          value={form.country}
                          onChange={(e) =>
                            handleFormChange("country", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={form.location}
                          onChange={(e) =>
                            handleFormChange("location", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">
                          Ranking (ATP/WTA/ITF)
                        </label>
                        <Input
                          type="number"
                          value={form.ranking}
                          onChange={(e) =>
                            handleFormChange("ranking", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Specialization
                      </label>
                      <Input
                        value={form.specialization}
                        onChange={(e) =>
                          handleFormChange("specialization", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">Bio</label>
                      <Textarea
                        value={form.bio}
                        onChange={(e) =>
                          handleFormChange("bio", e.target.value)
                        }
                        rows={4}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        What are you raising funds for?
                      </label>
                      <Textarea
                        value={form.fundingGoals}
                        onChange={(e) =>
                          handleFormChange("fundingGoals", e.target.value)
                        }
                        rows={4}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">
                          Verification / intro video URL
                        </label>
                        <Input
                          value={form.videoUrl}
                          onChange={(e) =>
                            handleFormChange("videoUrl", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">
                          ATP / ITF / WTA profile URL
                        </label>
                        <Input
                          value={form.atpProfileUrl}
                          onChange={(e) =>
                            handleFormChange("atpProfileUrl", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium">
                          Profile photo URL (optional)
                        </label>
                        <Input
                          value={form.photoUrl}
                          onChange={(e) =>
                            handleFormChange("photoUrl", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Save changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center text-muted-foreground mb-1">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">Location</span>
                        </div>
                        <p className="font-medium">
                          {player.location || "Not set"}
                        </p>
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
                        <p className="font-medium">
                          {player.specialization || "Not set"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-muted-foreground mb-1">
                          <span className="text-sm">Bio</span>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {player.bio || "No story added yet."}
                        </p>
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
                                You&apos;ll receive an email once your profile
                                has been approved and you can publish it so
                                supporters can discover you.
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
                                Unfortunately, your application was not approved
                                at this time. If you have questions or would
                                like to reapply, please contact our support
                                team.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {player.approvalStatus === "approved" &&
                        !player.published && (
                          <div className="bg-muted/50 p-4 rounded-md space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Your profile has been approved! Publish it now to
                              make it visible to supporters and start receiving
                              help with travel, coaching, and tournament costs.
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
                            Your profile is live and visible to supporters!
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
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
                      Connect a Stripe Express account so supporters can send
                      you funds in the future. Right now this is in{" "}
                      <strong>test mode</strong> for your own experimentation.
                    </CardDescription>
                  </div>
                  {stripeStatusFetching && (
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  )}
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="text-sm text-muted-foreground max-w-xl space-y-2">
                    {stripeStatusLoading && (
                      <p>Checking your Stripe payout status…</p>
                    )}
                    {stripeStatusError && (
                      <p className="text-red-600">
                        We couldn&apos;t check your Stripe status. You can try
                        again or reset the connection below.
                      </p>
                    )}
                    {!stripeStatusLoading && !stripeStatusError && (
                      <>
                        {!stripeHasAccount && (
                          <p>
                            When you click the button, you&apos;ll be taken to
                            Stripe to complete onboarding. Use{" "}
                            <strong>test details</strong> only. After you
                            return, this card will update when your payouts are
                            ready.
                          </p>
                        )}
                        {stripeHasAccount && !stripeReady && (
                          <p>
                            Your Stripe Express account is created but payouts
                            are not fully enabled yet. Open Stripe onboarding to
                            finish any remaining steps.
                          </p>
                        )}
                        {stripeReady && (
                          <p>
                            Your Stripe Express account looks ready in test
                            mode. You can re-run onboarding if you want to test
                            again.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                    {stripeHasAccount && (
                      <Button
                        variant="destructive"
                        onClick={() => resetStripeMutation.mutate()}
                        disabled={resetStripeMutation.isPending}
                      >
                        {resetStripeMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Stripe Connection
                          </>
                        )}
                      </Button>
                    )}
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
