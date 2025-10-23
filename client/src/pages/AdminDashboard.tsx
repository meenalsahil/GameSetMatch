import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  Shield,
  CheckCircle,
  XCircle,
  Mail,
  MapPin,
  Trophy,
  LogOut,
} from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";

interface Player {
  id: string;
  fullName: string;
  email: string;
  age: number;
  country: string;
  location: string;
  ranking?: string;
  specialization: string;
  bio: string;
  approvalStatus: "pending" | "approved" | "rejected";
  published: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { player, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !player?.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "You don't have admin access.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, player, setLocation, toast]);

  const { data: players, isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/admin/players"],
    queryFn: async () => {
      const res = await fetch("/api/admin/players");
      if (!res.ok) throw new Error("Failed to fetch players");
      return res.json();
    },
    enabled: !!player?.isAdmin,
  });
  // ADD THIS DEBUG CODE:
  console.log("Players data:", players);
  console.log("Pending players:", pendingPlayers);
  console.log("Approved players:", approvedPlayers);
  console.log("Rejected players:", rejectedPlayers);

  const approveMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const res = await fetch(`/api/admin/players/${playerId}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to approve player");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({
        title: "Player Approved",
        description: "Player has been approved successfully.",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const res = await fetch(`/api/admin/players/${playerId}/reject`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to reject player");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({
        title: "Player Rejected",
        description: "Player has been rejected.",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      return res.json();
    },
    onSuccess: () => {
      // Set to null first
      queryClient.setQueryData(["/api/auth/me"], null);

      // Then invalidate
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

      toast({ title: "Signed out successfully" });
      setLocation("/");
    },
  });

  if (isLoading || !player?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const pendingPlayers =
    players?.filter((p) => p.approvalStatus === "pending") || [];
  const approvedPlayers =
    players?.filter((p) => p.approvalStatus === "approved") || [];
  const rejectedPlayers =
    players?.filter((p) => p.approvalStatus === "rejected") || [];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="bg-gradient-to-b from-red-50 to-background dark:from-red-950/20 py-12">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-8 w-8 text-red-600" />
                  <h1 className="text-4xl font-bold text-foreground">
                    Admin Dashboard
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Manage player applications and approvals
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/dashboard">My Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">
                    {players?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Players</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-orange-600">
                    {pendingPlayers.length}
                  </p>
                  <p className="text-sm text-orange-600">Pending Approval</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">
                    {approvedPlayers.length}
                  </p>
                  <p className="text-sm text-green-600">Approved</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600">
                    {rejectedPlayers.length}
                  </p>
                  <p className="text-sm text-red-600">Rejected</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Players */}
          {pendingPlayers.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <span className="inline-flex h-3 w-3 rounded-full bg-orange-500 animate-pulse"></span>
                  Pending Approvals ({pendingPlayers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingPlayers.map((p) => (
                    <Card key={p.id} className="border-orange-200">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold mb-2">
                                  {p.fullName}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {p.email}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {p.location}
                                  </div>
                                  <div>Age: {p.age}</div>
                                  <div>Country: {p.country}</div>
                                  {p.ranking && (
                                    <div className="flex items-center gap-2">
                                      <Trophy className="h-4 w-4" />
                                      Ranking: {p.ranking}
                                    </div>
                                  )}
                                  <div>Specialization: {p.specialization}</div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {p.bio}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveMutation.mutate(p.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectMutation.mutate(p.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approved Players */}
          {approvedPlayers.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Approved Players ({approvedPlayers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvedPlayers.map((p) => (
                    <Card
                      key={p.id}
                      className="border-green-200 bg-green-50/50 dark:bg-green-950/10"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold">{p.fullName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {p.email}
                            </p>
                          </div>
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejected Players */}
          {rejectedPlayers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Rejected Players ({rejectedPlayers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rejectedPlayers.map((p) => (
                    <Card
                      key={p.id}
                      className="border-red-200 bg-red-50/50 dark:bg-red-950/10"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold">{p.fullName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {p.email}
                            </p>
                          </div>
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
