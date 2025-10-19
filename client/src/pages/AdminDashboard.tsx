import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { player } = useAuth();
  const [playerToDelete, setPlayerToDelete] = useState<string | null>(null);

  // Redirect if not admin
  if (player && !player.isAdmin) {
    setLocation("/dashboard");
  }

  // Store current player ID in window for easy access in row rendering
  if (player) {
    (window as any).__currentPlayerId = player.id;
  }

  const { data: players, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/players"],
    enabled: !!player?.isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: async (playerId: string) => {
      return apiRequest("DELETE", `/api/admin/players/${playerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({
        title: "Success",
        description: "Player account deleted successfully",
      });
      setPlayerToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete player",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (playerId: string) => {
      return apiRequest("POST", `/api/admin/players/${playerId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({
        title: "Success",
        description: "Player application approved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve player",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (playerId: string) => {
      return apiRequest("POST", `/api/admin/players/${playerId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/players"] });
      toast({
        title: "Success",
        description: "Player application rejected",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject player",
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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all player accounts</p>
        </div>

        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-card-foreground">
              All Players ({players?.length || 0})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players?.map((player: any) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.fullName}</TableCell>
                    <TableCell>{player.email}</TableCell>
                    <TableCell>{player.location}</TableCell>
                    <TableCell>
                      {player.approvalStatus === 'approved' ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Approved
                        </Badge>
                      ) : player.approvalStatus === 'rejected' ? (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {player.published ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Yes
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {player.isAdmin ? (
                        <Badge variant="destructive">Admin</Badge>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(player.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {player.id === (window as any).__currentPlayerId ? (
                        <span className="text-xs text-muted-foreground">You</span>
                      ) : (
                        <div className="flex gap-1">
                          {player.approvalStatus === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => approveMutation.mutate(player.id)}
                                data-testid={`button-approve-${player.id}`}
                                disabled={approveMutation.isPending}
                              >
                                <ThumbsUp className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => rejectMutation.mutate(player.id)}
                                data-testid={`button-reject-${player.id}`}
                                disabled={rejectMutation.isPending}
                              >
                                <ThumbsDown className="h-4 w-4 text-orange-600" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPlayerToDelete(player.id)}
                            data-testid={`button-delete-${player.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!players || players.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No players found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <AlertDialog open={!!playerToDelete} onOpenChange={() => setPlayerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this player account and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => playerToDelete && deleteMutation.mutate(playerToDelete)}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
