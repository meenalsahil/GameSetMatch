import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { Lock, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token");
    if (resetToken) {
      setToken(resetToken);
    } else {
      toast({
        title: "Error",
        description: "Invalid reset link",
        variant: "destructive",
      });
      setTimeout(() => navigate("/signin"), 2000);
    }
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setIsSuccess(true);
      toast({
        title: "Success",
        description: "Your password has been reset successfully",
      });

      setTimeout(() => navigate("/signin"), 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="w-full max-w-md px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              {isSuccess ? (
                <CheckCircle className="h-8 w-8 text-primary" />
              ) : (
                <Lock className="h-8 w-8 text-primary" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isSuccess ? "Password Reset!" : "Reset Password"}
            </h1>
            <p className="text-muted-foreground">
              {isSuccess
                ? "Redirecting you to sign in..."
                : "Enter your new password below"}
            </p>
          </div>

          <Card className="p-8">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    data-testid="input-new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    data-testid="input-confirm-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="button-reset-password"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>

                <div className="text-center">
                  <Link href="/signin" className="text-sm text-primary hover:underline">
                    Back to Sign In
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-foreground">
                  Your password has been successfully reset.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can now sign in with your new password.
                </p>
                <Button asChild className="w-full">
                  <Link href="/signin">Go to Sign In</Link>
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
