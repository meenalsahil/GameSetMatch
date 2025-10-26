import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
  const form = useForm<SignupPlayer>({
    resolver: zodResolver(signupPlayerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      age: 18,
      country: "",
      location: "",
      ranking: undefined,
      specialization: "",
      bio: "",
      fundingGoals: "",
      videoUrl: "",
      atpProfileUrl: "",
    },
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const onSubmit = async (values: SignupPlayer) => {
    try {
      const formData = new FormData();

      // Add all text fields
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("fullName", values.fullName);
      formData.append("age", values.age.toString());
      formData.append("country", values.country);
      formData.append("location", values.location);
      if (values.ranking) formData.append("ranking", values.ranking.toString());
      formData.append("specialization", values.specialization);
      formData.append("bio", values.bio);
      formData.append("fundingGoals", values.fundingGoals);
      if (values.videoUrl) formData.append("videoUrl", values.videoUrl);
      if (values.atpProfileUrl)
        formData.append("atpProfileUrl", values.atpProfileUrl);

      // Add photo file
      if (values.photo) {
        formData.append("photo", values.photo);
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Signup failed");
      }

      window.location.href = "/thank-you";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign up",
        variant: "destructive",
      });
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof SignupPlayer)[] = [];

    if (step === 1) {
      fieldsToValidate = ["email", "password", "fullName", "age", "country"];
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
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mb-4"
              data-testid="button-back"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Player Application
            </h1>
            <p className="text-lg text-muted-foreground">
              Join GameSetMatch and connect with sponsors for your tennis
              journey
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
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Your age"
                              data-testid="input-age"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  parseInt(e.target.value) || undefined,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., United States, Spain, Australia"
                              data-testid="input-country"
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
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Story</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell sponsors about your tennis journey, goals, and why you need support..."
                              className="min-h-[150px]"
                              data-testid="input-bio"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fundingGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What are you raising funds for?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Travel to ATP Challenger series, new equipment, coaching, tournament entry fees..."
                              className="min-h-[100px]"
                              data-testid="input-funding-goals"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="videoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video Link (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="YouTube or Vimeo link of you playing"
                              data-testid="input-video-url"
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
                      name="atpProfileUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ATP/ITF Profile URL (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://www.atptour.com/en/players/..."
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Link to your ATP Tour, ITF Tennis, or WTA profile
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="photo"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                          <FormLabel>Profile Photo</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert("File size must be less than 5MB");
                                    e.target.value = "";
                                    return;
                                  }
                                  onChange(file);
                                }
                              }}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Upload a professional photo (JPG, PNG, GIF - max
                            5MB)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                  <Button
                    type="submit"
                    className="ml-auto"
                    data-testid="button-submit"
                  >
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
