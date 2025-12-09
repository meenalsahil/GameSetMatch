import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Player {
  id: number;
  fullName: string;
  email: string;
  age: number;
  country: string;
  location: string;
  ranking: number | null;
  specialization: string;
  bio: string;
  fundingGoals: string;
  videoUrl: string | null;
  atpProfileUrl: string | null;
  photoUrl: string | null;
  published: boolean;
  featured: boolean;
  approvalStatus: string;
  active: boolean;

  // ATP Verification fields
  atpVerified: boolean;
  atpVerificationScore: number | null;
  atpFirstNameMatch: boolean;
  atpLastNameMatch: boolean;
  atpCountryMatch: boolean;
  atpAgeMatch: boolean;
  atpDiscrepancies: string | null;
  atpCurrentRanking: number | null;
  atpLastChecked: string | null;
}

function ATPVerificationBadge({ player }: { player: Player }) {
  const score = player.atpVerificationScore || 0;

  if (!player.atpProfileUrl) {
    return (
      <Badge variant="outline" className="bg-gray-100">
        No ATP Profile
      </Badge>
    );
  }

  if (score >= 75) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-300">
        <CheckCircle className="w-3 h-3 mr-1" />
        ATP Verified ({score}/100)
      </Badge>
    );
  } else if (score >= 50) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
        <AlertCircle className="w-3 h-3 mr-1" />
        Partial Match ({score}/100)
      </Badge>
    );
  } else if (score > 0) {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-300">
        <XCircle className="w-3 h-3 mr-1" />
        Mismatch ({score}/100)
      </Badge>
    );
  }

  return <Badge variant="outline">Not Verified</Badge>;
}

function ATPVerificationDetails({ player }: { player: Player }) {
  if (!player.atpProfileUrl) return null;

  let discrepancies: string[] = [];
  if (player.atpDiscrepancies) {
    try {
      discrepancies = JSON.parse(player.atpDiscrepancies);
    } catch {
      discrepancies = [];
    }
  }

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-md space-y-2 text-sm">
      <div className="font-semibold text-gray-700">
        ATP Verification Breakdown:
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          {player.atpFirstNameMatch ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span>First Name</span>
        </div>

        <div className="flex items-center gap-2">
          {player.atpLastNameMatch ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span>Last Name</span>
        </div>

        <div className="flex items-center gap-2">
          {player.atpCountryMatch ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span>Country</span>
        </div>

        <div className="flex items-center gap-2">
          {player.atpAgeMatch ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span>Age</span>
        </div>
      </div>

      {player.atpCurrentRanking && (
        <div className="text-gray-600">
          <strong>ATP Ranking:</strong> #{player.atpCurrentRanking}
        </div>
      )}

      {discrepancies.length > 0 && (
        <div className="text-red-600 text-xs">
          <strong>Issues:</strong>
          <div className="mt-1">
            {discrepancies.map((d, i) => (
              <div key={i}>• {d}</div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <a
          href={player.atpProfileUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-xs flex items-center gap-1"
        >
          View ATP Profile <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

function PlayerVideo({ player }: { player: Player }) {
  if (!player.videoUrl) return null;

  const isLocalUpload = player.videoUrl.startsWith("/uploads");
  const isYouTube = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(
    player.videoUrl
  );

  return (
    <div className="mt-4">
      <h4 className="font-semibold text-sm mb-2">Verification Video</h4>

      {isLocalUpload ? (
        <video
          controls
          className="w-full max-w-md rounded-md border bg-black"
        >
          <source src={player.videoUrl} />
          Your browser does not support the video tag.
        </video>
      ) : isYouTube ? (
        <div className="aspect-video w-full max-w-md rounded-md overflow-hidden border">
          <iframe
            src={player.videoUrl.replace("watch?v=", "embed/")}
            title="Verification Video"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          href={player.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
        >
          Watch video <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/admin/players"],
  });

  const approveMutation = useMutation({
    mutationFn: async (playerId: number) => {
      const res = await fetch(`/api/admin/players/${playerId}/approve`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({ title: "Player approved successfully" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (playerId: number) => {
      const res = await fetch(`/api/admin/players/${playerId}/reject`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reject");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({ title: "Player rejected" });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (playerId: number) => {
      const res = await fetch(`/api/admin/players/${playerId}/deactivate`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to deactivate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({ title: "Player deactivated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (playerId: number) => {
      const res = await fetch(`/api/admin/players/${playerId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({ title: "Player deleted" });
    },
  });

  if (isLoading) {
    return <div className="container mx-auto px-6 py-12">Loading...</div>;
  }

  const pendingPlayers = players.filter((p) => p.approvalStatus === "pending");
  const activePlayers = players.filter(
    (p) => p.approvalStatus === "approved" && p.active
  );
  const inactivePlayers = players.filter((p) => !p.active);

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Pending Applications */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Pending ({pendingPlayers.length})
        </h2>
        <div className="space-y-4">
          {pendingPlayers.map((player) => (
            <Card key={player.id} className="p-6">
              <div className="flex justify-between items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{player.fullName}</h3>
                    <ATPVerificationBadge player={player} />
                  </div>

                  <p className="text-gray-600">{player.email}</p>

                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <div>
                      <strong>Age:</strong> {player.age}
                    </div>
                    <div>
                      <strong>Country:</strong> {player.country}
                    </div>
                    <div>
                      <strong>Location:</strong> {player.location}
                    </div>
                    {player.ranking && (
                      <div>
                        <strong>Ranking:</strong> #{player.ranking}
                      </div>
                    )}
                    <div>
                      <strong>Specialization:</strong> {player.specialization}
                    </div>
                  </div>

                  <ATPVerificationDetails player={player} />
                  <PlayerVideo player={player} />
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => approveMutation.mutate(player.id)}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate(player.id)}
                    disabled={rejectMutation.isPending}
                    variant="outline"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {pendingPlayers.length === 0 && (
            <p className="text-gray-500">No pending applications</p>
          )}
        </div>
      </section>

      {/* Active Players */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Active Players ({activePlayers.length})
        </h2>
        <div className="space-y-4">
          {activePlayers.map((player) => (
            <Card key={player.id} className="p-6 bg-green-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-green-600">Active</Badge>
                    <h3 className="text-lg font-semibold">{player.fullName}</h3>
                    <ATPVerificationBadge player={player} />
                  </div>
                  <p className="text-gray-600">{player.email}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => deactivateMutation.mutate(player.id)}
                    disabled={deactivateMutation.isPending}
                    variant="outline"
                    size="sm"
                  >
                    Deactivate
                  </Button>
                  <Button
                    onClick={() => deleteMutation.mutate(player.id)}
                    disabled={deleteMutation.isPending}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Inactive Players */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Inactive Players ({inactivePlayers.length})
        </h2>
        <div className="space-y-4">
          {inactivePlayers.map((player) => (
            <Card key={player.id} className="p-6 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline">Inactive</Badge>
                    <h3 className="text-lg font-semibold text-gray-600">
                      {player.fullName}
                    </h3>
                  </div>
                  <p className="text-gray-500">{player.email}</p>
                </div>

                <Button
                  onClick={() => deleteMutation.mutate(player.id)}
                  disabled={deleteMutation.isPending}
                  variant="destructive"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
