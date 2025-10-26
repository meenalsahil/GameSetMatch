import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { Mail } from "lucide-react";
import { Link } from "wouter";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }

      setIsSubmitted(true);
      toast({
        title: "Email Sent",
        description: "If an account exists with that email, a reset link has been sent.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process password reset request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="w-full max-w-md px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Forgot Password?
            </h1>
            <p className="text-muted-foreground">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <Card className="p-8">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-forgot-password-email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="button-send-reset-link"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
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
                  If an account exists with <strong>{email}</strong>, you will receive a password reset email shortly.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please check your inbox and spam folder.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signin">Return to Sign In</Link>
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
