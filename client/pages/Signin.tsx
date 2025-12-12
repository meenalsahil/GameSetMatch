// client/src/pages/Signin.tsx
import { useState, useEffect } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Footer from "@/components/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

type SigninForm = z.infer<typeof signinSchema>;

export default function Signin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const form = useForm<SigninForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signinMutation = useMutation({
    mutationFn: async (data: SigninForm) => {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        // Check if it's a verification required error
        if (responseData.requiresVerification) {
          throw { 
            type: "verification_required", 
            email: responseData.email,
            message: responseData.message 
          };
        }
        throw new Error(responseData.message || "Signin failed");
      }

      return responseData;
    },
   onSuccess: async () => {
      // Wait for auth query to refetch before redirecting
      await queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Welcome back!",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      if (error.type === "verification_required") {
        setRequiresVerification(true);
        setUnverifiedEmail(error.email || form.getValues("email"));
      } else {
        toast({
          title: "Signin Failed",
          description: error.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to resend");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification link.",
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

  const onSubmit = (data: SigninForm) => {
    setRequiresVerification(false);
    signinMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center py-20">
        <Card className="max-w-md w-full mx-6 p-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-card-foreground mb-2">
              Player Sign In
            </h1>
            <p className="text-muted-foreground">
              Sign in to your GameSetMatch account
            </p>
          </div>

          {/* Email Verification Required Banner */}
          {requiresVerification && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Email Verification Required
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    Please verify your email address before signing in. Check your inbox for the verification link.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resendMutation.mutate(unverifiedEmail)}
                    disabled={resendMutation.isPending}
                    className="border-amber-300 hover:bg-amber-100"
                  >
                    {resendMutation.isPending ? "Sending..." : "Resend Verification Email"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-primary hover:underline"
                        data-testid="link-forgot-password"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                data-testid="button-signin"
                disabled={signinMutation.isPending}
              >
                {signinMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/signup/player"
                className="text-primary hover:underline"
                data-testid="link-signup"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
}