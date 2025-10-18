import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { signupPlayerSchema, type SignupPlayer } from "@shared/schema";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PlayerSignup() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<SignupPlayer>({
    resolver: zodResolver(signupPlayerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      location: "",
      ranking: "",
      specialization: "",
      bio: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupPlayer) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Signup failed");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Welcome to Matchpoint! You can now complete your profile.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: SignupPlayer) => {
    signupMutation.mutate(data);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof SignupPlayer)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ["email", "password", "fullName"];
    } else if (step === 2) {
      fieldsToValidate = ["location", "ranking", "specialization"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container mx-auto px-6">
            <Button asChild variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <Link href="/how-it-works">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Player Application
            </h1>
            <p className="text-lg text-muted-foreground">
              Join Matchpoint and connect with sponsors for your tennis journey
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full mx-1 ${
                    s <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Step {step} of 3
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-card-foreground mb-6">
                    Account Information
                  </h2>
                  <div className="space-y-4">
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
                          <FormLabel>Password</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your full name"
                              data-testid="input-fullname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              )}

              {step === 2 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-card-foreground mb-6">
                    Player Profile
                  </h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City, Country"
                              data-testid="input-location"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ranking"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Ranking (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 234"
                              data-testid="input-ranking"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialization</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Clay Court, Hard Court, Grass Court"
                              data-testid="input-specialization"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              )}

              {step === 3 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-card-foreground mb-6">
                    About You
                  </h2>
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Story</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell sponsors about your tennis journey, goals, and why you need support..."
                            className="min-h-[200px]"
                            data-testid="input-bio"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              )}

              <div className="flex justify-between gap-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    data-testid="button-previous"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto"
                    data-testid="button-next"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto" data-testid="button-submit">
                    Submit Application
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
