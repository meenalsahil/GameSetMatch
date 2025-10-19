import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { User, MapPin, Trophy, CheckCircle2, XCircle, LogOut, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
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
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      if (!res.ok) {
        throw new Error("Logout failed");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
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
    .map(n => n[0])
    .join("")
    .toUpperCase();

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
                <p className="text-muted-foreground">Welcome back, {player.fullName}!</p>
              </div>
              <div className="flex gap-2">
                {player.isAdmin && (
                  <Button asChild variant="destructive" data-testid="button-admin-dashboard">
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
                    <Badge className="w-full justify-center" variant="secondary">
                      <XCircle className="h-4 w-4 mr-2" />
                      Not Published
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Player Information</CardTitle>
                <CardDescription>
                  Your tennis profile details
                </CardDescription>
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
                  {!player.published && (
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="text-sm text-muted-foreground mb-4">
                        Your profile is currently not visible to sponsors. Once you're ready, publish your profile to start receiving sponsorship opportunities.
                      </p>
                      <Button
                        onClick={() => publishMutation.mutate()}
                        disabled={publishMutation.isPending}
                        data-testid="button-publish"
                      >
                        {publishMutation.isPending ? "Publishing..." : "Publish Profile"}
                      </Button>
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
        </div>
      </div>
      <Footer />
    </div>
  );
}
