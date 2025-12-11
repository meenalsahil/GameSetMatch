// client/src/pages/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

export default function VerifyEmail() {
  const [location, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already-verified">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    // Call the verification API
    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email/${token}`);
        const data = await res.json();

        if (res.ok) {
          if (data.alreadyVerified) {
            setStatus("already-verified");
            setMessage("Your email is already verified. You can sign in now.");
          } else {
            setStatus("success");
            setMessage(data.message || "Email verified successfully!");
          }
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify email. Please try again.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred. Please try again later.");
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center py-20">
        <Card className="max-w-md w-full mx-6 p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-card-foreground mb-2">
                Verifying Your Email
              </h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground mb-2">
                Email Verified!
              </h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  Your profile has been submitted for review. Our admin team will review your application and notify you once approved.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/signin">Sign In to Your Account</Link>
              </Button>
            </>
          )}

          {status === "already-verified" && (
            <>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-12 w-12 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground mb-2">
                Already Verified
              </h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <Button asChild className="w-full">
                <Link href="/signin">Sign In</Link>
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground mb-2">
                Verification Failed
              </h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signin">
                    <Mail className="h-4 w-4 mr-2" />
                    Try Signing In
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Need a new verification link?{" "}
                  <Link href="/resend-verification" className="text-primary hover:underline">
                    Resend verification email
                  </Link>
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
}
